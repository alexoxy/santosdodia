#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-roman-portugal-rolling-'));
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function transpile(sourcePath, outputName, rewrites = []) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    reportDiagnostics: true
  });
  assert(!(compiled.diagnostics ?? []).some(item => item.category === ts.DiagnosticCategory.Error), `${path.basename(sourcePath)} transpilation returned errors.`);
  let output = compiled.outputText;
  for (const [from, to] of rewrites) output = output.replaceAll(from, to);
  fs.writeFileSync(path.join(temporaryDirectory, outputName), output, 'utf8');
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fixedSanctoraleDate(rule, year) {
  assert(rule?.dateRule?.type === 'fixed', `${rule?.id ?? 'Unknown Sanctorale rule'} must use a fixed date.`);
  const date = new Date(Date.UTC(year, rule.dateRule.month - 1, rule.dateRule.day));
  assert(date.getUTCFullYear() === year && date.getUTCMonth() + 1 === rule.dateRule.month && date.getUTCDate() === rule.dateRule.day, `${rule.id} has an invalid fixed date.`);
  return date.toISOString().slice(0, 10);
}

try {
  fs.writeFileSync(path.join(temporaryDirectory, 'package.json'), '{"type":"module"}\n', 'utf8');
  transpile(path.join(root, 'lib/knowledge/calendar-engine.ts'), 'calendar-engine.js');
  transpile(path.join(root, 'lib/knowledge/rolling-materialization.ts'), 'rolling-materialization.js');
  transpile(path.join(root, 'lib/knowledge/roman-liturgical-year.ts'), 'roman-liturgical-year.js', [["'./calendar-engine'", "'./calendar-engine.js'"]]);
  transpile(path.join(root, 'lib/knowledge/roman-precedence.ts'), 'roman-precedence.js');
  transpile(
    path.join(root, 'lib/knowledge/roman-annual-calendar.ts'),
    'roman-annual-calendar.js',
    [
      ["'./roman-liturgical-year'", "'./roman-liturgical-year.js'"],
      ["'./roman-precedence'", "'./roman-precedence.js'"]
    ]
  );

  const calendar = await import(`${pathToFileURL(path.join(temporaryDirectory, 'calendar-engine.js')).href}?v=${Date.now()}`);
  const rolling = await import(`${pathToFileURL(path.join(temporaryDirectory, 'rolling-materialization.js')).href}?v=${Date.now()}`);
  const roman = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-liturgical-year.js')).href}?v=${Date.now()}`);
  const annual = await import(`${pathToFileURL(path.join(temporaryDirectory, 'roman-annual-calendar.js')).href}?v=${Date.now()}`);

  const acceptance = readJson('data/roman-catholic-portugal-movable-rolling-acceptance.json');
  const temporalManifest = readJson('data/canonical-temporal-rule-anchors.json');
  const sanctoraleManifest = readJson('data/canonical-roman-sanctorale-rule-anchors.json');
  const annualShadow = readJson('data/migrations/roman-catholic-pt-2026-v2.movable-transfer-shadow.json');
  const temporalRules = new Map(temporalManifest.rules.map(rule => [rule.id, rule]));
  const sanctoraleRules = new Map(sanctoraleManifest.rules.map(rule => [rule.id, rule]));
  const annualMappings = new Map(annualShadow.mappings.map(mapping => [mapping.temporalRuleId, mapping]));

  function validate(document) {
    assert(document.schemaVersion === 1 && document.modelVersion === '1.0' && document.status === 'rolling-calculation-acceptance-shadow', 'Rolling acceptance header is invalid.');
    assert(document.target?.churchId === roman.ROMAN_PORTUGAL_POLICY.churchId, 'Rolling acceptance Church differs from the Portugal kernel.');
    assert(document.target?.jurisdictionId === roman.ROMAN_PORTUGAL_POLICY.jurisdictionId, 'Rolling acceptance jurisdiction differs from the Portugal kernel.');
    assert(document.target?.calendarSystem === roman.ROMAN_PORTUGAL_POLICY.calendarSystem && document.target?.policyId === roman.ROMAN_PORTUGAL_POLICY.id, 'Rolling acceptance calendar or policy differs from the Portugal kernel.');
    assert(/^https:\/\/(?:www\.)?vatican\.va\//u.test(document.authorityEvidence?.universalCalendar ?? ''), 'Rolling acceptance lacks Holy See universal authority.');
    assert(/^https:\/\/(?:www\.)?liturgia\.pt\//u.test(document.authorityEvidence?.portugalTransferRules ?? ''), 'Rolling acceptance lacks competent Portugal authority.');

    const sourceEvidence = document.annualEquivalenceEvidence ?? {};
    assert(sourceEvidence.sourceBoundYear === annualShadow.target.year && sourceEvidence.sourceReleaseId === annualShadow.sourceReleaseId, 'Rolling acceptance must bind annual equivalence only to the approved 2026 release.');
    assert(sourceEvidence.sourceArtifact?.workflowRunId === annualShadow.sourceArtifact.workflowRunId && sourceEvidence.sourceArtifact?.artifactId === annualShadow.sourceArtifact.artifactId, 'Rolling acceptance annual artifact differs from the approved movable shadow.');
    assert(sourceEvidence.sourceArtifact?.buildJsonSha256 === annualShadow.sourceArtifact.buildJsonSha256, 'Rolling acceptance build hash differs from the approved movable shadow.');
    assert(sourceEvidence.movableTransferShadow === 'data/migrations/roman-catholic-pt-2026-v2.movable-transfer-shadow.json', 'Rolling acceptance must name the immutable annual shadow evidence.');

    const safety = document.safety ?? {};
    for (const key of [
      'calculationDoesNotCreateAnnualOccurrence',
      'annualEquivalenceRequiresExactAnnualEvidence',
      'projectionOnlyYearsMustNotCountAsCanonicalCoverage',
      'unprovedAnnualDispositionFailsClosed'
    ]) assert(safety[key] === true, `Rolling acceptance safety ${key} must remain true.`);
    assert(safety.publicationAllowed === false && safety.d1MutationAllowed === false, 'Rolling acceptance must remain shadow-only and read-only.');

    const expectedWindow = rolling.rollingCivilYearWindow(document.anchorCivilYear, document.window?.pastCivilYears, document.window?.futureCivilYears);
    assert(JSON.stringify(document.window?.years) === JSON.stringify(expectedWindow), 'Rolling acceptance years must equal the Y-1 through Y+3 engine window.');
    assert(Array.isArray(document.rules) && document.rules.length === 11, 'Rolling acceptance must contain exactly eleven movable/transfer rule contracts.');
    const ruleContracts = new Map(document.rules.map(rule => [rule.temporalRuleId, rule]));
    assert(ruleContracts.size === 11 && [...ruleContracts.keys()].every(id => annualMappings.has(id)), 'Rolling acceptance rule set must exactly match the eleven approved 2026 movable mappings.');
    assert([...annualMappings.keys()].every(id => ruleContracts.has(id)), 'An approved 2026 movable mapping is missing from rolling acceptance.');

    for (const contract of document.rules) {
      assert(temporalRules.has(contract.temporalRuleId), `${contract.temporalRuleId} is not a reviewed canonical TemporalRule.`);
      if (contract.temporalRuleId === 'temporal-rule:immaculate-heart:roman-catholic') {
        assert(contract.principalDay === null && contract.projectionKind === 'annual-precedence-required', 'Immaculate Heart must not bypass annual precedence through a principal-day projection.');
        assert(contract.precedenceClass === 'general-marian-or-saint-feast' && contract.isSolemnity === false, 'Immaculate Heart precedence contract is invalid.');
      } else {
        assert(typeof contract.principalDay === 'string', `${contract.temporalRuleId} lacks a Portugal policy principal day.`);
        assert(['universal-rule', 'portugal-jurisdiction-policy'].includes(contract.projectionKind), `${contract.temporalRuleId} has an invalid projection kind.`);
      }
    }

    assert(Array.isArray(document.years) && document.years.length === expectedWindow.length, 'Rolling acceptance must contain one record per civil year.');
    assert(JSON.stringify(document.years.map(item => item.year)) === JSON.stringify(expectedWindow), 'Rolling acceptance year records are incomplete or out of order.');
    let calculationCount = 0;
    let annualExactCount = 0;

    for (const yearRecord of document.years) {
      const sourceBound = yearRecord.year === sourceEvidence.sourceBoundYear;
      assert(yearRecord.annualEquivalenceStatus === (sourceBound ? 'source-bound-exact' : 'unproved-projection-only'), `Year ${yearRecord.year} has an invalid annual-equivalence status.`);
      if (!sourceBound) {
        const serialized = JSON.stringify(yearRecord);
        for (const forbidden of ['sourceOccurrenceId', 'sourceRecordHash', 'occurrenceId']) {
          assert(!serialized.includes(forbidden), `Projection-only year ${yearRecord.year} must not create ${forbidden}.`);
        }
      }

      const baseKeys = Object.keys(yearRecord.calculatedBaseDates ?? {});
      const policyKeys = Object.keys(yearRecord.portugalPolicyDates ?? {});
      assert(baseKeys.length === 11 && baseKeys.every(id => ruleContracts.has(id)), `Year ${yearRecord.year} must contain all eleven calculated base dates.`);
      assert(policyKeys.length === 10 && policyKeys.every(id => ruleContracts.get(id)?.principalDay), `Year ${yearRecord.year} must contain exactly ten Portugal policy dates.`);
      const liturgicalYear = roman.calculateRomanLiturgicalYear(yearRecord.year, roman.ROMAN_PORTUGAL_POLICY);

      for (const contract of document.rules) {
        const canonicalRule = temporalRules.get(contract.temporalRuleId);
        const resolved = calendar.resolveDateRule(canonicalRule.dateRule, yearRecord.year);
        assert(resolved.status === 'resolved' && resolved.dateISO === yearRecord.calculatedBaseDates[contract.temporalRuleId], `${contract.temporalRuleId} base calculation differs in ${yearRecord.year}.`);
        calculationCount += 1;

        if (contract.principalDay) {
          const policyDate = yearRecord.portugalPolicyDates[contract.temporalRuleId];
          assert(policyDate === liturgicalYear.keyDates[contract.principalDay], `${contract.temporalRuleId} Portugal policy projection differs in ${yearRecord.year}.`);
          if (sourceBound) {
            const mapping = annualMappings.get(contract.temporalRuleId);
            assert(mapping.baseDateISO === resolved.dateISO && mapping.expectedDateISO === policyDate, `${contract.temporalRuleId} does not reproduce exact approved 2026 annual evidence.`);
            annualExactCount += 1;
          }
        } else {
          assert(!Object.hasOwn(yearRecord.portugalPolicyDates, contract.temporalRuleId), 'Immaculate Heart must not be represented as a jurisdiction-policy final date.');
          assert(yearRecord.immaculateHeart?.candidateDateISO === resolved.dateISO, `Immaculate Heart candidate differs in ${yearRecord.year}.`);
          if (sourceBound) {
            const mapping = annualMappings.get(contract.temporalRuleId);
            assert(yearRecord.immaculateHeart.annualDispositionStatus === 'source-bound-approved-transfer', 'The 2026 Immaculate Heart must preserve its approved annual transfer.');
            assert(yearRecord.immaculateHeart.finalOccurrenceDateISO === mapping.expectedDateISO && yearRecord.immaculateHeart.decisionId === mapping.transfer?.decisionId, 'The 2026 Immaculate Heart transfer differs from exact annual evidence.');
            annualExactCount += 1;
          } else {
            assert(yearRecord.immaculateHeart?.finalOccurrenceDateISO === null, `Projection-only year ${yearRecord.year} must not invent an Immaculate Heart occurrence date.`);
          }
        }
      }
    }

    assert(calculationCount === 55, `Rolling acceptance must exercise 55 calculations, got ${calculationCount}.`);
    assert(annualExactCount === 11, `Only the eleven 2026 rows may claim exact annual equivalence, got ${annualExactCount}.`);

    const collisionYear = document.years.find(item => item.year === 2028);
    const immaculate = collisionYear?.immaculateHeart;
    const collision = immaculate?.knownCollision;
    assert(immaculate?.annualDispositionStatus === 'candidate-impeded-annual-disposition-unproved' && immaculate.finalOccurrenceDateISO === null, 'The 2028 collision must remain fail-closed without a final annual occurrence.');
    const johnRule = sanctoraleRules.get(collision?.sanctoraleRuleId);
    assert(johnRule?.observanceId === collision.observanceId && johnRule.precedenceClass === collision.precedenceClass && johnRule.isSolemnity === true, 'The 2028 known collision must reference the reviewed John the Baptist solemnity rule.');
    const johnDateISO = fixedSanctoraleDate(johnRule, 2028);
    assert(johnDateISO === immaculate.candidateDateISO, 'The 2028 known collision does not resolve to the same base date.');
    const reducedCollision = annual.generateRomanAnnualCalendar(2028, roman.ROMAN_PORTUGAL_POLICY, [
      {
        id: 'candidate:2028:immaculate-heart',
        dateISO: immaculate.candidateDateISO,
        origin: 'sanctorale',
        precedenceClass: ruleContracts.get('temporal-rule:immaculate-heart:roman-catholic').precedenceClass,
        isSolemnity: false
      },
      {
        id: 'candidate:2028:john-baptist-nativity',
        dateISO: johnDateISO,
        origin: 'sanctorale',
        observanceId: johnRule.observanceId,
        precedenceClass: johnRule.precedenceClass,
        isSolemnity: johnRule.isSolemnity
      }
    ]);
    const collisionDay = reducedCollision.days.find(day => day.dateISO === immaculate.candidateDateISO);
    assert(reducedCollision.publicationAllowed === false, 'Reduced collision proof must remain shadow-only.');
    assert(collisionDay?.celebratedCandidateId === 'candidate:2028:john-baptist-nativity', 'The known general solemnity must outrank the Immaculate Heart feast at its 2028 base date.');
    assert(collisionDay?.omittedCandidateIds.includes('candidate:2028:immaculate-heart'), 'The reduced 2028 model must prove the Immaculate Heart candidate is impeded at its base date.');
    assert(!collisionDay?.transferRequiredCandidateIds.includes('candidate:2028:immaculate-heart'), 'The engine must not infer a solemnity transfer for the Immaculate Heart feast.');
    assert(collision.minimumProvedOutcome === 'immaculate-heart-candidate-omitted-at-base-date', 'The stored 2028 minimum outcome differs from the precedence engine.');
  }

  validate(acceptance);

  const fabricatedAnnualEquivalence = deepClone(acceptance);
  fabricatedAnnualEquivalence.years.find(item => item.year === 2027).annualEquivalenceStatus = 'source-bound-exact';
  let fabricatedAnnualRejected = false;
  try { validate(fabricatedAnnualEquivalence); } catch { fabricatedAnnualRejected = true; }
  assert(fabricatedAnnualRejected, 'A projection-only year claiming annual equivalence must fail closed.');

  const inventedCollisionDestination = deepClone(acceptance);
  inventedCollisionDestination.years.find(item => item.year === 2028).immaculateHeart.finalOccurrenceDateISO = '2028-06-26';
  let inventedDestinationRejected = false;
  try { validate(inventedCollisionDestination); } catch { inventedDestinationRejected = true; }
  assert(inventedDestinationRejected, 'An invented 2028 collision destination must fail closed.');

  const incompleteWindow = deepClone(acceptance);
  delete incompleteWindow.years.find(item => item.year === 2029).portugalPolicyDates['temporal-rule:ascension:roman-catholic'];
  let incompleteWindowRejected = false;
  try { validate(incompleteWindow); } catch { incompleteWindowRejected = true; }
  assert(incompleteWindowRejected, 'An incomplete rolling calculation window must fail closed.');

  const wrongArtifact = deepClone(acceptance);
  wrongArtifact.annualEquivalenceEvidence.sourceArtifact.artifactId += 1;
  let wrongArtifactRejected = false;
  try { validate(wrongArtifact); } catch { wrongArtifactRejected = true; }
  assert(wrongArtifactRejected, 'Annual equivalence bound to a different artifact must fail closed.');

  console.log('Roman Portugal rolling movable acceptance passed: 55 calculations across 2025-2029, 11 exact 2026 annual bindings, 44 projection-only results and the 2028 precedence collision fail closed.');
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
