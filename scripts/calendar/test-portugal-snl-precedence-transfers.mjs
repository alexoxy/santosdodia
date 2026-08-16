#!/usr/bin/env node

import assert from 'node:assert/strict';
import { reconcilePortugalSnl } from './reconcile-portugal-snl.mjs';

function snl(id, dateISO, label, rank = '', dayLabel = label) {
  return {
    id,
    canonicalEventId: `source:snl-pt:${id}`,
    dateISO,
    names: { pt: { value: label, status: 'source', sourceLocale: 'pt' } },
    sourceFacts: { uid: `${id}@liturgia.pt`, description: rank, dayLabel },
  };
}
function canonicalRank(grade) {
  const value = String(grade ?? '').toLowerCase();
  if (value.includes('solemn')) return 'solemnity';
  if (value.includes('feast')) return 'feast';
  if (value.includes('optional')) return 'optional-memorial';
  if (value.includes('memorial')) return 'memorial';
  if (value.includes('weekday')) return 'weekday';
  return null;
}
function roman(id, dateISO, name, grade = null) {
  return { id, canonicalEventId: `rc:${id}`, dateISO, grade, rank: canonicalRank(grade), names: { en_US: name } };
}

const snlPackage = {
  run: { publicationAllowed: false, promotionAllowed: false },
  events: [
    snl('epiphany-pt', '2026-01-04', 'DOMINGO – EPIFANIA DO SENHOR – SOLENIDADE', 'SOLENIDADE'),
    snl('jan6-pt', '2026-01-06', 'Terça-feira depois da Epifania'),
    snl('matthias-pt', '2026-05-14', 'S. Matias, apóstolo', 'FESTA'),
    snl('ascension-pt', '2026-05-17', 'ASCENSÃO DO SENHOR', 'SOLENIDADE', 'DOMINGO VII DA PÁSCOA'),
    snl('immaculate-heart-pt', '2026-06-15', 'Imaculado Coração da Virgem santa Maria', 'FESTA'),
    snl('cyril-methodius-pt', '2026-02-14', 'S. Cirilo, monge, e S. Metódio, bispo, Padroeiros da Europa', 'FESTA'),
    snl('all-souls-pt', '2026-11-02', 'Comemoração de Todos os Fiéis Defuntos'),
  ],
};

const generalRoman = [
  roman('Christmas2', '2026-01-04', 'Second Sunday after Christmas', 'Solemnity'),
  roman('Epiphany', '2026-01-06', 'Epiphany of the Lord', 'Solemnity'),
  roman('StMatthias', '2026-05-14', 'Saint Matthias, Apostle', 'Feast'),
  roman('Ascension', '2026-05-14', 'Ascension of the Lord', 'Solemnity'),
  roman('Easter7', '2026-05-17', 'Seventh Sunday of Easter', 'Solemnity'),
  roman('ImmaculateHeart', '2026-06-13', 'Immaculate Heart of the Blessed Virgin Mary', 'Memorial'),
  roman('OrdinaryWeekdayJun15', '2026-06-15', 'Monday of the Eleventh Week in Ordinary Time', 'Weekday'),
  roman('StsCyrilMethodius', '2026-02-14', 'Saints Cyril, Monk, and Methodius, Bishop', 'Memorial'),
  roman('AllSouls', '2026-11-02', 'Commemoration of All the Faithful Departed', 'Solemnity'),
];

const result = reconcilePortugalSnl({ snlPackage, generalRoman });
const byId = (id) => result.items.find((item) => item.sourceOccurrenceId === id);

assert.equal(byId('epiphany-pt').disposition, 'transfer-candidate-review');
assert.equal(byId('epiphany-pt').candidate.generalRomanId, 'Epiphany');
assert.equal(byId('epiphany-pt').candidate.generalRomanDateISO, '2026-01-06');

// A generic structural day must never silently inherit a high-precedence General Roman
// celebration that Portugal has already transferred away from this civil date.
assert.equal(byId('jan6-pt').disposition, 'precedence-delta-review');
assert.equal(byId('jan6-pt').candidate.generalRomanId, 'Epiphany');

// On 14 May Portugal celebrates Matthias while the General Roman test vector also carries
// Ascension. The presence of the matching saint must not hide the higher-precedence conflict.
assert.equal(byId('matthias-pt').disposition, 'precedence-delta-review');

// On the transferred Sunday the explicit named solemnity must beat the structural
// "Seventh Sunday of Easter" day label, otherwise the transfer disappears from review.
assert.equal(byId('ascension-pt').disposition, 'transfer-candidate-review');
assert.equal(byId('ascension-pt').candidate.generalRomanId, 'Ascension');
assert.equal(byId('ascension-pt').candidate.generalRomanDateISO, '2026-05-14');

assert.equal(byId('immaculate-heart-pt').disposition, 'transfer-candidate-review');
assert.equal(byId('immaculate-heart-pt').candidate.generalRomanId, 'ImmaculateHeart');
assert.equal(byId('immaculate-heart-pt').candidate.generalRomanDateISO, '2026-06-13');

assert.equal(byId('cyril-methodius-pt').disposition, 'rank-delta-review');
assert.equal(byId('cyril-methodius-pt').candidate.generalRomanId, 'StsCyrilMethodius');

assert.equal(byId('all-souls-pt').disposition, 'canonical-link-proposal');
assert.equal(byId('all-souls-pt').candidate.generalRomanId, 'AllSouls');
assert.equal(byId('all-souls-pt').candidate.matchingBasis, 'reviewed-semantic-alias');

assert.ok(result.items.every((item) => item.reviewRequired === true && item.automaticLinkAllowed === false));
console.log('Portugal transfer identity-priority and precedence regression vectors passed.');
