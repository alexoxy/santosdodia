#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdtempSync,
  openSync,
  closeSync,
  readSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { pipeline } from 'node:stream/promises';

const DROPBOX_CONTENT_BLOCK_BYTES = 4 * 1024 * 1024;
const DROPBOX_DIRECT_UPLOAD_BYTES = 140 * 1024 * 1024;
const DROPBOX_SESSION_CHUNK_BYTES = 8 * 1024 * 1024;
const DEFAULT_SLOT_COUNT = 8;

function parseArguments(argv) {
  const options = { sources: [], slots: DEFAULT_SLOT_COUNT, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const [name, inlineValue] = argument.split('=', 2);
    const value = inlineValue ?? argv[index + 1];
    if (name === '--stream') options.stream = value;
    else if (name === '--source') options.sources.push(value);
    else if (name === '--slots') options.slots = Number(value);
    else if (name === '--run-number') options.runNumber = Number(value);
    else if (name === '--dry-run') {
      options.dryRun = true;
      continue;
    } else throw new Error(`Unknown argument: ${argument}`);
    if (inlineValue === undefined) index += 1;
  }
  return options;
}

function validateOptions(options, root) {
  if (!options.stream || !/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?(?:\/[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)*$/.test(options.stream)) {
    throw new Error('Stream must contain only lowercase path segments, digits and internal hyphens.');
  }
  if (!Number.isInteger(options.slots) || options.slots < 1 || options.slots > 32) {
    throw new Error('Slot count must be an integer between 1 and 32.');
  }
  if (options.sources.length === 0) throw new Error('At least one --source is required.');

  const uniqueSources = [...new Set(options.sources)].sort();
  for (const source of uniqueSources) {
    if (!source || isAbsolute(source) || source.split(/[\\/]/).includes('..')) {
      throw new Error(`Source must be a repository-relative path: ${source}`);
    }
    const absolute = resolve(root, source);
    if (!existsSync(absolute)) throw new Error(`Archive source does not exist: ${source}`);
    const real = realpathSync(absolute);
    if (real !== root && !real.startsWith(`${root}${sep}`)) {
      throw new Error(`Archive source resolves outside the repository: ${source}`);
    }
  }
  options.sources = uniqueSources;

  const runNumber = options.runNumber ?? Number(process.env.GITHUB_RUN_NUMBER);
  if (!Number.isInteger(runNumber) || runNumber < 1) {
    throw new Error('GITHUB_RUN_NUMBER or --run-number must be a positive integer.');
  }
  options.runNumber = runNumber;
}

function waitForProcess(child, name, stderrChunks = []) {
  return new Promise((resolvePromise, rejectPromise) => {
    child.once('error', rejectPromise);
    child.once('close', (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${name} exited with code ${code}: ${Buffer.concat(stderrChunks).toString('utf8').trim()}`));
    });
  });
}

async function createDeterministicArchive(root, sources, destination) {
  const tarStderr = [];
  const gzipStderr = [];
  const tar = spawn('tar', [
    '--sort=name',
    '--mtime=@0',
    '--owner=0',
    '--group=0',
    '--numeric-owner',
    '--format=posix',
    '--pax-option=delete=atime,delete=ctime',
    '-cf',
    '-',
    '--',
    ...sources,
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  const gzip = spawn('gzip', ['-n', '-9'], { stdio: ['pipe', 'pipe', 'pipe'] });
  tar.stderr.on('data', (chunk) => tarStderr.push(chunk));
  gzip.stderr.on('data', (chunk) => gzipStderr.push(chunk));

  await Promise.all([
    pipeline(tar.stdout, gzip.stdin),
    pipeline(gzip.stdout, createWriteStream(destination, { mode: 0o600 })),
    waitForProcess(tar, 'tar', tarStderr),
    waitForProcess(gzip, 'gzip', gzipStderr),
  ]);
}

function sha256File(path) {
  const hash = createHash('sha256');
  const descriptor = openSync(path, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    while (true) {
      const bytes = readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytes === 0) break;
      hash.update(buffer.subarray(0, bytes));
    }
  } finally {
    closeSync(descriptor);
  }
  return hash.digest('hex');
}

function dropboxContentHash(path) {
  const aggregate = createHash('sha256');
  const descriptor = openSync(path, 'r');
  const buffer = Buffer.allocUnsafe(DROPBOX_CONTENT_BLOCK_BYTES);
  try {
    while (true) {
      const bytes = readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytes === 0) break;
      aggregate.update(createHash('sha256').update(buffer.subarray(0, bytes)).digest());
    }
  } finally {
    closeSync(descriptor);
  }
  return aggregate.digest('hex');
}

async function readJsonResponse(response, operation) {
  const text = await response.text();
  let value = {};
  if (text) {
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error(`${operation} returned invalid JSON (HTTP ${response.status}).`);
    }
  }
  if (!response.ok) {
    const summary = value.error_summary ?? value.error_description ?? value.error?.['.tag'] ?? 'unknown_error';
    throw new Error(`${operation} failed (HTTP ${response.status}): ${summary}`);
  }
  return value;
}

function uploadHeaders(token, argument) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/octet-stream',
    'Dropbox-API-Arg': JSON.stringify(argument),
  };
}

function commitArgument(path) {
  return {
    autorename: false,
    mode: 'overwrite',
    mute: true,
    path,
    strict_conflict: false,
  };
}

function rangedBody(path, start, length) {
  if (length === 0) return Buffer.alloc(0);
  return createReadStream(path, { start, end: start + length - 1 });
}

async function uploadDirect(token, localPath, remotePath) {
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: uploadHeaders(token, commitArgument(remotePath)),
    body: createReadStream(localPath),
    duplex: 'half',
  });
  return readJsonResponse(response, `Dropbox upload ${remotePath}`);
}

async function uploadSession(token, localPath, remotePath, size) {
  const firstLength = Math.min(DROPBOX_SESSION_CHUNK_BYTES, size);
  let response = await fetch('https://content.dropboxapi.com/2/files/upload_session/start', {
    method: 'POST',
    headers: uploadHeaders(token, { close: false }),
    body: rangedBody(localPath, 0, firstLength),
    duplex: 'half',
  });
  const started = await readJsonResponse(response, 'Dropbox upload session start');
  const sessionId = started.session_id;
  if (!sessionId) throw new Error('Dropbox upload session did not return a session ID.');

  let offset = firstLength;
  while (size - offset > DROPBOX_SESSION_CHUNK_BYTES) {
    response = await fetch('https://content.dropboxapi.com/2/files/upload_session/append_v2', {
      method: 'POST',
      headers: uploadHeaders(token, {
        close: false,
        cursor: { offset, session_id: sessionId },
      }),
      body: rangedBody(localPath, offset, DROPBOX_SESSION_CHUNK_BYTES),
      duplex: 'half',
    });
    await readJsonResponse(response, 'Dropbox upload session append');
    offset += DROPBOX_SESSION_CHUNK_BYTES;
  }

  const finalLength = size - offset;
  response = await fetch('https://content.dropboxapi.com/2/files/upload_session/finish', {
    method: 'POST',
    headers: uploadHeaders(token, {
      commit: commitArgument(remotePath),
      cursor: { offset, session_id: sessionId },
    }),
    body: rangedBody(localPath, offset, finalLength),
    duplex: 'half',
  });
  return readJsonResponse(response, `Dropbox upload session finish ${remotePath}`);
}

async function uploadFile(token, localPath, remotePath, expectedDropboxHash) {
  const size = statSync(localPath).size;
  const metadata = size <= DROPBOX_DIRECT_UPLOAD_BYTES
    ? await uploadDirect(token, localPath, remotePath)
    : await uploadSession(token, localPath, remotePath, size);
  if (metadata.size !== size) throw new Error(`Dropbox size verification failed for ${remotePath}.`);
  if (expectedDropboxHash && metadata.content_hash !== expectedDropboxHash) {
    throw new Error(`Dropbox content hash verification failed for ${remotePath}.`);
  }
  return metadata;
}

async function refreshAccessToken() {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  if (!appKey || !appSecret || !refreshToken) {
    throw new Error('DROPBOX_APP_KEY, DROPBOX_APP_SECRET and DROPBOX_REFRESH_TOKEN are required.');
  }
  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  const value = await readJsonResponse(response, 'Dropbox access token refresh');
  if (!value.access_token) throw new Error('Dropbox token refresh returned no access token.');
  return value.access_token;
}

async function main() {
  const root = realpathSync(process.env.GITHUB_WORKSPACE || process.cwd());
  const options = parseArguments(process.argv.slice(2));
  validateOptions(options, root);

  const slot = String(((options.runNumber - 1) % options.slots) + 1).padStart(2, '0');
  const basePath = `/archive/${options.stream}`;
  const packagePath = `${basePath}/slots/${slot}/package.tar.gz`;
  const receiptPath = `${basePath}/slots/${slot}/receipt.json`;
  const indexPath = `${basePath}/index.json`;
  const temporary = mkdtempSync(join(tmpdir(), 'santosdodia-dropbox-'));
  const archiveFile = join(temporary, 'package.tar.gz');
  const receiptFile = join(temporary, 'receipt.json');
  const indexFile = join(temporary, 'index.json');

  try {
    await createDeterministicArchive(root, options.sources, archiveFile);
    const size = statSync(archiveFile).size;
    const sha256 = sha256File(archiveFile);
    const contentHash = dropboxContentHash(archiveFile);
    const createdAt = new Date().toISOString();
    const common = {
      schemaVersion: 1,
      stream: options.stream,
      policy: { kind: 'fixed-ring', slots: options.slots },
      current: {
        slot,
        archivePath: packagePath,
        receiptPath,
        bytes: size,
        sha256,
        dropboxContentHash: contentHash,
        sources: options.sources,
        run: {
          repository: process.env.GITHUB_REPOSITORY ?? null,
          id: process.env.GITHUB_RUN_ID ?? null,
          number: options.runNumber,
          attempt: Number(process.env.GITHUB_RUN_ATTEMPT ?? 1),
          commit: process.env.GITHUB_SHA ?? null,
        },
        createdAt,
      },
    };

    if (options.dryRun) {
      process.stdout.write(`${JSON.stringify({ ...common, indexPath }, null, 2)}\n`);
      return;
    }

    const token = await refreshAccessToken();
    await uploadFile(token, archiveFile, packagePath, contentHash);
    const receipt = { ...common, verifiedAfterUpload: true };
    writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
    await uploadFile(token, receiptFile, receiptPath, dropboxContentHash(receiptFile));

    const index = { ...common, updatedAfterVerifiedUpload: true };
    writeFileSync(indexFile, `${JSON.stringify(index, null, 2)}\n`, { mode: 0o600 });
    await uploadFile(token, indexFile, indexPath, dropboxContentHash(indexFile));

    process.stdout.write(`${JSON.stringify({
      archived: true,
      stream: options.stream,
      slot,
      bytes: size,
      sha256,
      packagePath,
      receiptPath,
      indexPath,
    }, null, 2)}\n`);
  } finally {
    rmSync(temporary, { force: true, recursive: true });
  }
}

main().catch((error) => {
  process.stderr.write(`Dropbox archive failed: ${error.message}\n`);
  process.exitCode = 1;
});
