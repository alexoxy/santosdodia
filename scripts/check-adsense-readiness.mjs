#!/usr/bin/env node

import fs from 'node:fs';

const required = [
  'AGENTS.md',
  'lib/adsense.ts',
  'next.config.ts',
  'app/layout.tsx',
  'app/ads.css',
  'app/components/AdSenseBootstrap.tsx',
  'app/components/AdSlot.tsx',
  'app/components/SiteChrome.tsx',
  'app/components/AdvertisingPrivacyNotice.tsx',
  'app/components/PrivacyChoicesLink.tsx',
  'app/ads.txt/route.ts',
  'app/about/page.tsx',
  'app/advertising/page.tsx',
  'app/privacy/page.tsx',
  'app/saint/[id]/page.tsx',
  'app/date/[monthDay]/page.tsx',
  'app/sitemap.ts',
  'docs/adsense-activation-checklist.md',
  'docs/monetization-status.md',
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
  expect(config.includes('ADSENSE_SHARED_FRAME_PREFIXES'),'Shared content ad-frame allowlist is missing');
  expect(config.includes("'/date'"),'Evergreen date pages must be eligible for the shared content ad frame');
  expect(config.includes('usesSharedAdFrame'),'Shared ad-frame route guard is missing');

  const nextConfig=text('next.config.ts');
  expect(nextConfig.includes("'ca-pub-2568362274337344'"),'Santos do Dia must preserve the reviewed AdSense publisher client');
  expect(nextConfig.includes("NEXT_PUBLIC_ADSENSE_CODE_ENABLED ?? 'true'"),'AdSense site-association code must stay enabled during review');
  expect(nextConfig.includes("NEXT_PUBLIC_ADSENSE_ENABLED ?? 'false'"),'Ad serving must remain fail-closed while AdSense status is PREPARING');

  const bootstrap=text('app/components/AdSenseBootstrap.tsx');
  expect(bootstrap.includes('google-adsense-account'),'AdSense ownership meta tag is missing');
  expect(bootstrap.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),'Official AdSense code is missing');
  expect(bootstrap.includes('ADSENSE_CODE_ENABLED'),'AdSense code must be separable from ad serving');

  const layout=text('app/layout.tsx');
  expect(layout.includes('<head><AdSenseBootstrap /></head>'),'AdSense code must be rendered in document head');
  expect(layout.includes('GOOGLE_SITE_VERIFICATION'),'Search Console verification must be exposed through metadata');
  expect(layout.includes("import './ads.css'"),'Responsive ad layout CSS must be loaded');

  const chrome=text('app/components/SiteChrome.tsx');
  expect(chrome.includes('usesSharedAdFrame(pathname)'),'Site chrome must gate shared advertising by public content route');
  expect(chrome.includes('site-top-ad'),'Shared top ad container is missing');
  expect(chrome.includes('site-ad-sidebar-rail'),'Shared desktop content rail is missing');
  expect(chrome.includes('ADSENSE_TOP_SLOT') && chrome.includes('ADSENSE_SIDEBAR_SLOT'),'Shared site chrome must expose both manual units');

  const adCss=text('app/ads.css');
  expect(!adCss.includes('position: fixed'),'Advertising CSS must not use fixed-position overlays');
  expect(adCss.includes('grid-template-columns: minmax(0, 1180px) 300px'),'Desktop advertising must reserve a separate layout column');
  expect(adCss.includes('.site-ad-sidebar-rail') && adCss.includes('position: sticky'),'Desktop rail may be sticky only inside its reserved column');
  expect(adCss.includes('@media (max-width: 1360px)'),'Desktop rail must collapse before it can squeeze the content surface');
  expect(adCss.includes('.home-monetized-layout.has-ad-rail'),'Homepage must retain its content-first local ad rail layout');
  expect(adCss.includes('.saint-profile-actions .ad-sidebar-rail'),'Rich saint profiles must retain their local guarded ad rail layout');
  expect(adCss.includes('@media (max-width: 1080px)'),'Homepage and rich-profile local rails must collapse on narrower screens');

  const adsTxt=text('app/ads.txt/route.ts');
  expect(adsTxt.includes('status: 404'),'ads.txt must fail closed before a publisher ID exists');
  expect(adsTxt.includes('f08c47fec0942fa0'),'ads.txt Google seller relationship ID is missing');

  const saint=text('app/saint/[id]/page.tsx');
  expect(saint.includes('SAINT_BIOGRAPHIES.map'),'Only editorial biographies should be statically generated');
  expect(saint.includes('index: false, follow: true'),'Minimal profiles must be noindex/follow');
  expect(saint.includes('getSaintBiography'),'Profile indexing must depend on reviewed biography content');
  expect(saint.includes('isSaintBiographyIndexable'),'Profile indexing must pass the substantive editorial quality gate');
  expect(saint.includes('"@type": "Person"'),'Editorial saint profiles should expose Person structured data');
  expect(saint.includes('BreadcrumbList'),'Editorial profiles should expose breadcrumbs');

  const annualDay=text('app/date/[monthDay]/page.tsx');
  expect(annualDay.includes('canonical = `/date/${monthDay}`'),'Evergreen date pages need stable month-day canonicals');
  expect(annualDay.includes('robots: { index: items.length > 0, follow: true }'),'Empty evergreen date pages must remain out of the index');
  expect(annualDay.includes('<DayView dateISO={dateISO} mode="annual" />'),'Evergreen date pages must use the annual day experience');
  expect(annualDay.includes('BreadcrumbList'),'Evergreen date pages should expose breadcrumbs');

  const sitemap=text('app/sitemap.ts');
  expect(sitemap.includes('SAINT_BIOGRAPHIES.filter(isSaintBiographyReadyForLaunchedLocales).map'),'Sitemap must include only saint biographies that pass the launched-locale editorial gate');
  expect(sitemap.includes('path: "/about"'),'About page must be in sitemap');
  expect(sitemap.includes('path: "/advertising"'),'Advertising transparency page must be in sitemap');
  expect(sitemap.includes('url: `${SITE_ORIGIN}/date/${monthDay}`'),'Sitemap must expose only data-backed evergreen month-day pages');

  const profile=text('app/components/SaintProfile.tsx');
  expect(profile.includes('editorialReady?<AdSlot slot={ADSENSE_TOP_SLOT} placement="top"/>'),'Rich profiles need an editorial-quality-guarded top banner');
  expect(profile.includes('isSaintBiographyIndexable'),'Rich profile ad eligibility must use the substantive editorial gate');
  expect(profile.includes('ADSENSE_SIDEBAR_SLOT'),'Rich profiles need a guarded desktop sidebar');
  const home=text('app/page.tsx');
  expect(home.indexOf('<TodayPanel />') < home.indexOf('ADSENSE_TOP_SLOT} placement="top"'),'Homepage banner must follow the core Today experience');
  expect(home.includes('home-monetized-layout'),'Homepage must reserve a separate content/ad rail layout');
  expect(home.includes('has-ad-rail'),'Homepage must collapse the rail when advertising is inactive');
  expect(home.includes('SAINT_BIOGRAPHIES'),'Homepage must internally link substantive editorial profiles');

  const privacy=text('app/components/AdvertisingPrivacyNotice.tsx');
  expect(privacy.includes('Google AdSense'),'Privacy disclosure must identify Google AdSense');
  expect(privacy.includes('tradição cristã escolhida'),'Portuguese disclosure must protect religious preference from targeting');

  const status=text('docs/monetization-status.md');
  expect(status.includes('AdSense site review status: **PREPARING**'),'Operational monetization state must remain PREPARING until explicit approval is recorded');
  expect(status.includes('`ads.txt` authorization status: **AUTHORIZED**'),'Authorized ads.txt state must remain documented');
  expect(status.includes('Ad serving in the application: **DISABLED**'),'Ad serving must remain documented as disabled during review');
  expect(status.includes('2026-08-15 17:04 WEST'),'AdSense review-state observation timestamp must remain traceable');
  expect(status.includes('Auto ads remain off at initial activation'),'Initial monetization must remain manual-only');

  const agents=text('AGENTS.md');
  expect(agents.includes('While that file records AdSense as **PREPARING**'),'Development instructions must propagate the AdSense review guardrail');
  expect(agents.includes('NEXT_PUBLIC_ADSENSE_ENABLED=false'),'Development instructions must keep ad serving disabled during review');
  expect(agents.includes('no anchor ads') && agents.includes('vignette/interstitial'),'Development instructions must prohibit overlay ad formats');

  const checklist=text('docs/adsense-activation-checklist.md');
  expect(checklist.includes('Keep **Auto ads OFF**'),'Activation checklist must keep initial serving manual-only');
  expect(checklist.includes('no anchor ads') && checklist.includes('no vignette/interstitial ads'),'Activation checklist must prohibit overlay ad formats');
  expect(checklist.includes('certified CMP'),'Activation checklist must require a certified CMP');
  expect(checklist.includes('Google Search Console'),'Activation checklist must include organic search verification');
  expect(checklist.includes('Current operational state — 2026-08-15 17:04 WEST'),'Activation checklist must expose the current AdSense review state');
}

if(failures.length){
  console.error(`AdSense readiness audit failed with ${failures.length} issue(s):`);
  for(const failure of failures)console.error(`- ${failure}`);
  process.exit(1);
}
console.log('AdSense readiness audit passed: PREPARING review state is preserved, serving remains fail-closed, manual non-overlay placements are constrained, privacy boundaries are intact and evergreen date indexing is data-backed.');