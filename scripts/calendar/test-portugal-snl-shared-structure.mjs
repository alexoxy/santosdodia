#!/usr/bin/env node

import assert from 'node:assert/strict';
import { extractPrimarySnlObservance } from './normalize-portugal-snl-agenda.mjs';
import { reconcilePortugalSnl } from './reconcile-portugal-snl.mjs';

// DESCRIPTION metadata must not displace an already authoritative SNL SUMMARY.
const ashWednesday = extractPrimarySnlObservance(
  'Quarta-feira DE CINZAS',
  'Tempo da Quaresma\nPara o Ofício Divino toma-se o II volume da Liturgia das Horas.\nRoxo – Ofício da féria.',
);
assert.equal(ashWednesday.label, 'Quarta-feira DE CINZAS');
assert.equal(ashWednesday.rankSource, 'day-label');

const easter = extractPrimarySnlObservance(
  'DOMINGO DE PÁSCOA DA RESSURREIÇÃO DO SENHOR',
  'TEMPO PASCAL\nSOLENIDADE com oitava\nBranco.',
);
assert.equal(easter.label, 'DOMINGO DE PÁSCOA DA RESSURREIÇÃO DO SENHOR');

const wordOfGodSunday = extractPrimarySnlObservance(
  'DOMINGO III DO TEMPO COMUM',
  'ou Domingo da Palavra de Deus\nVerde – Ofício do domingo.',
);
assert.equal(wordOfGodSunday.label, 'DOMINGO III DO TEMPO COMUM');

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

const vectors = [
  ['mary-mother','2026-01-01','SANTA MARIA, MÃE DE DEUS','SOLENIDADE','MaryMotherOfGod','Mary, Mother of God','Solemnity'],
  ['baptism','2026-01-11','DOMINGO: Batismo do Senhor – FESTA','FESTA','BaptismLord','Baptism of the Lord','Feast'],
  ['ordinary-sunday','2026-01-18','DOMINGO II DO TEMPO COMUM','','OrdSunday2','Second Sunday in Ordinary Time','Feast'],
  ['lent-sunday','2026-02-22','DOMINGO I DA QUARESMA','','Lent1','First Sunday of Lent','Solemnity'],
  ['ash','2026-02-18','Quarta-feira DE CINZAS','','AshWednesday','Ash Wednesday','Solemnity'],
  ['palm','2026-03-29','DOMINGO DE RAMOS NA PAIXÃO DO SENHOR','','PalmSun','Palm Sunday of the Passion of the Lord','Solemnity'],
  ['holy-monday','2026-03-30','Segunda-feira da Semana Santa','','MonHolyWeek','Monday of Holy Week','Solemnity'],
  ['easter','2026-04-05','DOMINGO DE PÁSCOA DA RESSURREIÇÃO DO SENHOR','','Easter','Easter Sunday','Solemnity'],
  ['easter-octave','2026-04-06','SEGUNDA-FEIRA DA OITAVA DA PÁSCOA','','MonOctaveEaster','Monday within the Octave of Easter','Solemnity'],
  ['easter2','2026-04-12','DOMINGO II DA PÁSCOA ou da Divina Misericórdia','','Easter2','Second Sunday of Easter','Solemnity'],
  ['pentecost','2026-05-24','DOMINGO DE PENTECOSTES','SOLENIDADE','Pentecost','Pentecost Sunday','Solemnity'],
  ['trinity','2026-05-31','SANTÍSSIMA TRINDADE','SOLENIDADE','Trinity','The Most Holy Trinity','Solemnity'],
  ['sacred-heart','2026-06-12','SAGRADO CORAÇÃO DE JESUS','SOLENIDADE','SacredHeart','The Most Sacred Heart of Jesus','Solemnity'],
  ['archangels','2026-09-29','Santos Miguel, Gabriel e Rafael, Arcanjos','FESTA','StsArchangels','Saints Michael, Gabriel and Raphael, Archangels','Feast'],
  ['christ-king','2026-11-22','NOSSO SENHOR JESUS CRISTO, REI DO UNIVERSO','SOLENIDADE','ChristKing','Our Lord Jesus Christ, King of the Universe','Solemnity'],
  ['advent1','2026-11-29','DOMINGO I DO ADVENTO','','Advent1','First Sunday of Advent','Solemnity'],
  ['immaculate-conception','2026-12-08','IMACULADA CONCEIÇÃO DA VIRGEM SANTA MARIA, Padroeira principal de Portugal','SOLENIDADE','ImmaculateConception','Immaculate Conception of the Blessed Virgin Mary','Solemnity'],
  ['christmas','2026-12-25','Sexta-feira – NATAL DO SENHOR','SOLENIDADE','Christmas','The Nativity of the Lord','Solemnity'],
  ['stephen','2026-12-26','S. Estêvão, Primeiro Mártir','FESTA','StStephenProtomartyr','Saint Stephen, the First Martyr','Feast'],
];

const snlPackage = {
  run: { publicationAllowed: false, promotionAllowed: false },
  events: vectors.map(([id,date,label,rank]) => snl(id,date,label,rank)),
};
const generalRoman = vectors.map(([,date,,,canonicalId,name,grade]) => roman(canonicalId,date,name,grade));
const result = reconcilePortugalSnl({ snlPackage, generalRoman });
for (const [id,,,,canonicalId] of vectors) {
  const item = result.items.find((entry) => entry.sourceOccurrenceId === id);
  assert.equal(item.candidate?.generalRomanId, canonicalId, `${id} canonical target`);
  assert.equal(item.disposition, 'canonical-link-proposal', `${id} must inherit the shared General Roman event`);
}
assert.equal(result.summary['precedence-delta-review'] ?? 0, 0);
console.log('Portugal shared Roman calendar structure false-positive regression vectors passed.');
