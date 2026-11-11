#!/usr/bin/env node

import assert from 'node:assert/strict';
import { listDropboxArchiveBatches } from './list-archive-batches.mjs';

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}

{
  const calls = [];
  const queue = [
    jsonResponse({
      entries: [
        { '.tag': 'folder', name: 'batch-000010', path_display: '/archive/x/batch-000010' },
        { '.tag': 'file', name: 'index.json', path_display: '/archive/x/index.json' },
      ],
      has_more: true,
      cursor: 'cursor-1',
    }),
    jsonResponse({
      entries: [
        { '.tag': 'folder', name: 'batch-000000', path_display: '/archive/x/batch-000000' },
        { '.tag': 'folder', name: 'not-a-batch', path_display: '/archive/x/not-a-batch' },
        { '.tag': 'folder', name: 'batch-000020', path_display: '/archive/x/batch-000020' },
      ],
      has_more: false,
    }),
  ];
  const result = await listDropboxArchiveBatches({
    streamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
    accessToken: 'token',
    fetchImpl: async (url, init) => { calls.push({ url, init }); return queue.shift(); },
    signalFactory: () => new AbortController().signal,
  });
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /list_folder$/u);
  assert.match(calls[1].url, /list_folder\/continue$/u);
  assert.deepEqual(result.batches.map((batch) => batch.startPage), [0, 10, 20]);
  assert.deepEqual(result.batches.map((batch) => batch.stream), [
    'baseline/saints/v1/reviewed/wikidata/recognition-v1/batch-000000',
    'baseline/saints/v1/reviewed/wikidata/recognition-v1/batch-000010',
    'baseline/saints/v1/reviewed/wikidata/recognition-v1/batch-000020',
  ]);
}

{
  await assert.rejects(
    () => listDropboxArchiveBatches({ streamPrefix: '../unsafe', accessToken: 'token', fetchImpl: async () => jsonResponse({ entries: [], has_more: false }) }),
    /Invalid Dropbox archive stream prefix/u,
  );
}

{
  await assert.rejects(
    () => listDropboxArchiveBatches({
      streamPrefix: 'baseline/saints/v1/reviewed/wikidata/recognition-v1',
      accessToken: 'token',
      fetchImpl: async () => jsonResponse({ error_summary: 'temporary' }, 500),
      signalFactory: () => new AbortController().signal,
    }),
    /HTTP 500/u,
  );
}

console.log('Dropbox baseline batch listing tests passed.');
