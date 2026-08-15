#!/usr/bin/env node

import fs from 'node:fs';

const required = [
  'lib/adsense.ts',
  'app/components/AdSenseBootstrap.tsx',
  'app/components/AdSlot.tsx',
  'app/components/AdvertisingPrivacyNotice.tsx',
  'app/components/PrivacyChoicesLink.tsx',
  'app/ads.txt/route.ts',
  'app/about/page.tsx',
  'app/advertising/page.tsx',
  'app/privacy/page.tsx',
  'app/saint/[id]/page.tsx',
  'app/sitemap.ts',
  'docs/adsense-activation-checklist.md',
];

const failures=[];
for(const path of required){if(!fs.existsSync(path))failures.push(`Missing ${path}`)}
function text(path){return fs.readFileSync(path,'utf8')}
function expect(condition,message){if(!condition)failures.push(message)}

if(!failures.length){
  const config=text('lib/adsense.ts');
  for(const path of ['/privacy','/terms','/faq','/corrections','/about','/advertising','/developers','/live']){
    expect(config.includes(`'${path}'`),`AdSense script exclusion missing ${path}`);
  }
  expect(config.includes("NEXT_PUBLIC_ADSENSE_ENABLED === 'true'"),'Advertising must require an explicit enable flag');
  expect(config.includes('CLIENT_RE.test(ADSENSE_CLIENT)'),'Advertising must reject malformed publisher IDs');

  const adsTxt=text('app/ads.txt/route.ts');
  expect(adsTxt.includes('status: 404'),'ads.txt must fail closed before a publisher ID exists');
  expect(adsTxt.includes('f08c47fec0942fa0'),'ads.txt Google seller relationship ID is missing');

  const saint=text('app/saint/[id]/page.tsx');
  expect(saint.includes('SAINT_BIOGRAPHIES.map'),'Only editorial biographies should be statically generated');
  expect(saint.includes('index: false, follow: true'),'Minimal profiles must be noindex/follow');
  expect(saint.includes('getSaintBiography'),'Profile indexing must depend on reviewed biography content');

  const sitemap=text('app/sitemap.ts');
  expect(sitemap.includes('SAINT_BIOGRAPHIES.map'),'Sitemap must exclude minimal saint profiles');
  expect(sitemap.includes('path: "/about"'),'About page must be in sitemap');
  expect(sitemap.includes('path: "/advertising"'),'Advertising transparency page must be in sitemap');

  const profile=text('app/components/SaintProfile.tsx');
  expect(profile.includes('biography?<AdSlot'),'Profile ads must require a substantive biography');
  const home=text('app/page.tsx');
  expect(home.indexOf('home-trust-grid') < home.indexOf('ADSENSE_HOME_SLOT} placement="home"'),'Homepage ad must appear after publisher-created explanatory content');

  const privacy=text('app/components/AdvertisingPrivacyNotice.tsx');
  expect(privacy.includes('Google AdSense'),'Privacy disclosure must identify Google AdSense');
  expect(privacy.includes('tradição cristã escolhida'),'Portuguese disclosure must protect religious preference from targeting');

  const checklist=text('docs/adsense-activation-checklist.md');
  expect(checklist.includes('Auto Ads disabled'),'Activation checklist must keep Auto Ads disabled initially');
  expect(checklist.includes('certified CMP'),'Activation checklist must require a certified CMP');
}

if(failures.length){
  console.error(`AdSense readiness audit failed with ${failures.length} issue(s):`);
  for(const failure of failures)console.error(`- ${failure}`);
  process.exit(1);
}
console.log('AdSense readiness audit passed: fail-closed monetization, privacy boundaries and high-value inventory rules are present.');
