#!/usr/bin/env node

import fs from 'node:fs';

const failures = [];
const text = path => fs.readFileSync(path, 'utf8');
const expect = (condition, message) => { if (!condition) failures.push(message); };

const nextConfig = text('next.config.ts');
const sitemap = text('app/sitemap.ts');
const annualDatePage = text('app/date/[monthDay]/page.tsx');
const searchRoute = text('app/api/v1/search/route.ts');
const sourcesAlias = text('app/sources/page.tsx');
const developersAlias = text('app/developers/page.tsx');
const privacyNotice = text('app/components/AdvertisingPrivacyNotice.tsx');
const profileProjection = text('data/canonical-person-profiles.ts');
const people = JSON.parse(text('data/canonical-person-anchors.json')).people;
const observances = JSON.parse(text('data/canonical-observance-anchors.json')).observances;
const sanctoraleRules = JSON.parse(text('data/canonical-roman-sanctorale-rule-anchors.json')).rules;

const excludedProductRoutes = [
  '/explore',
  '/calendar',
  '/liturgy',
  '/churches',
  '/church/:path*',
  '/jurisdiction/:path*',
  '/holidays',
  '/live',
  '/leaders',
  '/leader/:path*'
];

expect(nextConfig.includes("{ key: 'X-Robots-Tag', value: 'noindex, follow' }"), 'Search-excluded product routes must emit X-Robots-Tag: noindex, follow');
expect(nextConfig.includes('searchExcludedProductRoutes'), 'Search-excluded product routes must use one explicit central policy');
for (const route of excludedProductRoutes) {
  expect(nextConfig.includes(`'${route}'`), `Missing noindex route policy for ${route}`);
}

const sitemapExcludedStaticRoutes = [
  '/explore',
  '/calendar',
  '/liturgy',
  '/churches',
  '/holidays',
  '/live',
  '/leaders'
];
for (const route of sitemapExcludedStaticRoutes) {
  expect(!sitemap.includes(`path: "${route}"`), `Utility/directory route ${route} must not be emitted as a static sitemap entry`);
}

expect(!sitemap.includes('CHURCHES.map'), 'Church directory entities must stay out of the sitemap until an editorial gate exists');
expect(!sitemap.includes('JURISDICTIONS.map'), 'Jurisdiction directory entities must stay out of the sitemap until an editorial gate exists');
expect(!sitemap.includes('ECCLESIASTICAL_PEOPLE.map'), 'Leader directory entities must stay out of the sitemap until an editorial gate exists');
expect(!sitemap.includes('DISCOVERY_TOPICS.map'), 'Discovery topics must stay out of the sitemap until an editorial gate exists');
expect(sitemap.includes('SAINT_BIOGRAPHIES.filter(isSaintBiographyReadyForLaunchedLocales).map'), 'Substantive saint profiles must remain editorially gated in the sitemap');
expect(sitemap.includes('.filter(monthDay => hasAnnualDateEditorial(monthDay, "en"))'), 'Annual date pages must remain editorially gated in the sitemap');
expect(annualDatePage.includes('if (!items.length) return { ...metadata, robots: { index: false, follow: true } };'), 'Evergreen date pages with no public observances must fail closed to noindex/follow');
expect(annualDatePage.includes('robots: { index: Boolean(editorial), follow: true }'), 'Evergreen date pages with public observances must still require SantosDia editorial context before indexing');
expect(sitemap.includes('EDITORIAL_GUIDES.map'), 'Reviewed editorial guides must remain represented in the sitemap');
expect(sitemap.includes('path: "/about"') && sitemap.includes('path: "/copyright"') && sitemap.includes('path: "/corrections"'), 'Transparency and canonical provenance pages must remain discoverable');
expect(!sitemap.includes('path: "/sources"') && !sitemap.includes('path: "/developers"'), 'Redirect aliases must not consume sitemap entries');
expect(sourcesAlias.includes("permanentRedirect('/copyright')"), 'Legacy /sources alias must permanently consolidate on /copyright');
expect(developersAlias.includes("permanentRedirect('/copyright')"), 'Legacy /developers alias must permanently consolidate directly on /copyright');
expect(!sourcesAlias.includes("redirect('/copyright')") && !developersAlias.includes("redirect('/sources')"), 'Legacy provenance aliases must not use temporary or chained redirects');
expect(privacyNotice.includes('sdd-timezone'), 'Privacy disclosure must identify the browser-local timezone preference');
expect(privacyNotice.includes('sdd-saved-saints-v1'), 'Privacy disclosure must identify the browser-local saved-saints list');
expect(searchRoute.includes('SAINT_BIOGRAPHIES') && searchRoute.includes('getCanonicalPersonProfileObservance'), 'Search must include the reviewed editorial profile corpus, not only calendar rows');
expect(profileProjection.includes("rule.dateRule.type === 'fixed'"), 'Canonical profile fallback must stay limited to reviewed fixed Sanctorale rules');

for (const id of ['matthew-apostle', 'thomas-aquinas', 'catherine-siena', 'elizabeth-portugal', 'gregory-great']) {
  const person = people.find(item => item.id === id);
  const observance = observances.find(item => item.churchId === 'church:roman-catholic' && item.subjects?.some(subject => subject.kind === 'person' && subject.personId === id));
  const rule = sanctoraleRules.find(item => item.observanceId === observance?.id && item.dateRule?.type === 'fixed' && item.evidence?.length);
  expect(Boolean(person && observance && rule), `Indexed editorial profile ${id} lacks a reviewed canonical fixed-date chain`);
}

if (failures.length) {
  console.error(`Search footprint audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Search footprint audit passed: utility and structured-directory routes remain usable but noindex/follow, while the sitemap is limited to substantive editorial and transparency surfaces.');
