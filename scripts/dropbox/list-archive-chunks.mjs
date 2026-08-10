#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshDropboxAccessToken } from './oauth.mjs';

const CHUNK_PATTERN = /^chunk-(\d{6})$/u;
function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function validatePrefix(prefix) { if (!prefix || !/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?(?:\/[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?)*$/u.test(prefix)) throw new Error('Invalid Dropbox archive chunk prefix.'); }

async function responseJson(response, operation) {
  const text = await response.text(); let value = {};
  if (text) { try { value = JSON.parse(text); } catch { throw new Error(`${operation} returned invalid JSON (HTTP ${response.status}).`); } }
  if (!response.ok) throw new Error(`${operation} failed (HTTP ${response.status}): ${value.error_summary ?? value.error?.['.tag'] ?? 'unknown_error'}`);
  return value;
}

export async function listDropboxArchiveChunks({ streamPrefix, accessToken, fetchImpl = globalThis.fetch, signalFactory = (ms) => AbortSignal.timeout(ms), requestTimeoutMs = 30_000 } = {}) {
  validatePrefix(streamPrefix); if (!accessToken) throw new Error('Dropbox access token is required.');
  const archivePath = `/archive/${streamPrefix}`; const entries = []; let cursor = null;
  do {
    const response = await fetchImpl(cursor ? 'https://api.dropboxapi.com/2/files/list_folder/continue' : 'https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cursor ? { cursor } : { path: archivePath, recursive: false, include_deleted: false, include_non_downloadable_files: true, limit: 2000 }),
      signal: signalFactory(requestTimeoutMs)
    });
    const value = await responseJson(response, 'Dropbox chunk listing');
    if (!Array.isArray(value.entries)) throw new Error('Dropbox chunk listing returned no entries array.');
    entries.push(...value.entries); cursor = value.has_more === true ? value.cursor : null;
    if (value.has_more === true && !cursor) throw new Error('Dropbox chunk listing indicated more results without a cursor.');
  } while (cursor);
  const chunks = entries.filter((entry) => entry?.['.tag'] === 'folder' && CHUNK_PATTERN.test(entry.name ?? '')).map((entry) => {
    const offset = Number(entry.name.match(CHUNK_PATTERN)[1]);
    return { name: entry.name, startEntityOffset: offset, stream: `${streamPrefix}/${entry.name}`, dropboxPath: entry.path_display ?? entry.path_lower ?? `${archivePath}/${entry.name}` };
  }).sort((a,b) => a.startEntityOffset - b.startEntityOffset);
  const duplicates = chunks.filter((item, index) => index > 0 && item.startEntityOffset === chunks[index-1].startEntityOffset);
  if (duplicates.length) throw new Error(`Duplicate chunk offsets: ${duplicates.map((item) => item.startEntityOffset).join(',')}`);
  return { schemaVersion: 1, streamPrefix, archivePath, chunkCount: chunks.length, chunks };
}

async function main() {
  const streamPrefix = argument('--stream-prefix'); const output = argument('--output'); if (!streamPrefix) throw new Error('--stream-prefix is required.');
  const listing = await listDropboxArchiveChunks({ streamPrefix, accessToken: await refreshDropboxAccessToken() });
  const body = `${JSON.stringify(listing, null, 2)}\n`; if (output) { fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true }); fs.writeFileSync(path.resolve(output), body, { mode: 0o600 }); } process.stdout.write(body);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { main().catch((error) => { console.error(error); process.exit(1); }); }
