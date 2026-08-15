#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractPrimarySnlObservance, extractSnlObservances, normalizePortugalSnlAgenda, parseSnlIcs } from './normalize-portugal-snl-agenda.mjs';

const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SNL Portugal//Agenda Liturgica//PT\r\nBEGIN:VEVENT\r\nUID:antonio-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20260613\r\nSUMMARY:Sábado da semana X\r\nDESCRIPTION:S. António de Lisboa\\, presbítero e doutor da Igreja\\,\\nPadroeiro de Portugal – FESTA\\nBranco – Ofício da festa. Te Deum.\\nMissa própria.\\n\\n* No Patriarcado de Lisboa – S. António de Lisboa – SOLENIDADE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:alternatives-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261016\r\nSUMMARY:Sexta-feira da semana XXVIII\r\nDESCRIPTION:S. Hedwiges\\, religiosa – MF S. Margarida Maria Alacoque\\, virgem – MF\\nBranco – Ofício da memória.\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:teresa-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261015\r\nSUMMARY:Quinta-feira da semana XXVIII\r\nDESCRIPTION:S. Teresa de Jesus\\, virgem e doutora da Igreja – MO\\nBranco – Ofício da memória.\\n\\n* Na Ordem Carmelita – S. Teresa de Jesus – SOLENIDADE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:matias-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20260514\r\nSUMMARY:Quinta-feira da semana VI\r\nDESCRIPTION:S. Matias\\, apóstolo – FESTA\\nRogações.\\nVermelho – Ofício da festa. Te Deum.\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:vigil-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20260628\r\nSUMMARY:DOMINGO XIII DO TEMPO COMUM\r\nDESCRIPTION:Verde – Ofício do domingo (Semana I do Saltério). Te Deum.\\nMissa própria.\\n\\nSANTOS PEDRO E PAULO\\, apóstolos\\nSOLENIDADE\\n\\nDOMINGO à tarde\\nVermelho.\\nMissa própria da Vigília\\, Glória\\, Credo.\\n\\n* I Vésp. dos Santos Pedro e Paulo.\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:christmas-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261225\r\nSUMMARY:Sexta-feira – NATAL DO SENHOR\r\nDESCRIPTION:Branco – Ofício da solenidade. Te Deum.\\nMissa própria do dia.\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
const hash = createHash('sha256').update(ics).digest('hex');
const manifest = {
  schemaVersion: 1, sourceId: 'portugal-national-liturgy-secretariat',
  publisher: 'Secretariado Nacional de Liturgia', jurisdictionId: 'PT', churchId: 'roman-catholic',
  sourceUrl: 'https://www.liturgia.pt/agenda/agenda.ics', canonicalSubscriptionUrl: 'https://www.liturgia.pt/agenda/agenda.ics',
  retrievedAt: '2026-08-15T12:00:00.000Z', sha256: hash, eventCount: 6,
  publicationAllowed: false, productionMutation: false,
};

const parsed = parseSnlIcs(ics);
assert.equal(parsed.length, 6);
const anthony = extractPrimarySnlObservance(parsed[0].summary, parsed[0].description);
assert.equal(anthony.label, 'S. António de Lisboa, presbítero e doutor da Igreja, Padroeiro de Portugal');
assert.equal(anthony.rank, 'feast');
assert.equal(anthony.rankSource, 'description-leading-heading');
assert.doesNotMatch(anthony.evidenceHeading, /Patriarcado/u);

const alternatives = extractSnlObservances(parsed[1].summary, parsed[1].description);
assert.equal(alternatives.length, 2);
assert.deepEqual(alternatives.map((item) => item.label), ['S. Hedwiges, religiosa', 'S. Margarida Maria Alacoque, virgem']);
assert.ok(alternatives.every((item) => item.rank === 'optional-memorial' && item.groupedAlternative === true));

const teresa = extractPrimarySnlObservance(parsed[2].summary, parsed[2].description);
assert.equal(teresa.label, 'S. Teresa de Jesus, virgem e doutora da Igreja');
assert.equal(teresa.rank, 'memorial');
assert.doesNotMatch(teresa.evidenceHeading, /SOLENIDADE/u);

const matias = extractPrimarySnlObservance(parsed[3].summary, parsed[3].description);
assert.equal(matias.label, 'S. Matias, apóstolo');
assert.equal(matias.rank, 'feast');

const vigilDay = extractPrimarySnlObservance(parsed[4].summary, parsed[4].description);
assert.equal(vigilDay.label, 'DOMINGO XIII DO TEMPO COMUM');
assert.equal(vigilDay.rank, null);
assert.doesNotMatch(vigilDay.evidenceHeading, /PEDRO E PAULO|Vigília/iu);
assert.match(parsed[4].description, /Missa própria da Vigília/u);

const christmas = extractPrimarySnlObservance(parsed[5].summary, parsed[5].description);
assert.equal(christmas.label, 'Sexta-feira – NATAL DO SENHOR');
assert.equal(christmas.rank, 'solemnity');
assert.equal(christmas.rankSource, 'leading-office-line');

const normalized = normalizePortugalSnlAgenda(ics, manifest);
assert.equal(normalized.run.publicationAllowed, false);
assert.equal(normalized.run.promotionAllowed, false);
assert.equal(normalized.events.length, 7);
const vigilNormalized = normalized.events.find((event) => event.dateISO === '2026-06-28');
assert.equal(vigilNormalized.names.pt.value, 'DOMINGO XIII DO TEMPO COMUM');
assert.match(vigilNormalized.sourceFacts.rawDescription, /PEDRO E PAULO/u);
assert.doesNotMatch(vigilNormalized.sourceFacts.description, /PEDRO E PAULO/u);
assert.equal(vigilNormalized.sourceFacts.laterSourceMaterialPreservedOnly, true);
const grouped = normalized.events.filter((event) => event.dateISO === '2026-10-16');
assert.equal(grouped.length, 2);
assert.equal(new Set(grouped.map((event) => event.sourceFacts.alternativeGroupId)).size, 1);
assert.deepEqual(grouped.map((event) => event.sourceFacts.sourceOrdinal), [0, 1]);
assert.ok(normalized.events.every((event) => event.publicationStatus === 'withheld' && event.validationStatus === 'provisional'));
assert.deepEqual(normalized.coverage.years, [2026]);
assert.equal(normalized.coverage.sourceDayCount, 6);
assert.equal(normalized.coverage.civilDays, 6);
assert.equal(normalized.coverage.eventCount, 7);
assert.equal(normalized.coverage.multiObservanceDays, 1);

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdodia-snl-'));
try {
  const normalizedPath = path.join(root, 'normalized-package.json');
  const canonicalPath = path.join(root, 'canonical.json');
  fs.writeFileSync(normalizedPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  execFileSync(process.execPath, ['scripts/normalize-calendar-staging-package.mjs', '--input', normalizedPath, '--output', canonicalPath, '--manifest-sha256', 'a'.repeat(64)], { cwd: process.cwd(), stdio: 'pipe' });
  const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  assert.equal(canonical.occurrences.length, 7);
  assert.ok(canonical.occurrences.every((event) => event.publicationStatus === 'withheld'));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Portugal SNL leading-day, grouped observance, vigil boundary and staging tests passed.');
