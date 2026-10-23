#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildCanonicalObservanceVaultRelease } from './build-canonical-observance-manifest.mjs';

const root = process.cwd();
const [observanceBytes, personBytes, recognitionBytes, ecclesialBytes] = await Promise.all([
  readFile(path.join(root, 'data', 'canonical-observance-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-person-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-recognition-anchors.json'), 'utf8'),
  readFile(path.join(root, 'data', 'canonical-ecclesial-context-anchors.json'), 'utf8')
]);
const observanceDataset = JSON.parse(observanceBytes);
const personDataset = JSON.parse(personBytes);
const recognitionDataset = JSON.parse(recognitionBytes);
const ecclesialDataset = JSON.parse(ecclesialBytes);

function assert(condition, message) { if (!condition) throw new Error(message); }
function build(dataset = observanceDataset, options = {}) {
  return buildCanonicalObservanceVaultRelease(dataset, personDataset, recognitionDataset, ecclesialDataset, options);
}
function expectFailure(label, fn, expectedText) {
  let failed = false;
  try { fn(); } catch (error) {
    failed = true;
    assert(String(error?.message ?? error).includes(expectedText), `${label} failed for the wrong reason: ${String(error?.message ?? error)}`);
  }
  assert(failed, `${label} unexpectedly passed.`);
}

const first = build(observanceDataset, { sourceBytes: observanceBytes, sourceCommit: 'commit-a', generatedAt: '2026-08-22T00:00:00.000Z' });
const second = build(observanceDataset, { sourceBytes: observanceBytes, sourceCommit: 'commit-b', generatedAt: '2026-08-23T00:00:00.000Z' });
const reformattedBytes = `${JSON.stringify(observanceDataset)}\n`;
const reformatted = build(observanceDataset, { sourceBytes: reformattedBytes, sourceCommit: 'commit-c', generatedAt: '2026-08-24T00:00:00.000Z' });

assert(first.manifest.rootSha256 === second.manifest.rootSha256, 'Observance root must be deterministic across runs.');
assert(first.manifest.rootSha256 === reformatted.manifest.rootSha256, 'Formatting-only source changes must not alter Observance root.');
assert(JSON.stringify(first.manifest) === JSON.stringify(second.manifest), 'Observance manifest must be deterministic for equal canonical semantics.');
assert(JSON.stringify(first.manifest) === JSON.stringify(reformatted.manifest), 'Formatting-only changes must not alter immutable Observance manifest bytes.');
assert(first.buildReceipt.sourceCommit !== second.buildReceipt.sourceCommit, 'Run-specific commit belongs in the Observance build receipt.');
assert(first.buildReceipt.generatedAt !== second.buildReceipt.generatedAt, 'Run-specific generatedAt belongs in the Observance build receipt.');
assert(first.buildReceipt.sourceDatasetSha256 !== reformatted.buildReceipt.sourceDatasetSha256, 'Observance build receipt must preserve source-byte provenance changes.');
assert(first.buildReceipt.publicationChanged === false && first.buildReceipt.d1Changed === false, 'Building Observance must not publish or mutate D1.');

