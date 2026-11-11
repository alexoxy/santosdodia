#!/usr/bin/env node

import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, resolve, sep } from 'node:path';
import { refreshDropboxAccessToken } from './oauth.mjs';

const MAX_BYTES = 5 * 1024 * 1024;

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const [name, inlineValue] = argument.split('=', 2);
    const value = inlineValue ?? argv[index + 1];
    if (name === '--source') options.source = value;
    else if (name === '--destination') options.destination = value;
    else throw new Error(`Unknown argument: ${argument}`);
    if (inlineValue === undefined) index += 1;
  }
  return options;
}

function validateOptions(options, root) {
  if (!options.source || isAbsolute(options.source) || options.source.split(/[\\/]/).includes('..')) {
    throw new Error('Source must be a repository-relative path.');
  }
  const absolute = resolve(root, options.source);
  if (!existsSync(absolute)) throw new Error(`Source does not exist: ${options.source}`);
  const real = realpathSync(absolute);
  if (real !== root && !real.startsWith(`${root}${sep}`)) {
    throw new Error('Source resolves outside the repository.');
  }
  const size = statSync(real).size;
  if (size > MAX_BYTES) throw new Error(`Source exceeds ${MAX_BYTES} bytes.`);

  if (!options.destination || !/^\/current\/[a-z0-9][a-z0-9/_-]*\.json$/u.test(options.destination)) {
    throw new Error('Destination must be a JSON path below /current/.');
  }

  options.absoluteSource = real;
  options.size = size;
}

async function upload(token, source, destination) {
  const body = readFileSync(source);
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(body.length),
      'Dropbox-API-Arg': JSON.stringify({
        autorename: false,
        mode: 'overwrite',
        mute: true,
        path: destination,
        strict_conflict: false,
      }),
    },
    body,
  });

  const text = await response.text();
  let bodyJson = {};
  if (text) {
    try {
      bodyJson = JSON.parse(text);
    } catch {
      throw new Error(`Dropbox upload returned invalid JSON (HTTP ${response.status}).`);
    }
  }
  if (!response.ok) {
    const summary = bodyJson.error_summary ?? bodyJson.error_description ?? bodyJson.error?.['.tag'] ?? 'unknown_error';
    throw new Error(`Dropbox upload failed (HTTP ${response.status}): ${summary}`);
  }
  return bodyJson;
}

async function main() {
  const root = realpathSync(process.env.GITHUB_WORKSPACE || process.cwd());
  const options = parseArguments(process.argv.slice(2));
  validateOptions(options, root);

  const token = await refreshDropboxAccessToken();
  const metadata = await upload(token, options.absoluteSource, options.destination);
  if (metadata.size !== options.size) throw new Error('Dropbox size verification failed.');

  process.stdout.write(`${JSON.stringify({
    published: true,
    source: options.source,
    destination: options.destination,
    bytes: options.size,
    serverModified: metadata.server_modified ?? null,
    rev: metadata.rev ?? null,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`Dropbox current JSON publish failed: ${error.message}\n`);
  process.exitCode = 1;
});
