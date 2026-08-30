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
  'app/components/TodayPanel.tsx',
  'app/ads.txt/route.ts',
  'app/about/page.tsx',
  'app/advertising/page.tsx',
  'app/privacy/page.tsx',
  'app/saint/[id]/page.tsx',
  'app/day/[date]/page.tsx',
  'app/date/[monthDay]/page.tsx',
  'app/sitemap.ts',
  'docs/editorial-content-policy.md',
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
  expect(nextConfig.includes("NEXT_PUBLIC_ADSENSE_CODE_ENABLED ?? 'true'"),'AdSense site-association code must stay enabled while the site is under review/remediation');
  expect(nextConfig.includes("NEXT_PUBLIC_ADSENSE_ENABLED ?? 'false'"),'Ad serving must remain fail-closed while AdSense is not approved');

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

  const datedDay=text('app/day/[date]/page.tsx');
  expect(datedDay.includes('robots: { index: false, follow: true }'),'Dated utility pages must remain noindex/follow until they have a substantive editorial gate');

  const annualDay=text('app/date/[monthDay]/page.tsx');
  expect(annualDay.includes('canonical = `/date/${monthDay}`'),'Evergreen date pages need stable month-day canonicals');
  expect(annualDay.includes('robots: { index: Boolean(editorial), follow: true }'),'Evergreen date pages must be indexable only when SantosDia editorial context exists');
  expect(annualDay.includes('<DayView dateISO={dateISO} mode="annual" />'),'Evergreen date pages must use the annual day experience');
  expect(annualDay.includes('BreadcrumbList'),'Evergreen date pages should expose breadcrumbs');

  const sitemap=text('app/sitemap.ts');
  expect(sitemap.includes('SAINT_BIOGRAPHIES.filter(isSaintBiographyReadyForLaunchedLocales).map'),'Sitemap must include only saint biographies that pass the launched-locale editorial gate');
  expect(sitemap.includes('path: "/about"'),'About page must be in sitemap');
  expect(sitemap.includes('path: "/advertising"'),'Advertising transparency page must be in sitemap');
  expect(sitemap.includes('.filter(monthDay => hasAnnualDateEditorial(monthDay, "en"))'),'Sitemap must expose only evergreen dates with first-party editorial context');
  expect(sitemap.includes('url: `${SITE_ORIGIN}/date/${monthDay}`'),'Sitemap must expose editorial evergreen month-day pages');
  expect(!sitemap.includes('url: `${SITE_ORIGIN}/day/${item.dateISO}`'),'Thin dated utility pages must not be emitted in the sitemap');

  const profile=text('app/components/SaintProfile.tsx');
  expect(profile.includes('editorialReady?<AdSlot slot={ADSENSE_TOP_SLOT} placement="top"/>'),'Rich profiles need an editorial-quality-guarded top banner');
  expect(profile.includes('isSaintBiographyIndexable'),'Rich profile ad eligibility must use the substantive editorial gate');
  expect(profile.includes('ADSENSE_SIDEBAR_SLOT'),'Rich profiles need a guarded desktop sidebar');
  expect(profile.includes('Conteúdo editorial SantosDia'),'Rich profiles must visibly identify first-party SantosDia editorial composition');
  expect(profile.includes('fontes institucionais indicadas abaixo'),'Editorial-origin copy must preserve visible source grounding');

  const today=text('app/components/TodayPanel.tsx');
  expect(today.includes('getAnnualDateEditorial'),'Today must reuse reviewed annual-date editorial instead of generating date filler');
  expect(today.includes('getSaintBiographyRecord') && today.includes('getSaintBiography'),'Today must reuse reviewed first-party saint profiles for contextual depth');
  expect(today.includes('editorial.observanceIds.some'),'Annual-date editorial must be relevant to an observance visible in the active user context');
  expect(today.includes('record?.summary[locale]') && today.includes('record.paragraphs[locale]'),'Today profile context must require direct reviewed copy in the active locale rather than silently injecting another language');
  expect(today.includes('annualEditorial ?') && today.includes(': profileEditorial ?'),'Today must prefer date-specific editorial context, fall back to a reviewed profile, and otherwise render no fabricated filler');
  expect(today.includes('href={`/date/${dateISO.slice(5)}`}'),'Today must link reviewed annual context to its stable evergreen date page');

  const home=text('app/page.tsx');
  expect(home.indexOf('<TodayPanel />') < home.indexOf('ADSENSE_TOP_SLOT} placement="top"'),'Homepage banner must follow the core Today experience');
  expect(home.includes('home-monetized-layout'),'Homepage must reserve a separate content/ad rail layout');
  expect(home.includes('has-ad-rail'),'Homepage must collapse the rail when advertising is inactive');
  expect(home.includes('SAINT_BIOGRAPHIES'),'Homepage must internally link substantive editorial profiles');
  expect(home.includes('../data/saint-biography-registry'),'Homepage must use the same composed biography registry as saint pages and sitemap');

  const privacy=text('app/components/AdvertisingPrivacyNotice.tsx');
  expect(privacy.includes('Google AdSense'),'Privacy disclosure must identify Google AdSense');
  expect(privacy.includes('tradição cristã escolhida'),'Portuguese disclosure must protect religious preference from targeting');

  const editorialPolicy=text('docs/editorial-content-policy.md');
  expect(editorialPolicy.includes('approved source → evidence capture → normalized facts → canonical knowledge → SantosDia editorial composition → public page'),'Editorial policy must preserve the source-to-first-party publication chain');
  expect(editorialPolicy.includes('Editing, translating or rearranging a third-party text alone is not sufficient'),'Editorial policy must prohibit relabelling light source transformations as first-party work');
  expect(editorialPolicy.includes('No external prose becomes public SantosDia prose merely because it was ingested, translated, shortened, reordered or lightly edited'),'Editorial policy must enforce independent first-party composition');
  expect(editorialPolicy.includes('Mass generation of indexable pages from thin templates is prohibited'),'Editorial policy must prohibit thin indexable page generation');

  const status=text('docs/monetization-status.md');
  expect(status.includes('AdSense site review status: **REMEDIATION_REQUIRED**'),'Operational monetization state must record the current remediation requirement');
  expect(status.includes('Policy finding: **low-value content**'),'Operational monetization state must record the low-value-content finding');
  expect(status.includes('`ads.txt` authorization status: **AUTHORIZED**'),'Authorized ads.txt state must remain documented');
  expect(status.includes('Ad serving in the application: **DISABLED**'),'Ad serving must remain documented as disabled while not approved');
  expect(status.includes('2026-08-15 17:04 WEST'),'Previous PREPARING observation must remain traceable');
  expect(status.includes('Auto ads remain off at initial activation'),'Initial monetization must remain manual-only');

  const agents=text('AGENTS.md');
  expect(agents.includes('While that file records AdSense as **not approved**'),'Development instructions must propagate the not-approved AdSense guardrail');
  expect(agents.includes('REMEDIATION_REQUIRED'),'Development instructions must recognize the remediation state');
  expect(agents.includes('NEXT_PUBLIC_ADSENSE_ENABLED=false'),'Development instructions must keep ad serving disabled while not approved');
  expect(agents.includes('no anchor ads') && agents.includes('vignette/interstitial'),'Development instructions must prohibit overlay ad formats');
  expect(agents.includes('docs/editorial-content-policy.md'),'Development instructions must enforce the first-party editorial boundary');

  const checklist=text('docs/adsense-activation-checklist.md');
  expect(checklist.includes('Keep **Auto ads OFF**'),'Activation checklist must keep initial serving manual-only');
  expect(checklist.includes('no anchor ads') && checklist.includes('no vignette/interstitial ads'),'Activation checklist must prohibit overlay ad formats');
  expect(checklist.includes('certified CMP'),'Activation checklist must require a certified CMP');
  expect(checklist.includes('Google Search Console'),'Activation checklist must include organic search verification');
  expect(checklist.includes('Current operational state — 2026-08-29'),'Activation checklist must expose the current AdSense remediation state');
  expect(checklist.includes('low-value content'),'Activation checklist must record the active AdSense rejection reason');
  expect(checklist.includes('first-party SantosDia composition'),'Activation checklist must require first-party editorial composition');
}

if(failures.length){
  console.error(`AdSense readiness audit failed with ${failures.length} issue(s):`);
  for(const failure of failures)console.error(`- ${failure}`);
  process.exit(1);
}
console.log('AdSense readiness audit passed: serving remains fail-closed, first-party editorial policy is enforced, thin dated pages are noindex, the sitemap is editorially gated, Today prefers reviewed date/profile context without fabricated filler, manual non-overlay placements remain constrained and privacy boundaries are intact.');