assert(first.manifest.artifactType === 'canonical-liturgical-observances', 'Observance artifact type changed unexpectedly.');
assert(first.manifest.observanceModelVersion === '1.3', 'Observance model must support reviewed subjectless collective and non-human identities v1.3.');
assert(first.manifest.vaultLayer === 'canonical', 'Observance release must target canonical Vault.');
assert(first.manifest.observanceCount === 97, 'Reviewed Observance count changed and requires explicit review.');
assert(first.manifest.personCoverageCount === 149, 'Reviewed Observance Person coverage changed unexpectedly.');
assert(JSON.stringify(first.manifest.churches) === JSON.stringify(['church:orthodox-church-america', 'church:roman-catholic']), 'Observance Churches changed unexpectedly.');
assert(first.manifest.runtimePublicationAllowed === false, 'Observance Vault build must not imply runtime publication.');
assert(first.manifest.currentPointerPath === '/vault/canonical/observances/v1/current.json', 'Observance current pointer path changed unexpectedly.');
assert(first.manifest.immutableReleaseRoot.endsWith(first.manifest.rootSha256), 'Observance release root must be content-addressed.');
assert(first.manifest.deletionPolicy === 'tombstone-only', 'Observance deletion must remain tombstone-only.');
assert(first.manifest.semantics.observanceSeparateFromPerson === true, 'Observance must remain separate from Person.');
assert(first.manifest.semantics.observanceSeparateFromRecognition === true, 'Observance must remain separate from Recognition.');
assert(first.manifest.semantics.observanceSeparateFromOccurrence === true, 'Observance must remain separate from Occurrence.');
assert(first.manifest.semantics.stableObservanceKeyRequired === true, 'Stable Observance key must be mandatory.');
assert(first.manifest.semantics.observanceTypeIsNotIdentity === true, 'Observance type must remain descriptive rather than identity-bearing.');
assert(first.manifest.semantics.multipleObservancesPerSubjectSetSupported === true, 'One subject set must support multiple distinct Observances.');
assert(first.manifest.semantics.recognitionMustMatchObservanceChurch === true, 'Observance must remain Church-scoped through Recognition.');
assert(first.manifest.semantics.evidenceMustMatchChurchAuthorityDomain === true, 'Observance evidence must remain Church-authority isolated.');
assert(first.manifest.semantics.multiSubjectReady === true, 'Observance must remain multi-subject ready.');
assert(first.manifest.semantics.subjectlessCollectiveObservanceSupported === true, 'Observance must support explicitly attested unenumerated collectives.');
assert(first.manifest.semantics.subjectlessCollectiveMustNotCreatePersons === true, 'Subjectless collective Observances must not fabricate Person records.');
assert(first.manifest.semantics.subjectlessNonHumanObservanceSupported === true, 'Observance must support explicitly attested non-human commemorations without Person coercion.');
assert(first.manifest.semantics.subjectlessNonHumanMustNotCreatePersons === true, 'Subjectless non-human Observances must not fabricate Person records.');
assert(first.manifest.semantics.subjectlessIdentityKeyRequired === true, 'Every subjectless Observance must have a stable disambiguating key.');
assert(first.manifest.d1Projection.status === 'deferred', 'Observance identity must not be silently forced into dated occurrence tables.');

