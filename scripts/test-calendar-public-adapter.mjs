import path from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(path.resolve('lib/calendar-public-adapter.ts')).href;
const { calendarOccurrenceToObservance, mergePublicCalendarObservances } = await import(moduleUrl);

function record(overrides = {}) {
  return {
    id: 'occurrence:anthony:2026-06-13',
    churchId: 'roman-catholic',
    churchName: 'Latin Church',
    jurisdictionId: 'pt',
    jurisdictionName: 'Portugal',
    countryCode: 'PT',
    canonicalEventId: 'anthony-lisbon',
    category: 'saint',
    dateISO: '2026-06-13',
    nativeCalendarSystem: 'gregorian',
    validationStatus: 'verified',
    publicationStatus: 'published',
    labels: {
      en: { locale: 'en', name: 'Saint Anthony of Lisbon', translationStatus: 'source' },
      pt: { locale: 'pt-PT', name: 'Santo António de Lisboa', description: 'Santo franciscano.', translationStatus: 'reviewed', sourceLocale: 'en' },
    },
    ...overrides,
  };
}

const mapped = calendarOccurrenceToObservance(record(), 'pt');
if (!mapped) throw new Error('Published verified occurrence was unexpectedly withheld.');
if (mapped.name !== 'Santo António de Lisboa') throw new Error(`Unexpected localized name: ${mapped.name}`);
if (mapped.names.en !== 'Saint Anthony of Lisbon' || mapped.names.pt !== 'Santo António de Lisboa') {
  throw new Error('Supported D1 labels were not preserved by locale.');
}
if (mapped.traditions.join(',') !== 'roman-catholic' || mapped.category !== 'saint') {
  throw new Error('Church/category mapping changed semantics.');
}
if (mapped.validationStatus !== 'verified' || mapped.calendarSystem !== 'gregorian') {
  throw new Error('Validation/calendar metadata was not preserved.');
}

if (calendarOccurrenceToObservance(record({ publicationStatus: 'withheld' }), 'pt') !== null) {
  throw new Error('Withheld D1 occurrence leaked into the public adapter.');
}
if (calendarOccurrenceToObservance(record({ validationStatus: 'provisional' }), 'pt') !== null) {
  throw new Error('Provisional D1 occurrence leaked into the public adapter.');
}
if (calendarOccurrenceToObservance(record({ churchId: 'unmapped-new-church' }), 'pt') !== null) {
  throw new Error('Unknown Church was silently mapped to an existing tradition.');
}
if (calendarOccurrenceToObservance(record({ category: 'founder' }), 'pt') !== null) {
  throw new Error('Unsupported theological person role was silently mapped to a calendar category.');
}
if (calendarOccurrenceToObservance(record({ labels: { el: { locale: 'el', name: 'Άγιος Αντώνιος', translationStatus: 'source' } } }), 'pt') !== null) {
  throw new Error('Unsupported label locale was relabelled as a supported language.');
}

const curated = [{
  id: 'anthony-lisbon',
  month: 6,
  day: 13,
  traditions: ['roman-catholic'],
  category: 'saint',
  calendarSystem: 'gregorian',
  names: { en: 'Saint Anthony', pt: 'Santo António' },
  sourceIds: ['curated-source'],
  translationStatus: 'editorial',
  validationStatus: 'cross-checked',
  dateISO: '2026-06-13',
  name: 'Santo António',
}];
const merged = mergePublicCalendarObservances(curated, [record()], 'pt');
if (merged.items.length !== 1) throw new Error('D1 and curated copies of the same canonical occurrence were not deduplicated.');
if (merged.items[0].name !== 'Santo António de Lisboa') throw new Error('Published D1 occurrence did not replace the matching curated fallback.');
if (merged.acceptedD1 !== 1 || merged.withheldD1 !== 0) throw new Error('Unexpected D1 adapter counters.');

const mixed = mergePublicCalendarObservances(curated, [record({ churchId: 'unmapped-new-church', id: 'unknown' })], 'pt');
if (mixed.items.length !== 1 || mixed.acceptedD1 !== 0 || mixed.withheldD1 !== 1) {
  throw new Error('Unknown Church should leave the curated fallback intact and be counted as withheld.');
}

console.log('D1 public calendar adapter safeguards passed.');
