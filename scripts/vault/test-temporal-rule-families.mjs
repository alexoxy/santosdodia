#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const familyDataset = JSON.parse(fs.readFileSync(path.join(root, 'data/canonical-temporal-rule-families.json'), 'utf8'));
const shadow = JSON.parse(fs.readFileSync(path.join(root, 'data/migrations/roman-catholic-pt-2026-v2.temporal-family-shadow.json'), 'utf8'));
const expectedMemberProfiles = {
  'sunday': ['sunday'],
  'weekday-monday-saturday': ['friday', 'monday', 'saturday', 'thursday', 'tuesday', 'wednesday'],
  'weekday-monday-wednesday': ['monday', 'tuesday', 'wednesday']
};
const expectedLegacyRanks = ['weekday', 'solemnity', 'celebration with precedence over solemnities'];
function assert(condition, message) { if (!condition) throw new Error(message); }

assert(familyDataset?.schemaVersion === 1 && familyDataset?.temporalRuleFamilyModelVersion === '1.3' && familyDataset?.status === 'repository-reviewed-temporal-rule-family-anchors', 'TemporalRuleFamily dataset is invalid.');
assert(Array.isArray(familyDataset?.families) && familyDataset.families.length === 9, 'TemporalRuleFamily bootstrap must contain weekday, Holy Week, Easter Octave, seasonal-Sunday and two-segment Ordinary Time Sunday families.');
assert(shadow?.schemaVersion === 1 && shadow?.status === 'approved-release-temporal-family-shadow' && shadow?.sourceReleaseId === 'roman-catholic-pt-2026-v2', 'TemporalRuleFamily shadow snapshot is invalid.');
assert(shadow?.sourceArtifact?.workflowRunId === 31998552573 && shadow?.sourceArtifact?.artifactId === 9277632698 && shadow?.sourceArtifact?.buildJsonSha256 === '159f38f1ee763517ee4dfae738237ced2c7f243146ba3f593e5b096feaaafc06', 'TemporalRuleFamily shadow is not pinned to the approved Portugal artifact.');
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
  const seenSourceOccurrenceIds = new Set();
  const seenSourceRecordHashes = new Set();
  const seenCanonicalOccurrenceIds = new Set();
  let candidateCount = 0;
  let presentCount = 0;
  let suppressedCount = 0;

  for (const family of familyDataset.families) {
    assert(family?.churchId === 'church:roman-catholic' && family?.calendarSystem === 'gregorian', `${family?.id} must remain Roman Catholic/Gregorian.`);
    assert(['gregorian-easter', 'advent-start', 'ordinary-time-second-sunday'].includes(family?.anchor), `${family.id} has an unsupported canonical anchor.`);
    assert(family?.weekStrideDays === 7 && family?.candidateRequiresPrecedenceResolution === true, `${family.id} must require explicit precedence resolution.`);
    assert(typeof family?.observanceIdPattern === 'string' && family.observanceIdPattern.startsWith('observance:') && family.observanceIdPattern.endsWith(':roman-catholic'), `${family.id} has an invalid canonical Observance pattern.`);
    const expectedMembers = expectedMemberProfiles[family.memberProfile];
    assert(expectedMembers && JSON.stringify(Object.keys(family?.weekdayOffsets ?? {}).sort()) === JSON.stringify(expectedMembers), `${family.id} has an invalid member/rank profile.`);
    assert(expectedLegacyRanks.includes(family.legacyRank), `${family.id} has an unsupported source rank.`);
    assert(Array.isArray(family?.evidence) && family.evidence.length > 0 && family.evidence.every((item) => { const host = new URL(item.url).hostname.toLowerCase(); return host === 'vatican.va' || host.endsWith('.vatican.va'); }), `${family.id} lacks Holy See evidence.`);
    assert(Number.isInteger(family?.weekRange?.min) && Number.isInteger(family?.weekRange?.max) && family.weekRange.min <= family.weekRange.max, `${family.id} has invalid week range.`);
    const snapshot = snapshotFamilies.get(family.id);
    assert(snapshot && Array.isArray(snapshot.presentLegacyIds) && Array.isArray(snapshot.presentMappings), `${family.id} has no approved-release exact presence snapshot.`);
    const presentIds = new Set(snapshot.presentLegacyIds);
    assert(presentIds.size === snapshot.presentLegacyIds.length, `${family.id} contains duplicate present legacy IDs.`);
    const mappings = new Map(snapshot.presentMappings.map((item) => [`${item.week}\u0000${item.weekday}`, item]));
    assert(mappings.size === snapshot.presentMappings.length && mappings.size === presentIds.size, `${family.id} exact mappings differ from its present identities.`);

    assert(typeof family.legacyObservanceIdPattern === 'string' && family.legacyObservanceIdPattern.startsWith('rc:'), `${family.id} lacks a legacy identity pattern.`);

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
        const legacyId = family.legacyObservanceIdPattern
          .replace('{week}', String(week))
          .replace('{weekday}', weekday)
          .replace('{weekdayShort}', `${weekday.charAt(0).toUpperCase()}${weekday.slice(1, 3)}`)
          .replace('{weekdayTitle}', weekdayToken);
        const suppression = suppressions.get(candidateKey);
        const isPresent = presentIds.has(legacyId);
        assert(isPresent !== Boolean(suppression), `${candidateKey} must be either present or suppressed, never both/neither.`);

        if (isPresent) {
          presentCount += 1;
          assert(!seenPresentLegacyIds.has(legacyId), `Duplicate family coverage ${legacyId}.`);
          seenPresentLegacyIds.add(legacyId);
          const mapping = mappings.get(`${week}\u0000${weekday}`);
          assert(mapping?.legacyObservanceId === legacyId && mapping?.expectedDateISO === resolved.dateISO, `${candidateKey} exact source mapping differs from its canonical candidate.`);
          const canonicalObservanceId = family.observanceIdPattern
            .replace('{observanceFamilyKey}', family.observanceFamilyKey)
            .replace('{week}', String(week))
            .replace('{weekday}', weekday);
          assert(!canonicalObservanceId.includes('{'), `${candidateKey} leaves an unresolved Observance identity token.`);
          const expectedOccurrenceId = `occurrence:${resolved.dateISO}:${canonicalObservanceId.slice('observance:'.length)}:pt`;
          assert(mapping.occurrenceId === expectedOccurrenceId, `${candidateKey} canonical Occurrence identity drifted.`);
          assert(mapping.sourceOccurrenceId?.startsWith(`snl-pt-${resolved.dateISO}-`) && !seenSourceOccurrenceIds.has(mapping.sourceOccurrenceId), `${candidateKey} lacks a unique SNL occurrence identity.`);
          assert(/^[a-f0-9]{64}$/u.test(mapping.sourceRecordHash ?? '') && !seenSourceRecordHashes.has(mapping.sourceRecordHash), `${candidateKey} lacks a unique exact source record hash.`);
          assert(!seenCanonicalOccurrenceIds.has(mapping.occurrenceId), `${candidateKey} duplicates a canonical Occurrence identity.`);
          assert(mapping.legacyRank === family.legacyRank && mapping.reviewStatus === 'inherited-safe' && mapping.resolution === 'inherit-general-canonical-binding', `${candidateKey} lacks its approved precedence result.`);
          seenSourceOccurrenceIds.add(mapping.sourceOccurrenceId);
          seenSourceRecordHashes.add(mapping.sourceRecordHash);
          seenCanonicalOccurrenceIds.add(mapping.occurrenceId);
        } else {
          suppressedCount += 1;
          assert(suppression.candidateDateISO === resolved.dateISO, `${candidateKey} suppression date ${suppression.candidateDateISO} differs from generated ${resolved.dateISO}.`);
          assert(typeof suppression.suppressingLegacyObservanceId === 'string' && suppression.suppressingLegacyObservanceId !== legacyId, `${candidateKey} lacks a distinct suppressing observance.`);
          assert(['optional-memorial', 'memorial', 'feast', 'solemnity'].includes(suppression.suppressingRank), `${candidateKey} has unsupported suppressing rank.`);
        }
      }
    }
  }

  assert(candidateCount === 120, `Expected 120 temporal family candidates, got ${candidateCount}.`);
  assert(presentCount === 96 && seenPresentLegacyIds.size === 96, `Expected 96 approved family occurrences, got ${presentCount}.`);
  assert(seenSourceOccurrenceIds.size === 96 && seenSourceRecordHashes.size === 96 && seenCanonicalOccurrenceIds.size === 96, 'Every approved TemporalRuleFamily occurrence requires unique source and canonical identities.');
  assert(suppressedCount === 24 && suppressions.size === 24, `Expected 24 precedence or season-boundary suppressions, got ${suppressedCount}.`);
  assert(presentCount + suppressedCount === candidateCount, 'Every temporal family candidate must have an explicit precedence outcome.');
  assert(seenPresentLegacyIds.has('rc:LentWeekday1Monday'), 'Lent family lost its first weekday anchor.');
  assert(seenPresentLegacyIds.has('rc:EasterWeekday7Saturday'), 'Easter family lost its final weekday anchor.');
  assert(seenPresentLegacyIds.has('rc:MonHolyWeek') && seenPresentLegacyIds.has('rc:WedHolyWeek'), 'Holy Week weekday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:MonOctaveEaster') && seenPresentLegacyIds.has('rc:SatOctaveEaster'), 'Easter Octave weekday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:Lent2') && seenPresentLegacyIds.has('rc:Lent5'), 'Lent Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:Easter2') && seenPresentLegacyIds.has('rc:Easter6'), 'Easter Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:Advent2') && seenPresentLegacyIds.has('rc:Advent4'), 'Advent Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:OrdSunday2') && seenPresentLegacyIds.has('rc:OrdSunday6'), 'Early Ordinary Time Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:OrdSunday10') && seenPresentLegacyIds.has('rc:OrdSunday33'), 'Late Ordinary Time Sunday family boundaries drifted.');
  assert(!seenPresentLegacyIds.has('rc:OrdSunday7') && !seenPresentLegacyIds.has('rc:OrdSunday9'), 'Lent season-boundary suppressions were lost.');
  assert(!seenPresentLegacyIds.has('rc:OrdSunday31') && !seenPresentLegacyIds.has('rc:OrdSunday34'), 'All Saints or Christ the King suppression was lost.');
  assert(!seenPresentLegacyIds.has('rc:LentWeekday4Thursday'), 'St Joseph precedence suppression was lost.');
  assert(!seenPresentLegacyIds.has('rc:EasterWeekday6Wednesday'), 'Fatima precedence suppression was lost.');

  for (let year = 2020; year <= 2030; year += 1) {
    const resolution = calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: 'ordinary-time-second-sunday', offsetDays: 0 }, year);
    const date = new Date(`${resolution.dateISO}T00:00:00Z`);
    assert(resolution.status === 'resolved' && date.getUTCDay() === 0 && date.getUTCMonth() === 0 && date.getUTCDate() >= 14 && date.getUTCDate() <= 20, `Ordinary Time second Sunday anchor failed for ${year}.`);
    const easter = calendar.gregorianEaster(year);
    const easterDate = new Date(Date.UTC(easter.year, easter.month - 1, easter.day));
    const holyMonday = calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: 'gregorian-easter', offsetDays: -6 }, year);
    const octaveSaturday = calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: 'gregorian-easter', offsetDays: 6 }, year);
    assert(holyMonday.status === 'resolved' && (Date.parse(`${holyMonday.dateISO}T00:00:00Z`) - easterDate.getTime()) / 86400000 === -6, `Holy Week family failed for ${year}.`);
    assert(octaveSaturday.status === 'resolved' && (Date.parse(`${octaveSaturday.dateISO}T00:00:00Z`) - easterDate.getTime()) / 86400000 === 6, `Easter Octave family failed for ${year}.`);
  }

  console.log(`TemporalRuleFamily test passed: ${candidateCount} candidates = ${presentCount} exact source-bound occurrences + ${suppressedCount} precedence suppressions; no suppressed candidate counts as coverage.`);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
