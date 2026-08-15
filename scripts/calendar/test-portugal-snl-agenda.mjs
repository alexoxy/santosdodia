#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractPrimarySnlObservance, extractSnlObservances, normalizePortugalSnlAgenda, parseSnlIcs } from './normalize-portugal-snl-agenda.mjs';

const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SNL Portugal//Agenda Liturgica//PT\r\nBEGIN:VEVENT\r\nUID:antonio-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20260613\r\nSUMMARY:Sábado da semana X\r\nDESCRIPTION:S. António de Lisboa\\, presbítero e doutor da Igreja\\,\\nPadroeiro de Portugal – FESTA\\nBranco – Ofício da festa. Te Deum.\\nMissa própria.\\n\\n* No Patriarcado de Lisboa – S. António de Lisboa – SOLENIDADE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:alternatives-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261016\r\nSUMMARY:Sexta-feira da semana XXVIII\r\nDESCRIPTION:S. Hedwiges\\, religiosa – MF S. Margarida Maria Alacoque\\, virgem – MF\\nBranco – Ofício da memória.\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:teresa-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261015\r\nSUMMARY:Quinta-feira da semana XXVIII\r\nDESCRIPTION:S. Teresa de Jesus\\, virgem e doutora da Igreja – MO\\nBranco – Ofício da memória.\\n\\n* Na Ordem Carmelita – S. Teresa de Jesus – SOLENIDADE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:christmas-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261225\r\nSUMMARY:Sexta-feira – NATAL DO SENHOR\r\nDESCRIPTION:Branco – Ofício da solenidade. Te Deum.\\nMissa própria do dia.\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
const hash = createHash('sha256').update(ics).digest('hex');
const manifest = {
  schemaVersion: 1,
  sourceId: 'portugal-national-liturgy-secretariat',
  publisher: 'Secretariado Nacional de Liturgia',
  jurisdictionId: 'PT',
  churchId: 'roman-catholic',
  sourceUrl: 'https://www.liturgia.pt/agenda/agenda.ics',
  canonicalSubscriptionUrl: 'https://www.liturgia.pt/agenda/agenda.ics',
  retrievedAt: '2026-08-15T12:00:00.000Z',
  sha256: hash,
  eventCount: 4,
  publicationAllowed: false,
  productionMutation: false,
};

const parsed = parseSnlIcs(ics);
assert.equal(parsed.length, 4);
assert.equal(parsed[0].dateISO, '2026-06-13');
assert.equal(parsed[0].summary, 'Sábado da semana X');
assert.match(parsed[0].description, /Padroeiro de Portugal/u);

const anthonyPrimary = extractPrimarySnlObservance(parsed[0].summary, parsed[0].description);
assert.equal(anthonyPrimary.label, 'S. António de Lisboa, presbítero e doutor da Igreja, Padroeiro de Portugal');
assert.equal(anthonyPrimary.rank, 'feast');
assert.equal(anthonyPrimary.rankSource, 'description-heading');
assert.doesNotMatch(anthonyPrimary.evidenceHeading, /Patriarcado/u);

const alternatives = extractSnlObservances(parsed[1].summary, parsed[1].description);
assert.equal(alternatives.length, 2);
assert.deepEqual(alternatives.map((item) => item.label), ['S. Hedwiges, religiosa', 'S. Margarida Maria Alacoque, virgem']);
assert.ok(alternatives.every((item) => item.rank === 'optional-memorial'));
assert.ok(alternatives.every((item) => item.groupedAlternative === true));
assert.deepEqual(alternatives.map((item) => item.sourceOrdinal), [0, 1]);

const teresaPrimary = extractPrimarySnlObservance(parsed[2].summary, parsed[2].description);
assert.equal(teresaPrimary.label, 'S. Teresa de Jesus, virgem e doutora da Igreja');
assert.equal(teresaPrimary.rank, 'memorial');
assert.doesNotMatch(teresaPrimary.evidenceHeading, /SOLENIDADE/u);

const christmasPrimary = extractPrimarySnlObservance(parsed[3].summary, parsed[3].description);
assert.equal(christmasPrimary.label, 'Sexta-feira – NATAL DO SENHOR');
assert.equal(christmasPrimary.rank, 'solemnity');
assert.equal(christmasPrimary.rankSource, 'office-line');

const normalized = normalizePortugalSnlAgenda(ics, manifest);
assert.equal(normalized.run.publicationAllowed, false);
assert.equal(normalized.run.promotionAllowed, false);
assert.equal(normalized.sources[0].authority, 'official-jurisdiction');
assert.equal(normalized.policies[0].churchId, 'roman-catholic');
assert.equal(normalized.policies[0].jurisdictionId, 'PT');
assert.equal(normalized.events.length, 5);
assert.equal(normalized.events[0].names.pt.value, anthonyPrimary.label);
assert.equal(normalized.events[0].sourceFacts.dayLabel, 'Sábado da semana X');
assert.equal(normalized.events[0].sourceFacts.primaryObservance.rank, 'feast');
assert.match(normalized.events[0].sourceFacts.rawDescription, /Patriarcado/u);
assert.doesNotMatch(normalized.events[0].sourceFacts.description, /Patriarcado/u);

const grouped = normalized.events.filter((event) => event.dateISO === '2026-10-16');
assert.equal(grouped.length, 2);
assert.equal(new Set(grouped.map((event) => event.sourceFacts.alternativeGroupId)).size, 1);
assert.ok(grouped.every((event) => event.sourceFacts.groupedAlternative === true));
assert.deepEqual(grouped.map((event) => event.sourceFacts.sourceOrdinal), [0, 1]);
assert.notEqual(grouped[0].canonicalEventId, grouped[1].canonicalEventId);

assert.ok(normalized.events.every((event) => event.publicationStatus === 'withheld'));
assert.ok(normalized.events.every((event) => event.validationStatus === 'provisional'));
assert.ok(normalized.events.every((event) => event.canonicalEventId.startsWith('source:snl-pt:')));
assert.deepEqual(normalized.coverage.years, [2026]);
assert.equal(normalized.coverage.sourceDayCount, 4);
assert.equal(normalized.coverage.civilDays, 4);
assert.equal(normalized.coverage.eventCount, 5);
assert.equal(normalized.coverage.explicitPrimaryObservances, 4);
assert.equal(normalized.coverage.multiObservanceDays, 1);

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdodia-snl-'));
try {
  const normalizedPath = path.join(root, 'normalized-package.json');
  const canonicalPath = path.join(root, 'canonical.json');
  fs.writeFileSync(normalizedPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  execFileSync(process.execPath, [
    'scripts/normalize-calendar-staging-package.mjs',
    '--input', normalizedPath,
    '--output', canonicalPath,
    '--manifest-sha256', 'a'.repeat(64),
  ], { cwd: process.cwd(), stdio: 'pipe' });
  const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  assert.equal(canonical.occurrences.length, 5);
  assert.equal(canonical.sources[0].jurisdictionId, 'PT');
  assert.ok(canonical.occurrences.every((event) => event.publicationStatus === 'withheld'));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Portugal SNL ICS parsing, grouped observance and staging-contract tests passed.');
