#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function argument(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonLines(file) { return fs.readFileSync(file, 'utf8').split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line)); }
function filesNamed(root, name) {
  const out = []; if (!root || !fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) { const full = path.join(root, entry.name); if (entry.isDirectory()) out.push(...filesNamed(full, name)); else if (entry.name === name) out.push(full); }
  return out.sort();
}
function yearFromWikidataDate(value) {
  if (typeof value !== 'string') return null;
  const match = /^([+-]?\d{1,9})-/u.exec(value); if (!match) return null;
  const year = Number(match[1]); return Number.isSafeInteger(year) && year !== 0 ? year : null;
}
function dateFact(projection) {
  const value = projection?.canonical; const year = yearFromWikidataDate(value);
  if (!value || year === null) return null;
  return { value, year, precision: 'source-value', resolutionStatus: projection.resolutionStatus };
}
function percent(count, total) { return total ? Number(((count / total) * 100).toFixed(1)) : 0; }

function loadPackages(root, filename, enrichmentIds, identityRootSha256) {
  const allowed = new Set(Array.isArray(enrichmentIds) ? enrichmentIds : [enrichmentIds]);
  const packages = filesNamed(root, filename).map(readJson); const entities = new Map();
  for (const pkg of packages) {
    if (!allowed.has(pkg?.enrichmentId) || pkg?.identityRootSha256 !== identityRootSha256 || pkg?.publish !== false || pkg?.productionMutation !== false) throw new Error(`Unsafe or mismatched ${[...allowed].join('/')} package.`);
    for (const entity of pkg.entities ?? []) {
      if (entities.has(entity.qid)) throw new Error(`Duplicate ${pkg.enrichmentId} entity ${entity.qid}.`);
      entities.set(entity.qid, { ...entity, enrichmentId: pkg.enrichmentId });
    }
  }
  return { packages, entities };
}

