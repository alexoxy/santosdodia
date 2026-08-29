#!/usr/bin/env node

import fs from 'node:fs';

const failures = [];
const text = path => fs.readFileSync(path, 'utf8');
const expect = (condition, message) => { if (!condition) failures.push(message); };

const nextConfig = text('next.config.ts');
const sitemap = text('app/sitemap.ts');

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
expect(sitemap.includes('EDITORIAL_GUIDES.map'), 'Reviewed editorial guides must remain represented in the sitemap');
expect(sitemap.includes('path: "/about"') && sitemap.includes('path: "/sources"') && sitemap.includes('path: "/corrections"'), 'Transparency and provenance pages must remain discoverable');

if (failures.length) {
  console.error(`Search footprint audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Search footprint audit passed: utility and structured-directory routes remain usable but noindex/follow, while the sitemap is limited to substantive editorial and transparency surfaces.');
