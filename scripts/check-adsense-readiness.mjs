#!/usr/bin/env node

import fs from 'node:fs';

const required = [
  'lib/adsense.ts',
  'app/layout.tsx',
  'app/ads.css',
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
  for(const path of ['/calendar','/explore','/day','/privacy','/terms','/faq','/corrections','/about','/advertising','/developers','/live']){
    expect(config.includes(`'${path}'`),`Auto Ads exclusion missing ${path}`);
  }
  expect(config.includes("NEXT_PUBLIC_ADSENSE_CODE_ENABLED === 'true'"),'AdSense ownership code must require an explicit enable flag');
  expect(config.includes("NEXT_PUBLIC_ADSENSE_ENABLED === 'true'"),'Ad serving must require a separate explicit enable flag');
  expect(config.includes('NEXT_PUBLIC_ADSENSE_TOP_SLOT'),'Top banner slot is missing');
  expect(config.includes('NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT'),'Sidebar slot is missing');
  expect(config.includes('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'),'Search Console verification hook is missing');
  expect(config.includes('isAdUnitActive'),'Inactive ads must not reserve empty layout space');
  expect(config.includes('CLIENT_RE.test(ADSENSE_CLIENT)'),'Advertising must reject malformed publisher IDs');

  const bootstrap=text('app/components/AdSenseBootstrap.tsx');
  expect(bootstrap.includes('google-adsense-account'),'AdSense ownership meta tag is missing');
  expect(bootstrap.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),'Official AdSense code is missing');
  expect(bootstrap.includes('ADSENSE_CODE_ENABLED'),'AdSense code must be separable from ad serving');

  const layout=text('app/layout.tsx');
  expect(layout.includes('<head><AdSenseBootstrap /></head>'),'AdSense code must be rendered in document head');
  expect(layout.includes('GOOGLE_SITE_VERIFICATION'),'Search Console verification must be exposed through metadata');
  expect(layout.includes("import './ads.css'"),'Responsive ad layout CSS must be loaded');

  const adsTxt=text('app/ads.txt/route.ts');
  expect(adsTxt.includes('status: 404'),'ads.txt must fail closed before a publisher ID exists');
  expect(adsTxt.includes('f08c47fec0942fa0'),'ads.txt Google seller relationship ID is missing');

  const saint=text('app/saint/[id]/page.tsx');
  expect(saint.includes('SAINT_BIOGRAPHIES.map'),'Only editorial biographies should be statically generated');
  expect(saint.includes('index: false, follow: true'),'Minimal profiles must be noindex/follow');
  expect(saint.includes('getSaintBiography'),'Profile indexing must depend on reviewed biography content');
  expect(saint.includes('"@type": "Person"'),'Editorial saint profiles should expose Person structured data');
  expect(saint.includes('BreadcrumbList'),'Editorial profiles should expose breadcrumbs');

  const sitemap=text('app/sitemap.ts');
  expect(sitemap.includes('SAINT_BIOGRAPHIES.map'),'Sitemap must exclude minimal saint profiles');
  expect(sitemap.includes('path: "/about"'),'About page must be in sitemap');
  expect(sitemap.includes('path: "/advertising"'),'Advertising transparency page must be in sitemap');

  const profile=text('app/components/SaintProfile.tsx');
  expect(profile.includes('biography?<AdSlot slot={ADSENSE_TOP_SLOT} placement="top"/>'),'Rich profiles need a guarded top banner');
  expect(profile.includes('ADSENSE_SIDEBAR_SLOT'),'Rich profiles need a guarded desktop sidebar');
  const home=text('app/page.tsx');
  expect(home.indexOf('<TodayPanel />') < home.indexOf('ADSENSE_TOP_SLOT} placement="top"'),'Homepage banner must follow the core Today experience');
  expect(home.includes('home-monetized-layout'),'Homepage must reserve a separate content/ad rail layout');
  expect(home.includes('has-ad-rail'),'Homepage must collapse the rail when advertising is inactive');
  expect(home.includes('SAINT_BIOGRAPHIES'),'Homepage must internally link substantive editorial profiles');

  const privacy=text('app/components/AdvertisingPrivacyNotice.tsx');
  expect(privacy.includes('Google AdSense'),'Privacy disclosure must identify Google AdSense');
  expect(privacy.includes('tradição cristã escolhida'),'Portuguese disclosure must protect religious preference from targeting');

  const checklist=text('docs/adsense-activation-checklist.md');
  expect(checklist.includes('Auto ads may be enabled'),'Activation checklist must document controlled Auto Ads');
  expect(checklist.includes('certified CMP'),'Activation checklist must require a certified CMP');
  expect(checklist.includes('Google Search Console'),'Activation checklist must include organic search verification');
}

if(failures.length){
  console.error(`AdSense readiness audit failed with ${failures.length} issue(s):`);
  for(const failure of failures)console.error(`- ${failure}`);
  process.exit(1);
}
console.log('AdSense readiness audit passed: site review code, controlled ad serving, top/sidebar inventory, privacy boundaries and SEO verification are present.');
