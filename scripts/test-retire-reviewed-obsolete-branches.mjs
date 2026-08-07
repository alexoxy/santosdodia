#!/usr/bin/env node

import assert from 'node:assert/strict';
import { retireReviewedBranches } from './retire-reviewed-obsolete-branches.mjs';

const mainSha = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const branchShas = new Map([
  ['agent/biography-fallback-rebased', '557584abf1b997543a1cf70a1243e70a7cd78265'],
  ['agent/calendar-read-model', '21feea53aec5af25621044966d25bb512df2278c'],
  ['agent/fix-live-localization-biographies', '53e3e8f50e34c22cf7304f1bc8bafae14b6ceda3'],
  ['agent/osint-data-platform-foundation', '5f3513a206b7604eb45ae523e2b633ea09f6c7e0'],
  ['agent/osint-wikidata-normalization-phase2', 'cd3d93a35195e1fce5f49b0d1c55ce997f191060'],
  ['agent/production-hardening', '738026d8f7d86428510d0d1bc49f542fcbd09095'],
  ['agent/security-litcal-hardening', '9ab5b49639a1b3de6ddfaea9835b555ccdceba04'],
  ['agent/wikidata-pilot-archive', '773b0007c54411299673baad54e1a0fc549f3041'],
  ['automation/osint-candidates', 'ddc1955aae9e2d3884c6db7e5f602b8c0fedb21f'],
  ['codex/evaluate-all-code-in-main', 'fc968741b90563e12a396786444c27381b137a9f'],
]);
const deleted = [];
function response(value, status = 200) {
  return new Response(value === null ? null : JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}
async function fetchImpl(url, init = {}) {
  const parsed = new URL(url);
  if (parsed.pathname.endsWith('/git/ref/heads/main')) return response({ object: { sha: mainSha } });
  if (parsed.pathname.endsWith('/pulls')) return response([]);
  const marker = '/git/ref/heads/';
  if (parsed.pathname.includes(marker)) {
    const branch = parsed.pathname.split(marker)[1].split('/').map(decodeURIComponent).join('/');
    if ((init.method ?? 'GET') === 'DELETE') {
      deleted.push(branch);
      return response(null, 204);
    }
    return branchShas.has(branch) ? response({ object: { sha: branchShas.get(branch) } }) : response({ message: 'Not Found' }, 404);
  }
  return response({ message: 'Unexpected request' }, 500);
}

const report = await retireReviewedBranches({ fetchImpl, token: 'test', repository: 'alexoxy/santosdodia', expectedMainSha: mainSha });
assert.deepEqual(report.deleted, [...branchShas.keys()]);
assert.deepEqual(deleted, [...branchShas.keys()]);
assert.equal(deleted.includes('main'), false);
assert.equal(deleted.includes('cloudflare-preview'), false);

await assert.rejects(
  retireReviewedBranches({ fetchImpl, token: 'test', repository: 'alexoxy/santosdodia', expectedMainSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }),
  /main moved/,
);
console.log('Reviewed obsolete branch retirement safeguards passed.');
