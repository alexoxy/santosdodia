#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { refreshDropboxAccessToken } from './oauth.mjs';

const CONTENT_BLOCK_BYTES = 4 * 1024 * 1024;

const DROPBOX_DOWNLOAD_ATTEMPTS = 4;
const DROPBOX_RETRY_BASE_MS = 1_000;
const DROPBOX_RETRY_MAX_MS = 15_000;

function isTransientDropboxStatus(status) {
  return status === 429 || status >= 500;
}

function retryDelayMs(response, attempt) {
  const retryAfter = response?.headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1_000, 0), DROPBOX_RETRY_MAX_MS);
    const dateDelay = Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(dateDelay)) return Math.min(Math.max(dateDelay, 0), DROPBOX_RETRY_MAX_MS);
  }
  return Math.min(DROPBOX_RETRY_BASE_MS * (2 ** (attempt - 1)), DROPBOX_RETRY_MAX_MS);
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDropboxTemporaryDownload(token, remotePath) {
  const linkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: remotePath }),
    signal: AbortSignal.timeout(120000),
  });
  if (!linkResponse.ok) {
    const text = await linkResponse.text();
    throw new Error(`Dropbox temporary-link request failed for ${remotePath} (HTTP ${linkResponse.status}): ${text.slice(0, 500)}`);
  }
  const payload = await linkResponse.json();
  if (typeof payload?.link !== 'string' || payload.link.length === 0) {
    throw new Error(`Dropbox temporary-link response was incomplete for ${remotePath}.`);
  }
  return fetch(payload.link, { signal: AbortSignal.timeout(120000) });
}

async function fetchDropboxDownload(token, remotePath) {
  let lastError = null;
  for (let attempt = 1; attempt <= DROPBOX_DOWNLOAD_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        headers: { Authorization: `Bearer ${token}`, 'Dropbox-API-Arg': JSON.stringify({ path: remotePath }) },
        signal: AbortSignal.timeout(120000),
      });
      if (!isTransientDropboxStatus(response.status)) return response;
      await response.body?.cancel();
      if (attempt === DROPBOX_DOWNLOAD_ATTEMPTS) return fetchDropboxTemporaryDownload(token, remotePath);
      await wait(retryDelayMs(response, attempt));
    } catch (error) {
      lastError = error;
      if (attempt === DROPBOX_DOWNLOAD_ATTEMPTS) return fetchDropboxTemporaryDownload(token, remotePath);
      await wait(retryDelayMs(null, attempt));
    }
  }
  throw new Error(`Dropbox download request failed for ${remotePath}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function hasFlag(name) { return process.argv.includes(name); }

function validateStream(stream) {
  if (!stream || !/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?(?:\/[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)*$/u.test(stream)) {
    throw new Error('Invalid Dropbox archive stream.');
  }
}

async function downloadBytes(token, remotePath, { allowNotFound = false } = {}) {
  const response = await fetchDropboxDownload(token, remotePath);
  if (!response.ok) {
    const text = await response.text();
    if (allowNotFound && response.status === 409 && /(?:path\/not_found|not_found)/u.test(text)) return null;
    throw new Error(`Dropbox download failed for ${remotePath} (HTTP ${response.status}): ${text.slice(0, 500)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function downloadFile(token, remotePath, destination) {
  const response = await fetchDropboxDownload(token, remotePath);
  if (!response.ok || !response.body) throw new Error(`Dropbox download failed for ${remotePath} (HTTP ${response.status}).`);
  await pipeline(response.body, createWriteStream(destination, { mode: 0o600 }));
}

async function sha256File(filePath) {
  const hash = createHash('sha256');
  const bytes = await readFile(filePath);
  hash.update(bytes);
  return hash.digest('hex');
}

async function dropboxContentHash(filePath) {
  const bytes = await readFile(filePath);
  const aggregate = createHash('sha256');
  for (let offset = 0; offset < bytes.length; offset += CONTENT_BLOCK_BYTES) {
    aggregate.update(createHash('sha256').update(bytes.subarray(offset, offset + CONTENT_BLOCK_BYTES)).digest());
  }
  return aggregate.digest('hex');
}

export async function pullLatestStream({ stream, destination, allowMissing = false, accessToken = null }) {
  validateStream(stream);
  const output = path.resolve(destination);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  const token = accessToken ?? await refreshDropboxAccessToken();
  const indexPath = `/archive/${stream}/index.json`;
  const indexBytes = await downloadBytes(token, indexPath, { allowNotFound: allowMissing });
  if (indexBytes === null) {
    const receipt = { schemaVersion: 1, stream, consumedAt: new Date().toISOString(), sourceIndexPath: indexPath, verified: false, missing: true };
    await writeFile(path.join(output, 'consumer-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
    return receipt;
  }
  const index = JSON.parse(indexBytes.toString('utf8'));
  if (index.schemaVersion !== 1 || index.stream !== stream || index.updatedAfterVerifiedUpload !== true) throw new Error(`Dropbox stream index is not a verified SantosDia index: ${indexPath}`);
  const current = index.current;
  if (!current?.archivePath || !current?.sha256 || !current?.dropboxContentHash) throw new Error(`Dropbox stream index is incomplete: ${indexPath}`);

  const archive = path.join(output, 'package.tar.gz');
  await downloadFile(token, current.archivePath, archive);
  const sha256 = await sha256File(archive);
  const contentHash = await dropboxContentHash(archive);
  if (sha256 !== current.sha256) throw new Error(`SHA-256 mismatch for ${current.archivePath}.`);
  if (contentHash !== current.dropboxContentHash) throw new Error(`Dropbox content hash mismatch for ${current.archivePath}.`);

  await writeFile(path.join(output, 'index.json'), indexBytes, { mode: 0o600 });
  const receipt = { schemaVersion: 1, stream, consumedAt: new Date().toISOString(), sourceIndexPath: indexPath, archivePath: current.archivePath, sha256, dropboxContentHash: contentHash, sourceRun: current.run ?? null, verified: true, missing: false };
  await writeFile(path.join(output, 'consumer-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
  return receipt;
}

async function main() {
  const stream = argument('--stream');
  const destination = argument('--destination', 'staging/dropbox-intake');
  const receipt = await pullLatestStream({ stream, destination, allowMissing: hasFlag('--allow-missing') });
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Dropbox stream intake failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
