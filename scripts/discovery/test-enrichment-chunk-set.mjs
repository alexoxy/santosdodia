import assert from 'node:assert/strict';
import { auditEnrichmentChunkSet } from './audit-enrichment-chunk-set.mjs';

const progress = { schemaVersion: 1, enrichmentId: 'saints-profile-v1', identityRootSha256: 'a'.repeat(64), identityCount: 117, nextEntityOffset: 80, completed: false };
const good = { schemaVersion: 1, chunks: [{ startEntityOffset: 0 }, { startEntityOffset: 40 }] };
const goodReport = auditEnrichmentChunkSet({ listing: good, progress, chunkSize: 40 });
assert.equal(goodReport.ok, true);
assert.deepEqual(goodReport.chunks.map((item) => item.startEntityOffset), [0, 40]);
assert.equal(goodReport.futureChunkCount, 0);

// A producer may archive the next chunk just after the exporter reads the
// previous committed watermark. That future chunk is valid but must not enter
// this snapshot until its watermark is committed.
const racing = { schemaVersion: 1, chunks: [{ startEntityOffset: 0 }, { startEntityOffset: 40 }, { startEntityOffset: 80 }] };
const racingReport = auditEnrichmentChunkSet({ listing: racing, progress, chunkSize: 40 });
assert.equal(racingReport.ok, true, racingReport.errors.join('\n'));
assert.deepEqual(racingReport.chunks.map((item) => item.startEntityOffset), [0, 40]);
assert.deepEqual(racingReport.futureChunks.map((item) => item.startEntityOffset), [80]);

const missing = { schemaVersion: 1, chunks: [{ startEntityOffset: 0 }, { startEntityOffset: 80 }] };
const missingReport = auditEnrichmentChunkSet({ listing: missing, progress, chunkSize: 40 });
assert.equal(missingReport.ok, false);
assert.match(missingReport.errors.join('\n'), /committed chunk offsets do not match watermark/);

const completeProgress = { ...progress, identityCount: 117, nextEntityOffset: 117, completed: true };
const completeListing = { schemaVersion: 1, chunks: [{ startEntityOffset: 0 }, { startEntityOffset: 40 }, { startEntityOffset: 80 }] };
assert.equal(auditEnrichmentChunkSet({ listing: completeListing, progress: completeProgress, chunkSize: 40 }).ok, true);

const falseComplete = { ...progress, completed: true };
assert.match(auditEnrichmentChunkSet({ listing: good, progress: falseComplete, chunkSize: 40 }).errors.join('\n'), /does not equal identity count/);

assert.throws(() => auditEnrichmentChunkSet({ listing: good, progress, chunkSize: 0 }), /chunkSize/);
console.log('Enrichment chunk continuity tests passed.');
