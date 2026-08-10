#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshDropboxAccessToken } from './oauth.mjs';
import { pullLatestStream } from './pull-latest-stream.mjs';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function safeDirectoryName(stream) { return stream.split('/').at(-1).replace(/[^a-zA-Z0-9_.-]/gu, '_'); }

export async function pullVerifiedStreamSet({ streams, destination, accessToken = null } = {}) {
  if (!Array.isArray(streams) || !streams.length || streams.length > 1000) throw new Error('Stream set must contain 1-1000 streams.');
  if (new Set(streams).size !== streams.length) throw new Error('Stream set contains duplicates.');
  const token = accessToken ?? await refreshDropboxAccessToken();
  const root = path.resolve(destination); fs.rmSync(root, { recursive: true, force: true }); fs.mkdirSync(root, { recursive: true });
  const receipts = [];
  for (let index = 0; index < streams.length; index += 1) {
    const stream = streams[index];
    const output = path.join(root, safeDirectoryName(stream));
    const receipt = await pullLatestStream({ stream, destination: output, accessToken: token });
    if (receipt.verified !== true || receipt.missing === true) throw new Error(`Stream set member was not verified: ${stream}`);
    receipts.push({ index, stream, output: path.relative(process.cwd(), output), sha256: receipt.sha256, dropboxContentHash: receipt.dropboxContentHash, sourceRun: receipt.sourceRun });
  }
  const manifest = { schemaVersion: 1, consumedAt: new Date().toISOString(), streamCount: receipts.length, allVerified: true, receipts };
  fs.writeFileSync(path.join(root, 'stream-set-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  return manifest;
}

async function main() {
  const listingPath = argument('--listing'); const destination = argument('--destination'); const field = argument('--field', 'chunks');
  if (!listingPath || !destination) throw new Error('--listing and --destination are required.');
  const listing = JSON.parse(fs.readFileSync(path.resolve(listingPath), 'utf8'));
  const items = listing?.[field]; if (!Array.isArray(items)) throw new Error(`Listing field ${field} is not an array.`);
  const streams = items.map((item) => item?.stream);
  const manifest = await pullVerifiedStreamSet({ streams, destination });
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { main().catch((error) => { console.error(error); process.exit(1); }); }
