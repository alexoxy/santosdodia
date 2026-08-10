import assert from 'node:assert/strict';
import { auditEnrichmentChunkSet } from './audit-enrichment-chunk-set.mjs';

const progress = { schemaVersion: 1, enrichmentId: 'saints-profile-v1', identityRootSha256: 'a'.repeat(64), identityCount: 117, nextEntityOffset: 80, completed: false };
const good = { schemaVersion: 1, chunks: [{ startEntityOffset: 0 }, { startEntityOffset: 40 }] };
assert.equal(auditEnrichmentChunkSet({ listing: good, progress, chunkSize: 40 }).ok, true);

const missing = { schemaVersion: 1, chunks: [{ startEntityOffset: 0 }, { startEntityOffset: 80 }] };
const missingReport = auditEnrichmentChunkSet({ listing: missing, progress, chunkSize: 40 });
assert.equal(missingReport.ok, false);
assert.match(missingReport.errors.join('\n'), /offsets do not match watermark/);

const completeProgress = { ...progress, identityCount: 117, nextEntityOffset: 117, completed: true };
const completeListing = { schemaVersion: 1, chunks: [{ startEntityOffset: 0 }, { startEntityOffset: 40 }, { startEntityOffset: 80 }] };
assert.equal(auditEnrichmentChunkSet({ listing: completeListing, progress: completeProgress, chunkSize: 40 }).ok, true);

const falseComplete = { ...progress, completed: true };
assert.match(auditEnrichmentChunkSet({ listing: good, progress: falseComplete, chunkSize: 40 }).errors.join('\n'), /does not equal identity count/);

assert.throws(() => auditEnrichmentChunkSet({ listing: good, progress, chunkSize: 0 }), /chunkSize/);
console.log('Enrichment chunk continuity tests passed.');
