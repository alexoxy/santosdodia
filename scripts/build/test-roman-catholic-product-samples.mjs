import fs from 'node:fs';
import path from 'node:path';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const input = argument('--input');
if (!input) throw new Error('Usage: node scripts/build/test-roman-catholic-product-samples.mjs --input <build-report.json>');

const report = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
const byDate = new Map((report.daily ?? []).map((item) => [item.dateISO, item]));

const samples = [
  {
    dateISO: `${report.year}-08-11`,
    expected: {
      en: /clare/i,
      pt: /clara/i,
      es: /clara/i,
      fr: /claire/i,
      it: /chiara/i,
    },
  },
  {
    dateISO: `${report.year}-01-01`,
    expected: {
      en: /(mary|mother of god)/i,
      pt: /(maria|mãe de deus)/i,
      es: /(maría|madre de dios)/i,
      fr: /(marie|mère de dieu)/i,
      it: /(maria|madre di dio)/i,
    },
  },
];

for (const sample of samples) {
  const day = byDate.get(sample.dateISO);
  if (!day) throw new Error(`Missing sample day ${sample.dateISO}.`);
  for (const [locale, pattern] of Object.entries(sample.expected)) {
    const label = String(day.labels?.[locale]?.label ?? '').normalize('NFC').trim();
    if (!label) throw new Error(`${sample.dateISO} has no ${locale} label.`);
    if (!pattern.test(label)) throw new Error(`${sample.dateISO} ${locale} label is semantically wrong: ${label}`);
  }
}

const august = byDate.get(`${report.year}-08-11`);
const english = String(august.labels.en.label).toLowerCase();
for (const locale of ['pt', 'es', 'fr', 'it']) {
  const value = String(august.labels[locale].label).toLowerCase();
  if (value === english) throw new Error(`11 August ${locale} silently duplicates the English label.`);
}

console.log('Roman Catholic product semantic samples passed for 1 January and 11 August in EN/PT/ES/FR/IT.');
