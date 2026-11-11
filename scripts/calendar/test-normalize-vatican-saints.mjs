import assert from 'node:assert/strict';
import { normalizeVaticanSaints } from './normalize-vatican-saints.mjs';

function raw(scope = 'month:8') {
  return {
    schemaVersion: 1,
    source: {
      id: 'vatican-news-saint-of-day-pt',
      contentUse: 'metadata-only-reference'
    },
    generatedAt: '2026-08-10T00:00:00Z',
    scope,
    requestedDayCount: 1,
    complete: true,
    publicationAllowed: false,
    productionMutation: false,
    days: [
      {
        month: 8,
        day: 10,
        sourceUrl: 'https://www.vaticannews.va/pt/santo-do-dia/08/10.html',
        retrievedAt: '2026-08-10T00:00:00Z',
        pageSha256: 'a'.repeat(64),
        saints: [
          {
            name: 'S. Lourenço, diácono e mártir',
            detailUrl: 'https://www.vaticannews.va/pt/santo-do-dia/08/10/s--lourenco--diacono-e-martir.html',
            sourceRecordHash: 'b'.repeat(64)
          },
          {
            name: 'S. Blano, bispo',
            detailUrl: null,
            sourceRecordHash: 'c'.repeat(64)
          }
        ]
      }
    ]
  };
}

const normalized = normalizeVaticanSaints(raw());
assert.equal(normalized.eventCount, 2);
assert.equal(normalized.coverage.complete, true);
assert.equal(normalized.events[0].personEntityId, null);
assert.equal(normalized.events[0].personLinkStatus, 'unresolved');
assert.equal(normalized.events[0].publicationStatus, 'withheld');
assert.equal(normalized.events[0].validationStatus, 'provisional');
assert.equal(normalized.events[0].names.pt.status, 'source');
assert.equal(normalized.events[1].source.detailUrl, null);
assert.match(normalized.events[1].id, /^vatican-news-08-10-/u);
assert.equal(normalized.contract.nameOnlyIdentityMergeForbidden, true);
assert.equal(normalized.contract.personIsNotObservance, true);
assert.equal(JSON.stringify(normalized).includes('biography'), false);

const unsafe = raw();
unsafe.publicationAllowed = true;
assert.throws(() => normalizeVaticanSaints(unsafe), /must not permit publication/);

const wrongHost = raw();
wrongHost.days[0].saints[0].detailUrl = 'https://example.com/person.html';
assert.throws(() => normalizeVaticanSaints(wrongHost), /Unexpected saint detail URL/);

const wrongCalendar = raw();
wrongCalendar.days[0].sourceUrl = 'https://example.com/08/10.html';
assert.throws(() => normalizeVaticanSaints(wrongCalendar), /Unexpected Vatican calendar page URL/);

for (const navigationName of ['Menu', 'Busca']) {
  const contaminated = raw();
  contaminated.days[0].saints.unshift({
    name: navigationName,
    detailUrl: null,
    sourceRecordHash: 'd'.repeat(64)
  });
  assert.throws(
    () => normalizeVaticanSaints(contaminated),
    /UI navigation heading/,
    `${navigationName} must fail closed during normalization`
  );
}

console.log('Vatican saints normalization tests passed.');
