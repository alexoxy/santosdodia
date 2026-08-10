#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }

export function auditEnrichmentChunkSet({ listing, progress, chunkSize }) {
  if (!Number.isSafeInteger(chunkSize) || chunkSize < 1 || chunkSize > 1000) throw new Error('chunkSize must be 1-1000.');
  if (listing?.schemaVersion !== 1 || !Array.isArray(listing?.chunks)) throw new Error('Chunk listing has the wrong schema.');
  if (progress?.schemaVersion !== 1 || !Number.isSafeInteger(progress?.nextEntityOffset) || !Number.isSafeInteger(progress?.identityCount)) throw new Error('Enrichment progress has the wrong schema.');
  const expectedOffsets = [];
  for (let offset = 0; offset < progress.nextEntityOffset; offset += chunkSize) expectedOffsets.push(offset);
  const actualOffsets = listing.chunks.map((chunk) => chunk.startEntityOffset);
  const errors = [];
  if (JSON.stringify(actualOffsets) !== JSON.stringify(expectedOffsets)) errors.push(`chunk offsets do not match watermark: expected=${expectedOffsets.join(',')} actual=${actualOffsets.join(',')}`);
  if (progress.nextEntityOffset > progress.identityCount) errors.push('watermark exceeds identity count');
  if (progress.completed === true && progress.nextEntityOffset !== progress.identityCount) errors.push('completed watermark does not equal identity count');
  if (progress.completed !== true && progress.nextEntityOffset >= progress.identityCount) errors.push('incomplete watermark is at or beyond identity count');
  return {
    schemaVersion: 1,
    ok: errors.length === 0,
    enrichmentId: progress.enrichmentId,
    identityRootSha256: progress.identityRootSha256,
    chunkSize,
    identityCount: progress.identityCount,
    nextEntityOffset: progress.nextEntityOffset,
    expectedChunkCount: expectedOffsets.length,
    actualChunkCount: actualOffsets.length,
    completed: progress.completed === true,
    errors
  };
}

function main() {
  const listingPath = argument('--listing'); const progressPath = argument('--progress'); const chunkSize = Number(argument('--chunk-size')); const output = argument('--output');
  if (!listingPath || !progressPath) throw new Error('--listing and --progress are required.');
  const report = auditEnrichmentChunkSet({ listing: JSON.parse(fs.readFileSync(path.resolve(listingPath), 'utf8')), progress: JSON.parse(fs.readFileSync(path.resolve(progressPath), 'utf8')), chunkSize });
  const body = `${JSON.stringify(report, null, 2)}\n`; if (output) { fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true }); fs.writeFileSync(path.resolve(output), body, 'utf8'); } process.stdout.write(body); if (!report.ok) process.exitCode = 1;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { try { main(); } catch (error) { console.error(error); process.exit(1); } }