const ids = first.observances.map((item) => item.observanceId);
assert(new Set(ids).size === ids.length, 'Observance release contains duplicate IDs.');
assert(JSON.stringify(ids) === JSON.stringify([...ids].sort()), 'Observance release must be deterministically sorted.');
assert(first.observances.every((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(item.observanceKey)), 'Every canonical Observance must expose a stable observanceKey.');
assert(first.observances.filter((item) => item.subjects.some((subject) => subject.personId === 'matthew-apostle')).length === 2, 'Matthew must demonstrate one Person with separate Church-scoped Observances.');
const marianObservances = first.observances.filter((item) => item.subjects.some((subject) => subject.personId === 'mary-of-nazareth'));
assert(marianObservances.length === 3, 'Mary of Nazareth must have three distinct Church-scoped Observances.');
assert(JSON.stringify(marianObservances.map((item) => item.observanceKey).sort()) === JSON.stringify(['assumption', 'divine-maternity', 'immaculate-conception']), 'Marian Observance keys must remain distinct and stable.');
assert(marianObservances.every((item) => item.observanceType === 'marian-solemnity' && item.subjects[0].recognitionId === 'recognition:mary-of-nazareth:roman-catholic'), 'Marian Observances must share one Person/Recognition without merging their identities.');

const john = first.observances.find((item) => item.observanceId === 'observance:john-baptist-nativity:roman-catholic');
assert(john?.observanceKey === 'nativity' && john.observanceType === 'feast' && john.subjects.length === 1 && john.subjects[0].personId === 'john-baptist', 'John Baptist Nativity must remain a keyed person-subject feast Observance.');
const joseph = first.observances.find((item) => item.observanceId === 'observance:saint-joseph:roman-catholic');
assert(joseph?.observanceKey === 'principal-commemoration' && joseph.observanceType === 'person-commemoration' && joseph.subjects.length === 1 && joseph.subjects[0].personId === 'saint-joseph', 'Saint Joseph must have one Church-scoped canonical Observance without carrying annual date or rank.');
const josephWorker = first.observances.find((item) => item.observanceId === 'observance:saint-joseph-worker:roman-catholic');
assert(josephWorker?.observanceKey === 'worker-commemoration' && josephWorker.observanceType === 'person-commemoration' && josephWorker.subjects.length === 1 && josephWorker.subjects[0].personId === 'saint-joseph' && josephWorker.subjects[0].recognitionId === joseph.subjects[0].recognitionId, 'Saint Joseph the Worker must be a second Observance reusing the existing Saint Joseph Person/Recognition pair.');
const benedict = first.observances.find((item) => item.observanceId === 'observance:benedict-nursia:roman-catholic');
assert(benedict?.observanceKey === 'principal-commemoration' && benedict.observanceType === 'person-commemoration' && benedict.subjects.length === 1 && benedict.subjects[0].personId === 'benedict-nursia', 'Saint Benedict must have one Church-scoped canonical Observance without carrying annual date or European rank.');
const bridget = first.observances.find((item) => item.observanceId === 'observance:bridget-sweden:roman-catholic');
assert(bridget?.observanceKey === 'principal-commemoration' && bridget.observanceType === 'person-commemoration' && bridget.subjects.length === 1 && bridget.subjects[0].personId === 'bridget-sweden', 'Saint Bridget must have one Church-scoped canonical Observance without carrying annual date or European rank.');
for (const [observanceId, personId] of [
  ['observance:mark-evangelist:roman-catholic', 'mark-evangelist'],
  ['observance:thomas-apostle:roman-catholic', 'thomas-apostle'],
  ['observance:mary-magdalene:roman-catholic', 'mary-magdalene'],
  ['observance:james-greater-apostle:roman-catholic', 'james-greater-apostle'],
  ['observance:matthias-apostle:roman-catholic', 'matthias-apostle'],
  ['observance:bartholomew-apostle:roman-catholic', 'bartholomew-apostle'],
  ['observance:andrew-apostle:roman-catholic', 'andrew-apostle'],
  ['observance:lawrence-rome:roman-catholic', 'lawrence-rome'],
  ['observance:stephen-protomartyr:roman-catholic', 'stephen-protomartyr'],
  ['observance:anthony-lisbon:roman-catholic', 'anthony-lisbon'],
  ['observance:anthony-great:roman-catholic', 'anthony-great'],
  ['observance:clare-assisi:roman-catholic', 'clare-assisi'],
  ['observance:teresa-avila:roman-catholic', 'teresa-avila'],
  ['observance:augustine-hippo:roman-catholic', 'augustine-hippo'],
  ['observance:jerome-stridon:roman-catholic', 'jerome-stridon'],
  ['observance:therese-lisieux:roman-catholic', 'therese-lisieux'],
  ['observance:dominic-guzman:roman-catholic', 'dominic-guzman'],
  ['observance:ignatius-loyola:roman-catholic', 'ignatius-loyola'],
  ['observance:francis-xavier:roman-catholic', 'francis-xavier'],
  ['observance:pancras:roman-catholic', 'pancras'],
  ['observance:augustine-canterbury:roman-catholic', 'augustine-canterbury']
]) {
  const item = first.observances.find((observance) => observance.observanceId === observanceId);
  assert(item?.observanceKey === 'principal-commemoration' && item.observanceType === 'person-commemoration' && item.subjects.length === 1 && item.subjects[0].personId === personId, `${observanceId} must remain separate from its annual date and feast rank.`);
}

for (const [id, people] of [
  ['observance:peter-paul:roman-catholic', ['paul-apostle', 'peter-apostle']],
  ['observance:joachim-anne:roman-catholic', ['anne', 'joachim']],
  ['observance:simon-jude-apostles:roman-catholic', ['jude-thaddeus-apostle', 'simon-zealot-apostle']],
  ['observance:cyril-methodius:roman-catholic', ['cyril-monk', 'methodius-bishop']],
  ['observance:timothy-titus:roman-catholic', ['timothy-ephesus', 'titus-crete']],
  ['observance:cornelius-cyprian:roman-catholic', ['cornelius-pope', 'cyprian-carthage']],
  ['observance:nereus-achilleus:roman-catholic', ['achilleus-ardeatina', 'nereus-ardeatina']],
  ['observance:marcellinus-peter:roman-catholic', ['marcellinus-priest-rome', 'peter-exorcist-rome']],
  ['observance:john-fisher-thomas-more:roman-catholic', ['john-fisher-rochester', 'thomas-more']],
  ['observance:pontian-hippolytus:roman-catholic', ['hippolytus-priest-rome', 'pontian-pope']]
]) {
  const item = first.observances.find((observance) => observance.observanceId === id);
  assert(item?.observanceKey === 'principal-commemoration', `${id} stable Observance key changed.`);
  assert(item?.observanceType === 'multi-person-commemoration', `${id} must remain a multi-person Observance.`);
  assert(item.subjects.length === 2, `${id} must have exactly two Person subjects.`);
  assert(JSON.stringify(item.subjects.map((subject) => subject.personId).sort()) === JSON.stringify(people), `${id} Person subjects changed.`);
  assert(new Set(item.subjects.map((subject) => subject.recognitionId)).size === 2, `${id} must bind two distinct Recognitions.`);
}

const canadianMartyrs = first.observances.find((item) => item.observanceId === 'observance:john-brebeuf-isaac-jogues-companions:roman-catholic');
const canadianMartyrIds = ['antoine-daniel', 'charles-garnier', 'gabriel-lalemant', 'isaac-jogues', 'jean-de-la-lande', 'john-brebeuf', 'noel-chabanel', 'rene-goupil'];
assert(canadianMartyrs?.observanceType === 'multi-person-commemoration' && canadianMartyrs.subjects.length === 8, 'Canadian Martyrs must remain one Observance with eight distinct Person subjects.');
assert(JSON.stringify(canadianMartyrs.subjects.map((subject) => subject.personId).sort()) === JSON.stringify(canadianMartyrIds), 'Canadian Martyrs Person subjects changed.');
assert(new Set(canadianMartyrs.subjects.map((subject) => subject.recognitionId)).size === 8, 'Canadian Martyrs must bind eight distinct Recognitions.');

const japanMartyrs = first.observances.find((item) => item.observanceId === 'observance:lawrence-ruiz-companions:roman-catholic');
const japanMartyrIds = ['antonio-gonzalez-japan-martyr', 'domingo-ibanez-erquicia', 'francisco-shoyemon', 'guillermo-courtet', 'jacinto-jordan-ansalone', 'lazaro-kyoto', 'lorenzo-ruiz', 'lucas-alonso-espiritu-santo', 'magdalena-nagasaki', 'marina-omura', 'mateo-kohioye', 'miguel-aozaraza', 'miguel-kurobioye', 'santiago-kyushei-tomonaga', 'tomas-hioji-nishi', 'vicente-shiwozuka'];
assert(japanMartyrs?.observanceType === 'multi-person-commemoration' && japanMartyrs.subjects.length === 16, 'Lawrence Ruiz and companions must remain one Observance with sixteen distinct Person subjects.');
assert(JSON.stringify(japanMartyrs.subjects.map((subject) => subject.personId).sort()) === JSON.stringify(japanMartyrIds), 'Lawrence Ruiz companions changed.');
assert(new Set(japanMartyrs.subjects.map((subject) => subject.recognitionId)).size === 16, 'Lawrence Ruiz and companions must bind sixteen distinct Recognitions.');

const paulMikiMartyrs = first.observances.find((item) => item.observanceId === 'observance:paul-miki-companions:roman-catholic');
const paulMikiIds = ['anthony-japan-martyr', 'bonaventure-japan-martyr', 'cosmas-takeya', 'francis-adaucto', 'francis-blanco', 'francis-meako', 'francis-saint-michael-parilla', 'gabriel-japan-martyr', 'gonsalo-garcia', 'james-kisai', 'joachim-sakakibara', 'john-kinuya', 'john-soan-goto', 'leo-karasuma', 'louis-ibaraki', 'martin-ascension-aguirre', 'matthias-japan-martyr', 'michael-kozaki', 'paul-ibaraki', 'paul-miki', 'paul-suzuki', 'peter-baptist-blasquez', 'peter-sukejiro', 'philip-jesus-las-casas', 'thomas-dangi', 'thomas-kozaki'];
assert(paulMikiMartyrs?.subjects.length === 26, 'Paul Miki and companions must preserve twenty-six independent Person subjects.');
assert(JSON.stringify(paulMikiMartyrs.subjects.map((subject) => subject.personId).sort()) === JSON.stringify(paulMikiIds), 'Paul Miki companions changed.');
assert(new Set(paulMikiMartyrs.subjects.map((subject) => subject.recognitionId)).size === 26, 'Paul Miki and companions must bind twenty-six distinct Recognitions.');

const firstMartyrsRome = first.observances.find((item) => item.observanceId === 'observance:first-martyrs-rome:roman-catholic');
assert(firstMartyrsRome?.observanceKey === 'principal-commemoration' && firstMartyrsRome.observanceType === 'collective-commemoration', 'First Martyrs of the Church of Rome must remain one collective Observance.');
assert(firstMartyrsRome.subjects.length === 0, 'First Martyrs of the Church of Rome must not fabricate anonymous Person subjects.');
assert(firstMartyrsRome.subjectlessKey === 'first-martyrs-rome', 'First Martyrs of the Church of Rome must retain a stable subjectless identity key.');
assert(firstMartyrsRome.evidence.some((item) => item.url.includes('vatican.va/')), 'First Martyrs of the Church of Rome requires direct Holy See collective evidence.');

const archangels = first.observances.find((item) => item.observanceId === 'observance:michael-gabriel-raphael-archangels:roman-catholic');
assert(archangels?.observanceKey === 'principal-commemoration' && archangels.observanceType === 'angelic-commemoration', 'Michael, Gabriel and Raphael must remain one angelic Observance.');
assert(archangels.subjects.length === 0 && archangels.subjectlessKey === 'michael-gabriel-raphael', 'Archangels must not be coerced into human Person/Recognition records.');
assert(archangels.evidence.some((item) => item.url.includes('vatican.va/')), 'Archangels require direct Holy See non-human attestation.');

for (const observance of first.observances) {
  assert(observance.entityType === 'Observance', `${observance.observanceId} is not emitted as Observance.`);
  assert(observance.resolutionStatus === 'canonical-anchor', `${observance.observanceId} lost canonical-anchor status.`);
  assert(observance.occurrenceDateImplied === false, `${observance.observanceId} incorrectly implies an occurrence date.`);
  assert(observance.calendarSystemImplied === false, `${observance.observanceId} incorrectly implies a calendar system.`);
  assert(observance.jurisdictionImplied === false, `${observance.observanceId} incorrectly implies a jurisdiction.`);
  assert(observance.rankImplied === false, `${observance.observanceId} incorrectly implies rank.`);
  assert(observance.precedenceImplied === false, `${observance.observanceId} incorrectly implies precedence.`);
  assert(observance.deletionPolicy === 'tombstone-only', `${observance.observanceId} lost tombstone-only deletion.`);
  for (const forbidden of ['year', 'month', 'day', 'date', 'dateISO', 'feastDate', 'calendarSystem', 'calendarId', 'jurisdictionId', 'rank', 'grade', 'precedence', 'transferRule']) {
    assert(!(forbidden in observance), `${observance.observanceId} leaked ${forbidden} into Observance.`);
  }
}

const secondJohnObservance = structuredClone(observanceDataset);
const johnSource = secondJohnObservance.observances.find((item) => item.id === 'observance:john-baptist-nativity:roman-catholic');
assert(johnSource, 'John Baptist Nativity fixture is missing.');
secondJohnObservance.observances.push({
  ...structuredClone(johnSource),
  id: 'observance:john-baptist-martyrdom:roman-catholic',
  observanceKey: 'martyrdom',
  observanceType: 'person-commemoration'
});
const twoJohnBuild = build(secondJohnObservance);
assert(twoJohnBuild.observances.filter((item) => item.subjects.some((subject) => subject.personId === 'john-baptist')).length === 2, 'Distinct Observance keys must allow multiple Observances for one Person in one Church.');

const missingKey = structuredClone(observanceDataset);
delete missingKey.observances[0].observanceKey;
expectFailure('Missing stable Observance key guard', () => build(missingKey), 'invalid observanceKey');

const dateLeak = structuredClone(observanceDataset);
dateLeak.observances[0].dateISO = '2026-09-21';
expectFailure('Observance/Occurrence boundary guard', () => build(dateLeak), 'leaks Occurrence field dateISO');

const unknownRecognition = structuredClone(observanceDataset);
unknownRecognition.observances[0].subjects[0].recognitionId = 'recognition:unknown:roman-catholic';
expectFailure('Unknown Recognition guard', () => build(unknownRecognition), 'unknown Recognition');

const crossChurchRecognition = structuredClone(observanceDataset);
crossChurchRecognition.observances[0].subjects[0].recognitionId = 'recognition:matthew-apostle:orthodox-church-america';
expectFailure('Cross-Church Recognition guard', () => build(crossChurchRecognition), 'Recognition belongs to a different Church');

const crossChurchEvidence = structuredClone(observanceDataset);
crossChurchEvidence.observances[0].evidence[0].url = 'https://www.oca.org/saints/lives/2007/11/16/103313-apostle-and-evangelist-matthew';
expectFailure('Cross-Church evidence guard', () => build(crossChurchEvidence), 'outside canonical Church authority domains');

const duplicateIdentity = structuredClone(observanceDataset);
duplicateIdentity.observances.push({
  ...structuredClone(duplicateIdentity.observances[0]),
  id: 'observance:matthew-apostle:roman-catholic:duplicate',
  observanceType: 'feast'
});
expectFailure('Duplicate canonical Observance identity guard', () => build(duplicateIdentity), 'duplicates canonical Observance identity');

const subjectlessPersonCommemoration = structuredClone(observanceDataset);
subjectlessPersonCommemoration.observances[0].subjects = [];
expectFailure('Subjectless person commemoration guard', () => build(subjectlessPersonCommemoration), 'requires at least one subject');

const fabricatedCollectiveSubject = structuredClone(observanceDataset);
fabricatedCollectiveSubject.observances.find((item) => item.id === 'observance:first-martyrs-rome:roman-catholic').subjects = structuredClone(observanceDataset.observances[0].subjects);
expectFailure('Collective synthetic Person guard', () => build(fabricatedCollectiveSubject), 'must not fabricate Person subjects');

const missingSubjectlessKey = structuredClone(observanceDataset);
delete missingSubjectlessKey.observances.find((item) => item.id === 'observance:michael-gabriel-raphael-archangels:roman-catholic').subjectlessKey;
expectFailure('Non-human subjectless identity guard', () => build(missingSubjectlessKey), 'requires a stable subjectlessKey');

const fabricatedAngelicPerson = structuredClone(observanceDataset);
fabricatedAngelicPerson.observances.find((item) => item.id === 'observance:michael-gabriel-raphael-archangels:roman-catholic').subjects = structuredClone(observanceDataset.observances[0].subjects);
expectFailure('Angelic Person coercion guard', () => build(fabricatedAngelicPerson), 'must not fabricate Person subjects');

console.log(`Canonical Observance Vault v1.3 test passed: ${first.observances.length} observances across ${first.manifest.personCoverageCount} people, including reviewed subjectless collectives and non-human commemorations, deterministic root ${first.manifest.rootSha256}.`);
