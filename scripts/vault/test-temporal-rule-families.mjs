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
  'sequential-day': ['day'],
  'saturday': ['saturday'],
  'sunday': ['sunday'],
  'weekday-monday-saturday': ['friday', 'monday', 'saturday', 'thursday', 'tuesday', 'wednesday'],
  'weekday-monday-wednesday': ['monday', 'tuesday', 'wednesday'],
  'weekday-tuesday-wednesday': ['tuesday', 'wednesday']
};
const expectedLegacyRanks = ['weekday', 'optional-memorial', 'solemnity', 'celebration with precedence over solemnities'];
function assert(condition, message) { if (!condition) throw new Error(message); }

assert(familyDataset?.schemaVersion === 1 && familyDataset?.temporalRuleFamilyModelVersion === '1.7' && familyDataset?.status === 'repository-reviewed-temporal-rule-family-anchors', 'TemporalRuleFamily dataset is invalid.');
assert(Array.isArray(familyDataset?.families) && familyDataset.families.length === 15, 'TemporalRuleFamily bootstrap must contain the reviewed seasonal, Portugal Epiphany interval, Ordinary Time weekday and optional Saturday Marian families.');
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
  const withheldCandidates = new Map((shadow.withheldCandidates ?? []).map((item) => [`${item.familyId}\u0000${item.week}\u0000${item.weekday}`, item]));
  const seenCandidateKeys = new Set();
  const seenPresentLegacyIds = new Set();
  const seenSourceOccurrenceIds = new Set();
  const seenSourceRecordHashes = new Set();
  const seenCanonicalOccurrenceIds = new Set();
  let candidateCount = 0;
  let presentCount = 0;
  let suppressedCount = 0;
  let withheldCount = 0;

  for (const family of familyDataset.families) {
    assert(family?.churchId === 'church:roman-catholic' && family?.calendarSystem === 'gregorian', `${family?.id} must remain Roman Catholic/Gregorian.`);
    assert(['gregorian-easter', 'advent-start', 'ordinary-time-second-sunday', 'effective-portugal-epiphany'].includes(family?.anchor), `${family.id} has an unsupported canonical anchor.`);
    assert(family?.weekStrideDays === (family.anchor === 'effective-portugal-epiphany' ? 1 : 7) && family?.candidateRequiresPrecedenceResolution === true, `${family.id} must require explicit precedence resolution.`);
    assert(typeof family?.observanceIdPattern === 'string' && family.observanceIdPattern.startsWith('observance:') && family.observanceIdPattern.endsWith(':roman-catholic'), `${family.id} has an invalid canonical Observance pattern.`);
    const expectedMembers = expectedMemberProfiles[family.memberProfile];
    assert(expectedMembers && JSON.stringify(Object.keys(family?.weekdayOffsets ?? {}).sort()) === JSON.stringify(expectedMembers), `${family.id} has an invalid member/rank profile.`);
    assert(expectedLegacyRanks.includes(family.legacyRank), `${family.id} has an unsupported source rank.`);
    if (family.memberProfile === 'saturday') assert(family.selectionMode === 'optional-alternative' && family.obligatory === false, `${family.id} must remain an optional, non-obligatory alternative.`);
    const evidenceHosts = (family?.evidence ?? []).map((item) => new URL(item.url).hostname.toLowerCase());
    assert(evidenceHosts.some((host) => host === 'vatican.va' || host.endsWith('.vatican.va')), `${family.id} lacks Holy See evidence.`);
    if (family.anchor === 'effective-portugal-epiphany') assert(family.jurisdictionId === 'jurisdiction:roman-catholic:pt' && family.boundary === 'effective-portugal-baptism-of-the-lord' && evidenceHosts.some((host) => host === 'liturgia.pt' || host.endsWith('.liturgia.pt')), `${family.id} lacks its Portugal boundary evidence.`);
    assert(Number.isInteger(family?.weekRange?.min) && Number.isInteger(family?.weekRange?.max) && family.weekRange.min <= family.weekRange.max, `${family.id} has invalid week range.`);
    if (family.exclusiveStartDateRule) assert(family.exclusiveStartDateRule.type === 'relative' && family.exclusiveStartDateRule.calendar === 'gregorian' && family.exclusiveStartDateRule.anchor === 'pentecost' && Number.isInteger(family.exclusiveStartDateRule.offsetDays), `${family.id} has an invalid exclusive start boundary.`);
    if (family.exclusiveEndDateRule) assert(family.exclusiveEndDateRule.type === 'relative' && family.exclusiveEndDateRule.calendar === 'gregorian' && ['gregorian-easter', 'advent-start'].includes(family.exclusiveEndDateRule.anchor) && Number.isInteger(family.exclusiveEndDateRule.offsetDays), `${family.id} has an invalid exclusive end boundary.`);
    const snapshot = snapshotFamilies.get(family.id);
    assert(snapshot && Array.isArray(snapshot.presentLegacyIds) && Array.isArray(snapshot.presentMappings), `${family.id} has no approved-release exact presence snapshot.`);
    const presentIds = new Set(snapshot.presentLegacyIds);
    assert(presentIds.size === snapshot.presentLegacyIds.length, `${family.id} contains duplicate present legacy IDs.`);
    const mappings = new Map(snapshot.presentMappings.map((item) => [`${item.week}\u0000${item.weekday}`, item]));
    assert(mappings.size === snapshot.presentMappings.length && mappings.size === presentIds.size, `${family.id} exact mappings differ from its present identities.`);

    assert(typeof family.legacyObservanceIdPattern === 'string' && family.legacyObservanceIdPattern.startsWith('rc:'), `${family.id} lacks a legacy identity mapping.`);

    for (let week = family.weekRange.min; week <= family.weekRange.max; week += 1) {
      for (const [weekday, weekdayOffset] of Object.entries(family.weekdayOffsets)) {
        const candidateKey = `${family.id}\u0000${week}\u0000${weekday}`;
        const offsetDays = family.baseOffsetDays + ((week - 1) * family.weekStrideDays) + weekdayOffset;
        const resolved = family.anchor === 'effective-portugal-epiphany'
          ? { status: 'resolved', dateISO: new Date(Date.UTC(shadow.year, 0, 4 + offsetDays)).toISOString().slice(0, 10) }
          : calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: family.anchor, offsetDays }, shadow.year);
        assert(resolved.status === 'resolved', `${candidateKey} failed to resolve.`);
        const exclusiveStart = family.exclusiveStartDateRule ? calendar.resolveDateRule(family.exclusiveStartDateRule, shadow.year) : null;
        if (exclusiveStart) {
          assert(exclusiveStart.status === 'resolved', `${family.id} exclusive start boundary failed to resolve.`);
          if (resolved.dateISO <= exclusiveStart.dateISO) continue;
        }
        const exclusiveEnd = family.exclusiveEndDateRule ? calendar.resolveDateRule(family.exclusiveEndDateRule, shadow.year) : null;
        if (exclusiveEnd) {
          assert(exclusiveEnd.status === 'resolved', `${family.id} exclusive end boundary failed to resolve.`);
          if (resolved.dateISO >= exclusiveEnd.dateISO) continue;
        }
        candidateCount += 1;
        assert(!seenCandidateKeys.has(candidateKey), `Duplicate temporal family candidate ${candidateKey}.`);
        seenCandidateKeys.add(candidateKey);
        const weekdayToken = weekday.charAt(0).toUpperCase() + weekday.slice(1);
        const legacyId = family.legacyObservanceIdsBySlot?.[String(week)] ?? family.legacyObservanceIdPattern
          .replace('{week}', String(week))
          .replace('{weekday}', weekday)
          .replace('{weekdayShort}', `${weekday.charAt(0).toUpperCase()}${weekday.slice(1, 3)}`)
          .replace('{weekdayTitle}', weekdayToken);
        const suppression = suppressions.get(candidateKey);
        const withheld = withheldCandidates.get(candidateKey);
        const isPresent = presentIds.has(legacyId);
        assert(Number(isPresent) + Number(Boolean(suppression)) + Number(Boolean(withheld)) === 1, `${candidateKey} must be present, suppressed or withheld, never overlapping or absent.`);

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
          if (family.memberProfile === 'saturday') {
            assert(mapping.legacyRank === family.legacyRank && mapping.reviewStatus === 'official-optional-alternative' && mapping.resolution === 'preserve-optional-saturday-marian-choice' && mapping.selectionMode === 'optional-alternative' && mapping.obligatory === false, `${candidateKey} incorrectly makes the Saturday Marian option obligatory.`);
          } else {
            assert(mapping.legacyRank === family.legacyRank && mapping.reviewStatus === 'inherited-safe' && mapping.resolution === 'inherit-general-canonical-binding', `${candidateKey} lacks its approved precedence result.`);
          }
          seenSourceOccurrenceIds.add(mapping.sourceOccurrenceId);
          seenSourceRecordHashes.add(mapping.sourceRecordHash);
          seenCanonicalOccurrenceIds.add(mapping.occurrenceId);
        } else if (suppression) {
          suppressedCount += 1;
          assert(suppression.candidateDateISO === resolved.dateISO, `${candidateKey} suppression date ${suppression.candidateDateISO} differs from generated ${resolved.dateISO}.`);
          assert(typeof suppression.suppressingLegacyObservanceId === 'string' && suppression.suppressingLegacyObservanceId !== legacyId, `${candidateKey} lacks a distinct suppressing observance.`);
          assert(['weekday', 'optional-memorial', 'memorial', 'feast', 'solemnity'].includes(suppression.suppressingRank), `${candidateKey} has unsupported suppressing rank.`);
        } else {
          withheldCount += 1;
          assert(withheld.candidateDateISO === resolved.dateISO && withheld.legacyObservanceId === legacyId, `${candidateKey} withheld identity/date differs from its canonical candidate.`);
          assert(withheld.sourceOccurrenceId?.startsWith(`snl-pt-${resolved.dateISO}-`) && /^[a-f0-9]{64}$/u.test(withheld.sourceRecordHash ?? ''), `${candidateKey} withheld review row lacks exact SNL evidence.`);
          assert(withheld.reason === 'jurisdiction-structural-overlay-review-required' && withheld.countsAsCoverage === false, `${candidateKey} withheld review row weakened fail-closed policy.`);
        }
      }
    }
  }

  assert(candidateCount === 358, `Expected 358 temporal family candidates, got ${candidateCount}.`);
  assert(presentCount === 173 && seenPresentLegacyIds.size === 173, `Expected 173 approved family occurrences, got ${presentCount}.`);
  assert(seenSourceOccurrenceIds.size === 173 && seenSourceRecordHashes.size === 173 && seenCanonicalOccurrenceIds.size === 173, 'Every approved TemporalRuleFamily occurrence requires unique source and canonical identities.');
  assert(suppressedCount === 180 && suppressions.size === 180, `Expected 180 precedence or season-boundary suppressions, got ${suppressedCount}.`);
  assert(withheldCount === 5 && withheldCandidates.size === 5, `Expected five fail-closed jurisdiction review candidates, got ${withheldCount}.`);
  assert(presentCount + suppressedCount + withheldCount === candidateCount, 'Every temporal family candidate must have an explicit annual outcome.');
  assert(seenPresentLegacyIds.has('rc:LentWeekday1Monday'), 'Lent family lost its first weekday anchor.');
  assert(seenPresentLegacyIds.has('rc:EasterWeekday7Saturday'), 'Easter family lost its final weekday anchor.');
  assert(seenPresentLegacyIds.has('rc:MonHolyWeek') && seenPresentLegacyIds.has('rc:WedHolyWeek'), 'Holy Week weekday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:MonOctaveEaster') && seenPresentLegacyIds.has('rc:SatOctaveEaster'), 'Easter Octave weekday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:Lent2') && seenPresentLegacyIds.has('rc:Lent5'), 'Lent Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:Easter2') && seenPresentLegacyIds.has('rc:Easter6'), 'Easter Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:Advent2') && seenPresentLegacyIds.has('rc:Advent4'), 'Advent Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:AdventWeekday1Tuesday') && seenPresentLegacyIds.has('rc:AdventWeekday3Wednesday'), 'Reviewed Advent weekday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:OrdSunday2') && seenPresentLegacyIds.has('rc:OrdSunday6'), 'Early Ordinary Time Sunday family boundaries drifted.');
  assert(seenPresentLegacyIds.has('rc:OrdSunday10') && seenPresentLegacyIds.has('rc:OrdSunday33'), 'Late Ordinary Time Sunday family boundaries drifted.');
  assert(!seenPresentLegacyIds.has('rc:OrdSunday7') && !seenPresentLegacyIds.has('rc:OrdSunday9'), 'Lent season-boundary suppressions were lost.');
  assert(!seenPresentLegacyIds.has('rc:OrdSunday31') && !seenPresentLegacyIds.has('rc:OrdSunday34'), 'All Saints or Christ the King suppression was lost.');
  assert(seenPresentLegacyIds.has('rc:SatMemBVM2') && seenPresentLegacyIds.has('rc:SatMemBVM18'), 'Saturday Marian optional alternatives lost their reviewed Portugal boundaries.');
  assert(!seenPresentLegacyIds.has('rc:SatMemBVM1') && suppressions.get('temporal-rule-family:saturday-marian-early:roman-catholic\u00004\u0000saturday')?.suppressingLegacyObservanceId === 'rc-pt:FiveWoundsLord', 'Portugal Five Wounds precedence over the optional Saturday Marian candidate was lost.');
  assert(!seenPresentLegacyIds.has('rc:SatMemBVM6') && !seenPresentLegacyIds.has('rc:SatMemBVM7') && !seenPresentLegacyIds.has('rc:SatMemBVM9'), 'Portugal or universal memorial precedence over optional Saturday Marian candidates was lost.');
  assert(seenPresentLegacyIds.has('rc:OrdWeekday1Monday') && seenPresentLegacyIds.has('rc:OrdWeekday3Friday'), 'Early Ordinary Time weekday source bindings are incomplete.');
  assert(!seenPresentLegacyIds.has('rc:OrdWeekday2Tuesday') && suppressions.get('temporal-rule-family:ordinary-time-weekday-early:roman-catholic\u00002\u0000tuesday')?.alternativeSuppressingLegacyObservanceIds?.includes('rc:StSebastian'), 'Multiple approved January 20 alternatives were not preserved.');
  assert(seenPresentLegacyIds.has('rc:OrdWeekday5Monday') && seenPresentLegacyIds.has('rc:OrdWeekday6Monday'), 'Pre-Lent Ordinary Time weekday source bindings are incomplete.');
  assert(withheldCandidates.get('temporal-rule-family:ordinary-time-weekday-early:roman-catholic\u00004\u0000wednesday')?.sourceOccurrenceId === 'snl-pt-2026-02-04-e285ab8cd2b91ecf40f5428a', 'Portugal February 4 jurisdiction review boundary was lost.');
  assert(!seenCandidateKeys.has('temporal-rule-family:ordinary-time-weekday-early:roman-catholic\u00006\u0000wednesday'), 'Ordinary Time weekday family crossed the Ash Wednesday boundary.');
  assert(!seenCandidateKeys.has('temporal-rule-family:ordinary-time-weekday-late:roman-catholic\u00007\u0000monday'), 'Late Ordinary Time weekday family crossed or included the Pentecost boundary.');
  assert(seenPresentLegacyIds.has('rc:OrdWeekday8Thursday') && seenPresentLegacyIds.has('rc:OrdWeekday12Friday') && seenPresentLegacyIds.has('rc:OrdWeekday18Monday') && seenPresentLegacyIds.has('rc:OrdWeekday24Friday') && seenPresentLegacyIds.has('rc:OrdWeekday30Friday') && seenPresentLegacyIds.has('rc:OrdWeekday34Friday'), 'Reviewed late Ordinary Time weekday source bindings are incomplete.');
  assert(withheldCandidates.get('temporal-rule-family:ordinary-time-weekday-late:roman-catholic\u000015\u0000friday')?.sourceOccurrenceId === 'snl-pt-2026-07-17-dee64b0d5534c51db7fe4a34', 'Portugal July 17 jurisdiction review boundary was lost.');
  assert(withheldCandidates.get('temporal-rule-family:ordinary-time-weekday-late:roman-catholic\u000020\u0000monday')?.sourceOccurrenceId === 'snl-pt-2026-08-17-0241bff7957f1b47c3c0b147', 'Portugal August 17 jurisdiction review boundary was lost.');
  assert(withheldCandidates.get('temporal-rule-family:ordinary-time-weekday-late:roman-catholic\u000030\u0000tuesday')?.sourceOccurrenceId === 'snl-pt-2026-10-27-1d075d348cea0a826785314b', 'Portugal October 27 jurisdiction review boundary was lost.');
  assert(withheldCandidates.get('temporal-rule-family:ordinary-time-weekday-late:roman-catholic\u000031\u0000friday')?.sourceOccurrenceId === 'snl-pt-2026-11-06-0b6ca82418e6dc1911faebc5', 'Portugal November 6 jurisdiction review boundary was lost.');
  assert(suppressions.get('temporal-rule-family:ordinary-time-weekday-late:roman-catholic\u000018\u0000friday')?.alternativeSuppressingLegacyObservanceIds?.includes('rc:StSixtusIIPope'), 'Multiple approved August 7 alternatives were not preserved.');
  assert(!seenPresentLegacyIds.has('rc:LentWeekday4Thursday'), 'St Joseph precedence suppression was lost.');
  assert(!seenPresentLegacyIds.has('rc:EasterWeekday6Wednesday'), 'Fatima precedence suppression was lost.');
  assert(!seenPresentLegacyIds.has('rc:AdventWeekday2Tuesday') && !seenPresentLegacyIds.has('rc:AdventWeekday2Wednesday'), 'Advent precedence suppressions were lost.');
  assert(seenPresentLegacyIds.has('rc:ChristmasWeekdayJan5') && seenPresentLegacyIds.has('rc:DayAfterEpiphanyJan8') && seenPresentLegacyIds.has('rc:DayAfterEpiphanyJan9'), 'Portugal Epiphany interval source bindings are incomplete.');
  assert(!seenPresentLegacyIds.has('rc-pt:TuesdayAfterEpiphany') && !seenPresentLegacyIds.has('rc:StRayPenyafort') && !seenPresentLegacyIds.has('rc:DayAfterEpiphanyJan10'), 'Portugal Epiphany interval suppressions were lost.');

  const lateOrdinaryWeekdayFamily = familyDataset.families.find((family) => family.id === 'temporal-rule-family:ordinary-time-weekday-late:roman-catholic');
  let sawPentecostBoundarySkip = false;
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
    const advent = calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: 'advent-start', offsetDays: 0 }, year);
    const pentecost = calendar.resolveDateRule(lateOrdinaryWeekdayFamily.exclusiveStartDateRule, year);
    for (let week = lateOrdinaryWeekdayFamily.weekRange.min; week <= lateOrdinaryWeekdayFamily.weekRange.max; week += 1) {
      for (const weekdayOffset of Object.values(lateOrdinaryWeekdayFamily.weekdayOffsets)) {
        const offsetDays = lateOrdinaryWeekdayFamily.baseOffsetDays + ((week - 1) * lateOrdinaryWeekdayFamily.weekStrideDays) + weekdayOffset;
        const candidate = calendar.resolveDateRule({ type: 'relative', calendar: 'gregorian', anchor: lateOrdinaryWeekdayFamily.anchor, offsetDays }, year);
        assert(candidate.status === 'resolved' && candidate.dateISO < advent.dateISO, `Late Ordinary Time weekday candidate crossed Advent in ${year}.`);
        if (candidate.dateISO <= pentecost.dateISO) sawPentecostBoundarySkip = true;
      }
    }
  }
  assert(sawPentecostBoundarySkip, 'Multi-year vectors never exercised the late Ordinary Time weekday Pentecost boundary.');

  console.log(`TemporalRuleFamily test passed: ${candidateCount} candidates = ${presentCount} exact source-bound occurrences + ${suppressedCount} precedence suppressions + ${withheldCount} fail-closed review rows; Saturday Marian rows remain optional and no suppressed or withheld candidate counts as coverage.`);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
