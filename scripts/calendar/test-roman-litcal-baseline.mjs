#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { auditRomanLitcalBaseline, buildRomanLitcalBaseline } from './build-roman-litcal-baseline.mjs';

const policy = JSON.parse(fs.readFileSync('data/osint/policies/litcal-calendar-facts-policy.json','utf8'));
assert.equal(policy.decision, 'approved-structured-facts-only');
assert.equal(policy.normativeAuthority, false);
assert.equal(policy.publication.candidateDefault, 'withheld');
assert.equal(policy.publication.requiresLanguageGateForRequestedLocale, true);
assert.ok(policy.blockedUses.includes('biography-copying'));
assert.ok(policy.blockedUses.includes('automatic-theological-recognition-inference'));

const root = path.resolve('data/litcal-mirror/calendars/general');
const candidate = buildRomanLitcalBaseline({ root, years: [2025, 2026, 2027, 2028] });
const audit = auditRomanLitcalBaseline(candidate);
if (!audit.ok) throw new Error(audit.errors.join('; '));

assert.equal(candidate.churchId, 'roman-catholic');
assert.equal(candidate.policy.productionWrites, false);
assert.equal(candidate.policy.editorialTextIncluded, false);
assert.ok(candidate.occurrences.length >= 320, `Expected a substantial four-year candidate baseline, got ${candidate.occurrences.length}.`);
assert.ok(candidate.occurrences.every(item => item.publicationStatus === 'withheld'));
assert.ok(candidate.occurrences.every(item => item.validationStatus === 'provisional'));
assert.ok(candidate.occurrences.every(item => item.labels.some(label => label.locale === 'en')));
assert.ok(candidate.occurrences.every(item => !String(item.sourceEventId).toLowerCase().includes('vigil')));
assert.ok(candidate.occurrences.every(item => item.sourceGradeNumber === null || item.sourceGradeNumber > 0));
assert.ok(candidate.summary.localesPresent.includes('en'));
assert.ok(candidate.summary.missingProductLocales.includes('pt'), 'Current General Roman mirror should explicitly report the missing Portuguese source locale instead of silently falling back to English.');
assert.ok(candidate.summary.byCategory.saint > 0 || candidate.summary.byCategory.martyr > 0 || candidate.summary.byCategory.apostle > 0);
assert.ok(candidate.summary.byCategory.feast > 0);

const unknownChurch = structuredClone(candidate);
unknownChurch.occurrences[0].churchId = 'unknown-church';
assert.equal(auditRomanLitcalBaseline(unknownChurch).ok, false);
const leakedWeekday = structuredClone(candidate);
leakedWeekday.occurrences[0].sourceGradeNumber = 0;
assert.equal(auditRomanLitcalBaseline(leakedWeekday).ok, false);
const published = structuredClone(candidate);
published.occurrences[0].publicationStatus = 'published';
assert.equal(auditRomanLitcalBaseline(published).ok, false);

console.log(JSON.stringify({
  message: 'Roman LitCal baseline candidate safeguards passed.',
  occurrenceCount: candidate.occurrences.length,
  byYear: audit.byYear,
  localesPresent: candidate.summary.localesPresent,
  missingProductLocales: candidate.summary.missingProductLocales,
  excluded: candidate.summary.excluded
}, null, 2));