export function assembleNavigationSource({ identityManifest, identityReport, identityLedger, profilePackages = [], labelPackages = [], vatican = null } = {}) {
  const root = identityManifest?.rootSha256;
  if (!root || identityManifest?.stage !== 'global-candidate-identity-ledger' || identityManifest?.publish !== false || identityReport?.rootSha256 !== root || identityReport?.freezeIdentityGateEligible !== true) throw new Error('Navigation assembly requires one verified staging identity root.');
  if (!Array.isArray(identityLedger) || identityLedger.length !== identityReport.uniqueIdentityCount) throw new Error('Navigation identity count mismatch.');

  const profiles = new Map();
  for (const pkg of profilePackages) {
    if (pkg?.enrichmentId !== 'saints-profile-v1' || pkg?.identityRootSha256 !== root || pkg?.publish !== false) throw new Error('Navigation assembly received a mismatched profile package.');
    for (const entity of pkg.entities ?? []) { if (profiles.has(entity.qid)) throw new Error(`Duplicate profile ${entity.qid}.`); profiles.set(entity.qid, entity); }
  }
  const labels = new Map();
  for (const pkg of labelPackages) {
    if (!['saints-labels-v2','saints-labels-v3'].includes(pkg?.enrichmentId) || pkg?.identityRootSha256 !== root || pkg?.publish !== false || pkg?.languageFallbacksEnabled !== false || pkg?.translationEnabled === true) throw new Error('Navigation assembly received a mismatched labels package.');
    if (pkg.enrichmentId === 'saints-labels-v3' && pkg.sitelinkTitleEvidenceEnabled !== true) throw new Error('Navigation assembly received labels v3 without sitelink provenance.');
    for (const entity of pkg.entities ?? []) { if (labels.has(entity.qid)) throw new Error(`Duplicate labels entity ${entity.qid}.`); labels.set(entity.qid, { ...entity, enrichmentId: pkg.enrichmentId }); }
  }

  const people = identityLedger.map((identity) => {
    if (identity.entityId !== `wikidata:${identity.qid}` || identity.publish !== false) throw new Error(`Unsafe identity ${identity?.qid ?? '<missing>'}.`);
    const profile = profiles.get(identity.qid); const labelEvidence = labels.get(identity.qid);
    const names = {}; const nameEvidence = {};
    for (const [locale, label] of Object.entries(labelEvidence?.labels ?? {})) {
      if (label?.status !== 'source' || label?.scriptStatus !== 'expected' || !label?.value) continue;
      names[locale] = label.value;
      nameEvidence[locale] = { sourceId: 'wikidata', sourceKind: label.sourceKind ?? 'wikidata-label', wikidataLanguage: label.wikidataLanguage ?? locale };
    }
    if (labelEvidence?.enrichmentId === 'saints-labels-v3') {
      for (const [locale, sitelink] of Object.entries(labelEvidence?.sitelinks ?? {})) {
        if (names[locale] || sitelink?.status !== 'source' || sitelink?.scriptStatus !== 'expected' || !sitelink?.value) continue;
        names[locale] = sitelink.value;
        nameEvidence[locale] = { sourceId: 'wikidata', sourceKind: 'wikipedia-sitelink-title', wikipediaSite: sitelink.wikipediaSite ?? null };
      }
    }
    const places = (profile?.places ?? []).map((place) => ({ ...place, countryCode: place.countryCode ?? null, sourceIds: [...new Set(place.sourceIds ?? ['wikidata'])] }));
    return {
      entityId: identity.entityId,
      qid: identity.qid,
      canonicalName: identity.canonicalNameCandidates?.[0] ?? identity.entityId,
      names,
      nameEvidence,
      aliases: labelEvidence?.aliases ?? {},
      birth: dateFact(profile?.dates?.birth),
      death: dateFact(profile?.dates?.death),
      places,
      traditions: [],
      categories: ['saint-candidate'],
      identityStatus: identity.identityStatus,
      validationStatus: 'provisional',
      publicationStatus: 'withheld',
      sourceIds: ['wikidata'],
      observances: []
    };
  });

  const unlinkedObservances = [];
  if (vatican) {
    if (vatican?.schemaVersion !== 1 || vatican?.sourceId !== 'vatican-news-saint-of-day-pt' || !Array.isArray(vatican.events)) throw new Error('Navigation assembly received an invalid Vatican observance package.');
    for (const event of vatican.events) unlinkedObservances.push({ ...event, sourceIds: [vatican.sourceId] });
  }

  const locales = ['en','es','pt','fr','fil','ru','sw','de','it','pl'];
  const labelCoverage = Object.fromEntries(locales.map((locale) => {
    const count = people.filter((person) => Boolean(person.names[locale])).length;
    return [locale, { count, total: people.length, percent: percent(count, people.length) }];
  }));
  const nameEvidenceByKind = {};
  for (const person of people) for (const evidence of Object.values(person.nameEvidence ?? {})) nameEvidenceByKind[evidence.sourceKind] = (nameEvidenceByKind[evidence.sourceKind] ?? 0) + 1;
  const withCoordinates = people.filter((person) => person.places.some((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon))).length;
  const withTimeline = people.filter((person) => person.birth?.year || person.death?.year).length;
  const observanceDays = new Set(unlinkedObservances.map((event) => `${String(event.month).padStart(2,'0')}-${String(event.day).padStart(2,'0')}`));
  const profileCount = profiles.size; const labelEntityCount = labels.size;
  const readiness = {
    identityCount: people.length,
    profiles: { count: profileCount, percent: percent(profileCount, people.length), complete: profileCount === people.length },
    labelEntities: { count: labelEntityCount, percent: percent(labelEntityCount, people.length), complete: labelEntityCount === people.length },
    labelsByLocale: labelCoverage,
    nameEvidenceByKind,
    labelEnrichmentVersion: labelPackages[0]?.enrichmentId ?? null,
    map: { peopleWithCoordinates: withCoordinates, percent: percent(withCoordinates, people.length) },
    timeline: { peopleWithDates: withTimeline, percent: percent(withTimeline, people.length) },
    dailySaints: { dayCount: observanceDays.size, expectedDays: vatican?.sourceScope === 'all' ? 366 : vatican?.coverage?.expectedDays ?? null, complete: vatican?.coverage?.complete === true },
    globalEnrichmentComplete: profileCount === people.length && labelEntityCount === people.length
  };
  const sourceCore = { identityRootSha256: root, people, unlinkedObservances };
  return { schemaVersion: 1, datasetVersion: `navigation-v1:${root.slice(0,16)}`, identityRootSha256: root, sourceSha256: sha256(JSON.stringify(sourceCore)), generatedAt: new Date().toISOString(), publicationAllowed: false, productionMutation: false, readiness, people, unlinkedObservances };
}

function main() {
  const manifestPath = argument('--identity-manifest'); const reportPath = argument('--identity-report'); const ledgerPath = argument('--identity-ledger'); const output = argument('--output');
  if (!manifestPath || !reportPath || !ledgerPath || !output) throw new Error('--identity-manifest, --identity-report, --identity-ledger and --output are required.');
  const manifest = readJson(manifestPath); const root = manifest.rootSha256;
  const profileRoot = argument('--profiles-dir'); const labelsRoot = argument('--labels-dir');
  const profile = loadPackages(profileRoot, 'profile-normalized.json', 'saints-profile-v1', root);
  const label = loadPackages(labelsRoot, 'labels-normalized.json', ['saints-labels-v2','saints-labels-v3'], root);
  const vaticanPath = argument('--vatican');
  const result = assembleNavigationSource({ identityManifest: manifest, identityReport: readJson(reportPath), identityLedger: readJsonLines(ledgerPath), profilePackages: profile.packages, labelPackages: label.packages, vatican: vaticanPath && fs.existsSync(vaticanPath) ? readJson(vaticanPath) : null });
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true }); fs.writeFileSync(path.resolve(output), `${JSON.stringify(result, null, 2)}\n`, 'utf8'); process.stdout.write(`${JSON.stringify({ datasetVersion: result.datasetVersion, sourceSha256: result.sourceSha256, readiness: result.readiness, publicationAllowed: false }, null, 2)}\n`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) { try { main(); } catch (error) { console.error(error); process.exit(1); } }
