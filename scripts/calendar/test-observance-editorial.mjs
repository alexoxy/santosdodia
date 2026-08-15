#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const editorial = fs.readFileSync('data/observance-editorial.ts', 'utf8');
const publicLayer = fs.readFileSync('lib/public-observances.ts', 'utf8');
const d1Adapter = fs.readFileSync('lib/calendar-public-adapter.ts', 'utf8');
const dayView = fs.readFileSync('app/components/DayView.tsx', 'utf8');

assert.match(editorial, /rc:DedicationStMaryMajor/u);
for (const locale of ['pt', 'en', 'es', 'fr', 'it']) {
  assert.match(editorial, new RegExp(`\\b${locale}:\\s*'[^']+\\\\n\\\\n[^']+'`, 'u'), `${locale} must contain two explainer paragraphs`);
}
assert.match(editorial, /basilicasantamariamaggiore\.va/u);
assert.match(editorial, /vatican\.va/u);
assert.match(editorial, /status:\s*'reviewed'/u);
assert.match(publicLayer, /enrichObservancesEditorial/u);
assert.match(d1Adapter, /enrichObservanceEditorial/u);
assert.match(dayView, /split\(\/\\n\\s\*\\n\/u\)/u);
assert.match(dayView, /paragraphs\.map/u);

console.log('Observance editorial explainer gate passed for Saint Mary Major and both public data paths.');
