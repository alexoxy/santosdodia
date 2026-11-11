#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshDropboxAccessToken } from './oauth.mjs';

const BATCH_PATTERN = /^batch-(\d{6})$/u;

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function validateStreamPrefix(streamPrefix) {
  if (!streamPrefix || !/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?(?:\/[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)*$/u.test(streamPrefix)) {
    throw new Error('Invalid Dropbox archive stream prefix.');
  }
}

async function responseJson(response, operation) {
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

export async function listDropboxArchiveBatches({
  streamPrefix,
  accessToken,
  fetchImpl = globalThis.fetch,
  signalFactory = (milliseconds) => AbortSignal.timeout(milliseconds),
  requestTimeoutMs = 30_000,
} = {}) {
  validateStreamPrefix(streamPrefix);
  if (!accessToken) throw new Error('Dropbox access token is required.');
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');

  const archivePath = `/archive/${streamPrefix}`;
  const entries = [];
  let cursor = null;
  do {
    const endpoint = cursor
      ? 'https://api.dropboxapi.com/2/files/list_folder/continue'
      : 'https://api.dropboxapi.com/2/files/list_folder';
    const body = cursor
      ? { cursor }
      : { path: archivePath, recursive: false, include_deleted: false, include_non_downloadable_files: true, limit: 2000 };
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: signalFactory(requestTimeoutMs),
    });
    const value = await responseJson(response, 'Dropbox batch listing');
    if (!Array.isArray(value.entries)) throw new Error('Dropbox batch listing returned no entries array.');
    entries.push(...value.entries);
    cursor = value.has_more === true ? value.cursor : null;
    if (value.has_more === true && !cursor) throw new Error('Dropbox batch listing indicated more results without a cursor.');
  } while (cursor);

  const batches = entries
    .filter((entry) => entry?.['.tag'] === 'folder' && BATCH_PATTERN.test(entry.name ?? ''))
    .map((entry) => {
      const match = entry.name.match(BATCH_PATTERN);
      return {
        name: entry.name,
        startPage: Number(match[1]),
        stream: `${streamPrefix}/${entry.name}`,
        dropboxPath: entry.path_display ?? entry.path_lower ?? `${archivePath}/${entry.name}`,
      };
    })
    .sort((a, b) => a.startPage - b.startPage);

  const duplicateStarts = batches.filter((batch, index) => index > 0 && batch.startPage === batches[index - 1].startPage);
  if (duplicateStarts.length > 0) throw new Error(`Dropbox batch listing contains duplicate batch starts: ${duplicateStarts.map((item) => item.startPage).join(',')}`);

  return {
    schemaVersion: 1,
    streamPrefix,
    archivePath,
    batchCount: batches.length,
    batches,
  };
}

async function main() {
  const streamPrefix = argument('--stream-prefix');
  const output = argument('--output');
  if (!streamPrefix) throw new Error('--stream-prefix is required.');
  const accessToken = await refreshDropboxAccessToken();
  const listing = await listDropboxArchiveBatches({ streamPrefix, accessToken });
  const body = `${JSON.stringify(listing, null, 2)}\n`;
  if (output) {
    const absolute = path.resolve(output);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, body, { mode: 0o600 });
  }
  process.stdout.write(body);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`Dropbox batch listing failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
