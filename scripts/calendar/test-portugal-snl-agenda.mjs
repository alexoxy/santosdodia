#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalizePortugalSnlAgenda, parseSnlIcs } from './normalize-portugal-snl-agenda.mjs';

const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SNL Portugal//Agenda Liturgica//PT\r\nBEGIN:VEVENT\r\nUID:antonio-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20260613\r\nSUMMARY:S. António de Lisboa\\, presbítero e doutor da Igreja – FESTA\r\nDESCRIPTION:Padroeiro de Portugal\\nNo Patriarcado de Lisboa – SOLENIDADE\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:pedro-paulo-2026@liturgia.pt\r\nDTSTART;VALUE=DATE:20260629\r\nSUMMARY:Santos Pedro e Paulo\\, apóstolos – SOLE\r\n NIDADE\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
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
  eventCount: 2,
  publicationAllowed: false,
  productionMutation: false,
};

const parsed = parseSnlIcs(ics);
assert.equal(parsed.length, 2);
assert.equal(parsed[0].dateISO, '2026-06-13');
assert.equal(parsed[0].summary, 'S. António de Lisboa, presbítero e doutor da Igreja – FESTA');
assert.match(parsed[0].description, /Padroeiro de Portugal/u);
assert.equal(parsed[1].summary, 'Santos Pedro e Paulo, apóstolos – SOLENIDADE');

const normalized = normalizePortugalSnlAgenda(ics, manifest);
assert.equal(normalized.run.publicationAllowed, false);
assert.equal(normalized.run.promotionAllowed, false);
assert.equal(normalized.sources[0].authority, 'official-jurisdiction');
assert.equal(normalized.policies[0].churchId, 'roman-catholic');
assert.equal(normalized.policies[0].jurisdictionId, 'PT');
assert.equal(normalized.events.length, 2);
assert.ok(normalized.events.every((event) => event.publicationStatus === 'withheld'));
assert.ok(normalized.events.every((event) => event.validationStatus === 'provisional'));
assert.ok(normalized.events.every((event) => event.canonicalEventId.startsWith('source:snl-pt:')));
assert.deepEqual(normalized.coverage.years, [2026]);
assert.equal(normalized.coverage.civilDays, 2);

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
  assert.equal(canonical.occurrences.length, 2);
  assert.equal(canonical.sources[0].jurisdictionId, 'PT');
  assert.equal(canonical.occurrences[0].publicationStatus, 'withheld');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Portugal SNL ICS parsing and staging-contract tests passed.');
