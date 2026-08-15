#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractPrimarySnlObservance, normalizePortugalSnlAgenda, parseSnlIcs } from './normalize-portugal-snl-agenda.mjs';

const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SNL Portugal//Agenda Liturgica//PT\r\nBEGIN:VEVENT\r\nUID:antonio-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20260613\r\nSUMMARY:Sábado da semana X\r\nDESCRIPTION:S. António de Lisboa\\, presbítero e doutor da Igreja\\,\\nPadroeiro de Portugal – FESTA\\nBranco – Ofício da festa. Te Deum.\\nMissa própria.\\n\\n* No Patriarcado de Lisboa – S. António de Lisboa – SOLENIDADE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:teresa-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261015\r\nSUMMARY:Quinta-feira da semana XXVIII\r\nDESCRIPTION:S. Teresa de Jesus\\, virgem e doutora da Igreja – MO\\nBranco – Ofício da memória.\\n\\n* Na Ordem Carmelita – S. Teresa de Jesus – SOLENIDADE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:christmas-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20261225\r\nSUMMARY:Sexta-feira – NATAL DO SENHOR\r\nDESCRIPTION:Branco – Ofício da solenidade. Te Deum.\\nMissa própria do dia.\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
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
  eventCount: 3,
  publicationAllowed: false,
  productionMutation: false,
};

const parsed = parseSnlIcs(ics);
assert.equal(parsed.length, 3);
assert.equal(parsed[0].dateISO, '2026-06-13');
assert.equal(parsed[0].summary, 'Sábado da semana X');
assert.match(parsed[0].description, /Padroeiro de Portugal/u);

const anthonyPrimary = extractPrimarySnlObservance(parsed[0].summary, parsed[0].description);
assert.equal(anthonyPrimary.label, 'S. António de Lisboa, presbítero e doutor da Igreja, Padroeiro de Portugal');
assert.equal(anthonyPrimary.rank, 'feast');
assert.equal(anthonyPrimary.rankSource, 'description-heading');
assert.doesNotMatch(anthonyPrimary.evidenceHeading, /Patriarcado/u);

const teresaPrimary = extractPrimarySnlObservance(parsed[1].summary, parsed[1].description);
assert.equal(teresaPrimary.label, 'S. Teresa de Jesus, virgem e doutora da Igreja');
assert.equal(teresaPrimary.rank, 'memorial');
assert.doesNotMatch(teresaPrimary.evidenceHeading, /SOLENIDADE/u);

const christmasPrimary = extractPrimarySnlObservance(parsed[2].summary, parsed[2].description);
assert.equal(christmasPrimary.label, 'Sexta-feira – NATAL DO SENHOR');
assert.equal(christmasPrimary.rank, 'solemnity');
assert.equal(christmasPrimary.rankSource, 'office-line');

const normalized = normalizePortugalSnlAgenda(ics, manifest);
assert.equal(normalized.run.publicationAllowed, false);
assert.equal(normalized.run.promotionAllowed, false);
assert.equal(normalized.sources[0].authority, 'official-jurisdiction');
assert.equal(normalized.policies[0].churchId, 'roman-catholic');
assert.equal(normalized.policies[0].jurisdictionId, 'PT');
assert.equal(normalized.events.length, 3);
assert.equal(normalized.events[0].names.pt.value, anthonyPrimary.label);
assert.equal(normalized.events[0].sourceFacts.dayLabel, 'Sábado da semana X');
assert.equal(normalized.events[0].sourceFacts.primaryObservance.rank, 'feast');
assert.match(normalized.events[0].sourceFacts.rawDescription, /Patriarcado/u);
assert.doesNotMatch(normalized.events[0].sourceFacts.description, /Patriarcado/u);
assert.equal(normalized.events[1].sourceFacts.primaryObservance.rank, 'memorial');
assert.ok(normalized.events.every((event) => event.publicationStatus === 'withheld'));
assert.ok(normalized.events.every((event) => event.validationStatus === 'provisional'));
assert.ok(normalized.events.every((event) => event.canonicalEventId.startsWith('source:snl-pt:')));
assert.deepEqual(normalized.coverage.years, [2026]);
assert.equal(normalized.coverage.civilDays, 3);
assert.equal(normalized.coverage.explicitPrimaryObservances, 2);

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
  assert.equal(canonical.occurrences.length, 3);
  assert.equal(canonical.sources[0].jurisdictionId, 'PT');
  assert.equal(canonical.occurrences[0].publicationStatus, 'withheld');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Portugal SNL ICS parsing, primary observance and staging-contract tests passed.');
