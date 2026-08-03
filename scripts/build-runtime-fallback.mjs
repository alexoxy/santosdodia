import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const input = resolve(process.argv[2] ?? 'data/generated/source-snapshot.json');
const output = resolve(process.argv[3] ?? 'data/generated/runtime-fallback.json');
const maxBytes = Number(process.env.RUNTIME_FALLBACK_MAX_BYTES ?? 2_500_000);

const source = JSON.parse(readFileSync(input, 'utf8'));
if (!source || typeof source !== 'object' || !source.years || typeof source.years !== 'object') {
  throw new Error('Source snapshot does not contain a years object.');
}

const allowedKeys = [
  'id', 'externalId', 'month', 'day', 'dateISO', 'traditions', 'category',
  'calendarSystem', 'names', 'name', 'countries', 'regions', 'jurisdictions',
  'patronages', 'sourceIds', 'translationStatus', 'validationStatus', 'lastVerified'
];

function compactObservation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const compact = {};
  for (const key of allowedKeys) {
    if (value[key] !== undefined && value[key] !== null) compact[key] = value[key];
  }
  return compact.id && compact.dateISO && compact.name ? compact : undefined;
}

const years = {};
let sourceCount = 0;
let outputCount = 0;

for (const [year, payload] of Object.entries(source.years)) {
  const observations = Array.isArray(payload?.observations) ? payload.observations : [];
  sourceCount += observations.length;
  const compact = observations.map(compactObservation).filter(Boolean);
  outputCount += compact.length;
  years[year] = { observations: compact };
}

if (sourceCount !== outputCount) {
  throw new Error(`Compaction would lose records: source=${sourceCount}, output=${outputCount}.`);
}

const result = {
  schemaVersion: 1,
  generatedAt: source.generatedAt ?? null,
  compactedAt: new Date().toISOString(),
  recordCount: outputCount,
  retentionPolicy: 'runtime-minimum; full source snapshot retained in Dropbox staging',
  years,
  sourceHealth: Array.isArray(source.sourceHealth) ? source.sourceHealth : []
};

const serialized = `${JSON.stringify(result)}\n`;
const bytes = Buffer.byteLength(serialized);
if (bytes > maxBytes) {
  throw new Error(`Runtime fallback is ${bytes} bytes, above limit ${maxBytes}.`);
}

writeFileSync(output, serialized);
console.log(`Runtime fallback written: ${outputCount} records, ${bytes} bytes.`);
