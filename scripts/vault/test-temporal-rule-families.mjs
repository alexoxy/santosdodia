#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const familyDataset = JSON.parse(fs.readFileSync(path.join(root, 'data/canonical-temporal-rule-families.json'), 'utf8'));
const shadow = JSON.parse(fs.readFileSync(path.join(root, 'data/migrations/roman-catholic-pt-2026-v2.temporal-family-shadow.json'), 'utf8'));
function assert(condition, message) { if (!condition) throw new Error(message); }

assert(familyDataset?.schemaVersion === 1 && familyDataset?.temporalRuleFamilyModelVersion === '1.0' && familyDataset?.status === 'repository-reviewed-temporal-rule-family-anchors', 'TemporalRuleFamily dataset is invalid.');
assert(Array.isArray(familyDataset?.families) && familyDataset.families.length === 2, 'TemporalRuleFamily bootstrap must contain exactly Lent and Easter weekday families.');
assert(shadow?.schemaVersion === 1 && shadow?.status === 'approved-release-temporal-family-shadow' && shadow?.sourceReleaseId === 'roman-catholic-pt-2026-v2', 'TemporalRuleFamily shadow snapshot is invalid.');
assert(shadow?.sourceArtifact?.artifactId === 9277632698 && shadow?.sourceArtifact?.buildJsonSha256 === '159f38f1ee763517ee4dfae738237ced2c7f243146ba3f593e5b096feaaafc06', 'TemporalRuleFamily shadow is not pinned to the approved Portugal artifact.');
assert(shadow?.year === 2026 && shadow?.mutationAllowed === false, 'TemporalRuleFamily shadow must remain 2026/read-only.');

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-temporal-families-'));
try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  const enginePath = path.join(root, 'lib/knowledge/calendar-engine.ts');
  const compiled = ts.transpileModule(fs.readFileSync(enginePath, 'utf8'), {
    fileName: enginePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some((item) => item.category === ts.DiagnosticCategory.Error), 'calendar-engine.ts transpilation returned errors in TemporalRuleFamily test.');
  fs.writeFileSync(path.join(temporaryDirectory, 'calendar-engine.js'), compiled.outputText, 'utf8');
  const calendar = await import(`${pathToFileURL(path.join(temporaryDirectory, 'calendar-engine.js')).href}?v=${Date.now()}`);

  const snapshotFamilies = new Map((shadow.families ?? []).map((item) => [item.familyId, item]));
  const suppressions = new Map((shadow.suppressedCandidates ?? []).map((item) => [`${item.familyId}\u0000${item.week}\u0000${item.weekday}`, item]));
  const seenCandidateKeys = new Set();
  const seenPresentLegacyIds = new Set();
  let candidateCount = 0;
  let presentCount = 0;
  let suppressedCount = 0;

  for (const family of familyDataset.families) {
    assert(family?.churchId === 'church:roman-catholic' && family?.calendarSystem === 'gregorian', `${family?.id} must remain Roman Catholic/Gregorian.`);
    assert(family?.anchor === 'gregorian-easter', `${family.id} must remain Easter-anchored.`);
    assert(family?.weekStrideDays === 7 && family?.candidateRequiresPrecedenceResolution === true, `${family.id} must require explicit precedence resolution.`);
    assert(Number.isInteger(family?.weekRange?.min) && Number.isInteger(family?.weekRange?.max) && family.weekRange.min <= family.weekRange.max, `${family.id} has invalid week range.`);
    const snapshot = snapshotFamilies.get(family.id);
    assert(snapshot && Array.isArray(snapshot.presentLegacyIds), `${family.id} has no approved-release presence snapshot.`);
    const presentIds = new Set(snapshot.presentLegacyIds);
    assert(presentIds.size === snapshot.presentLegacyIds.length, `${family.id} contains duplicate present legacy IDs.`);

    const prefix = family.observanceFamilyKey === 'lent-weekday' ? 'LentWeekday' : family.observanceFamilyKey === 'easter-weekday' ? 'EasterWeekday' : null;
    assert(prefix, `${family.id} uses unsupported bootstrap family key.`);

    for (let week = family.weekRange.min; week <= family.weekRange.max; week += 1) {
      for (const [weekday, weekdayOffset] of Object.entries(family.weekdayOffsets)) {
        candidateCount += 1;
        const candidateKey = `${family.id}\u0000${week}\u0000${weekday}`;
        assert(!seenCandidateKeys.has(candidateKey), `Duplicate temporal family candidate ${candidateKey}.`);
        seenCandidateKeys.add(candidateKey);
        const offsetDays = family.baseOffsetDays + ((week - 1) * family.weekStrideDays) + weekdayOffset;
        const resolved = calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: family.anchor, offsetDays }, shadow.year);
        assert(resolved.status === 'resolved', `${candidateKey} failed to resolve.`);
        const weekdayToken = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        const legacyId = `rc:${prefix}${week}${weekdayToken}`;
        const suppression = suppressions.get(candidateKey);
        const isPresent = presentIds.has(legacyId);
        assert(isPresent !== Boolean(suppression), `${candidateKey} must be either present or suppressed, never both/neither.`);

        if (isPresent) {
          presentCount += 1;
          assert(!seenPresentLegacyIds.has(legacyId), `Duplicate family coverage ${legacyId}.`);
          seenPresentLegacyIds.add(legacyId);
        } else {
          suppressedCount += 1;
          assert(suppression.candidateDateISO === resolved.dateISO, `${candidateKey} suppression date ${suppression.candidateDateISO} differs from generated ${resolved.dateISO}.`);
          assert(typeof suppression.suppressingLegacyObservanceId === 'string' && !suppression.suppressingLegacyObservanceId.startsWith(`rc:${prefix}${week}`), `${candidateKey} lacks a distinct suppressing observance.`);
          assert(['optional-memorial', 'memorial', 'feast', 'solemnity'].includes(suppression.suppressingRank), `${candidateKey} has unsupported suppressing rank.`);
        }
      }
    }
  }

  assert(candidateCount === 66, `Expected 66 Lent/Easter weekday candidates, got ${candidateCount}.`);
  assert(presentCount === 47 && seenPresentLegacyIds.size === 47, `Expected 47 approved family occurrences, got ${presentCount}.`);
  assert(suppressedCount === 19 && suppressions.size === 19, `Expected 19 precedence suppressions, got ${suppressedCount}.`);
  assert(presentCount + suppressedCount === candidateCount, 'Every temporal family candidate must have an explicit precedence outcome.');
  assert(seenPresentLegacyIds.has('rc:LentWeekday1Monday'), 'Lent family lost its first weekday anchor.');
  assert(seenPresentLegacyIds.has('rc:EasterWeekday7Saturday'), 'Easter family lost its final weekday anchor.');
  assert(!seenPresentLegacyIds.has('rc:LentWeekday4Thursday'), 'St Joseph precedence suppression was lost.');
  assert(!seenPresentLegacyIds.has('rc:EasterWeekday6Wednesday'), 'Fatima precedence suppression was lost.');

  console.log(`TemporalRuleFamily test passed: ${candidateCount} candidates = ${presentCount} approved occurrences + ${suppressedCount} precedence suppressions; no suppressed candidate counts as coverage.`);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
