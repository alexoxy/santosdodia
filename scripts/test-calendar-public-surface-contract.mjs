import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function source(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requirePattern(text, pattern, label) {
  assert(pattern.test(text), `${label} no longer preserves the territorial calendar contract.`);
}

function occurrenceCount(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const [
  observancesRoute,
  todayRoute,
  todayModel,
  searchRoute,
  icalRoute,
  todayPanel,
  dayPage,
  dayView,
  calendarPage,
  calendarProgressive,
  calendarExplorer,
  searchExplorer,
  syncCenter,
  calendarReadiness,
  productionRequestText,
] = await Promise.all([
  source('app/api/v1/observances/route.ts'),
  source('app/api/v1/today/route.ts'),
  source('lib/public-today.ts'),
  source('app/api/v1/search/route.ts'),
  source('app/api/ical/[feed]/route.ts'),
  source('app/components/TodayPanel.tsx'),
  source('app/day/[date]/page.tsx'),
  source('app/components/DayView.tsx'),
  source('app/calendar/page.tsx'),
  source('app/components/CalendarExplorerProgressive.tsx'),
  source('app/components/CalendarExplorer.tsx'),
  source('app/components/SearchExplorer.tsx'),
  source('app/components/CalendarSyncCenter.tsx'),
  source('lib/calendar-publication-readiness.ts'),
  source('data/releases/roman-catholic-pt-2026-v2.production-request.json'),
]);

// API / JSON surfaces must accept the country scope and carry it to the
// publication-safe D1 read model rather than rebuilding a shadow calendar.
requirePattern(observancesRoute, /country:\s*p\.get\("country"\)\s*\?\?\s*undefined/, 'Observances API');
requirePattern(observancesRoute, /mergePublishedCalendarRange\(curated,\s*\{[\s\S]*?fromDate,[\s\S]*?toDate,[\s\S]*?locale,[\s\S]*?filters,[\s\S]*?\}\)/, 'Observances API canonical runtime');

requirePattern(todayRoute, /country:\s*params\.get\("country"\)\s*\?\?\s*undefined/, 'Today API');
requirePattern(todayRoute, /buildPublicToday\(\{[\s\S]*?date,[\s\S]*?locale,[\s\S]*?filters,[\s\S]*?\}\)/, 'Today API shared public projection');
requirePattern(todayModel, /mergePublishedCalendarRange\(curated,\s*\{[\s\S]*?fromDate:\s*options\.date,[\s\S]*?toDate:\s*options\.date,[\s\S]*?locale:\s*options\.locale,[\s\S]*?filters,[\s\S]*?\}\)/, 'Today canonical runtime');
requirePattern(todayModel, /from ['"]\.\.\/data\/date-editorial-registry['"]/, 'Today complete editorial registry');

requirePattern(searchRoute, /country:p\.get\("country"\)\?\?undefined/, 'Search API');
requirePattern(searchRoute, /mergePublishedCalendarRange\(curated,\{fromDate:`\$\{year\}-01-01`,toDate:`\$\{year\}-12-31`,locale,filters,includeCalculatedTemporale:Boolean\(q\.trim\(\)\)\}\)/, 'Search API canonical runtime');

// ICS must use the same country filter and the same canonical runtime as JSON.
requirePattern(icalRoute, /country=query\.get\("country"\)\?\?undefined/, 'ICS feed');
requirePattern(icalRoute, /mergePublishedCalendarRange\(curated,\{fromDate:`\$\{year\}-01-01`,toDate:`\$\{year\}-12-31`,locale,filters\}\)/, 'ICS canonical runtime');

// The server-rendered calendar must use the same canonical runtime as dated
// pages and machine surfaces rather than rebuilding a separate month view.
requirePattern(calendarPage, /await\s+mergePublishedCalendarRange\(curated,\s*\{[\s\S]*?fromDate,[\s\S]*?toDate,[\s\S]*?locale,[\s\S]*?filters,[\s\S]*?\}\)/, 'Calendar SSR canonical runtime');
requirePattern(calendarPage, /<CalendarExplorerProgressive[\s\S]*?initialItems=\{items\}[\s\S]*?initialYear=\{year\}[\s\S]*?initialMonth=\{month\}[\s\S]*?initialLocale=\{locale\}/, 'Calendar SSR hydration seed');
requirePattern(calendarProgressive, /<CalendarExplorer[\s\S]*?initialItems=\{initialItems\}[\s\S]*?initialYear=\{initialYear\}[\s\S]*?initialMonth=\{initialMonth\}/, 'Calendar progressive hydration handoff');

// User-facing surfaces must preserve the territorial selection when they call
// those endpoints. GLOBAL intentionally omits country so the D1 read-model
// guard resolves only the General/Global calendar.
requirePattern(todayPanel, /if \(calendarCountry\) params\.set\("country", calendarCountry\);/, 'Today panel');
requirePattern(todayPanel, /calendarVersion:\s*PUBLIC_CALENDAR_RUNTIME_VERSION/, 'Today edge-cache version');
requirePattern(calendarExplorer, /calendarVersion:\s*PUBLIC_CALENDAR_RUNTIME_VERSION/, 'Calendar explorer edge-cache version');
requirePattern(calendarExplorer, /addCalculatedRomanTemporaleFallback\(curated,\s*\{[\s\S]*?fromDate:[\s\S]*?toDate:[\s\S]*?locale,[\s\S]*?filters,[\s\S]*?\}\)\.items/, 'Calendar local Roman fallback');
requirePattern(calendarExplorer, /initialContextMatches[\s\S]*?initialItems\.length\s*\?\s*initialItems\s*:\s*fallback/, 'Calendar canonical hydration baseline');
requirePattern(calendarExplorer, /payload\.data\.length\s*\|\|\s*baseline\.length\s*===\s*0\s*\?\s*payload\.data\s*:\s*baseline/, 'Calendar empty-runtime protection');
requirePattern(calendarReadiness, /!tradition\s*\|\|\s*tradition\s*===\s*'all'\s*\|\|\s*tradition\s*===\s*'roman-catholic'/, 'Ready aggregate calendar');
requirePattern(searchExplorer, /if \(calendarCountry\) params\.set\("country", calendarCountry\);/, 'Search explorer');
requirePattern(dayView, /if \(calendarCountry\) params\.set\("country", calendarCountry\);/, 'Day view');
requirePattern(dayView, /calendarVersion:\s*PUBLIC_CALENDAR_RUNTIME_VERSION/, 'Day edge-cache version');
requirePattern(dayPage, /loadPublicDay\(date, locale, tradition, country\)/, 'Day page server projection');
assert(
  occurrenceCount(calendarExplorer, /params\.set\("country", region\)/g) >= 1 &&
    occurrenceCount(calendarExplorer, /feedParams\.set\("country", region\)/g) >= 1,
  'Calendar explorer no longer keeps the same territorial scope in JSON and ICS.',
);
assert(
  occurrenceCount(syncCenter, /params\.set\('country',selectedCountry\)/g) >= 2,
  'Calendar Sync no longer keeps the same territorial scope in subscription and JSON URLs.',
);

// Structural guardrail: each canonical public surface remains connected to the
// shared publication runtime/read model. This prevents a future feature from
// quietly reintroducing a separate Portugal dataset for one surface.
assert(
  [observancesRoute, todayModel, searchRoute, icalRoute, calendarPage].every(text => text.includes('mergePublishedCalendarRange')),
  'A canonical calendar surface has diverged from the shared runtime.',
);
assert(
  dayPage.includes('buildPublicToday') && dayView.includes('/api/v1/today'),
  'The dated page must keep SSR, JSON-LD and client refresh on the shared Today projection.',
);
assert(
  dayPage.includes('initialEditorial={editorial}') && dayView.includes('setEditorial'),
  'The dated page must keep reviewed Today editorial attached to the same daily projection.',
);

// Semantic guardrail: the public surfaces above all resolve through the same
// canonical runtime, so the reviewed Portugal production release is the pinned
// source of truth for high-value territorial/transfer sentinels. A future
// refactor must explicitly update reviewed evidence rather than silently move a
// feast or replace a jurisdictional occurrence with the General calendar date.
const productionRequest = JSON.parse(productionRequestText);
const portugalSentinels = {
  'rc:Epiphany': '2026-01-04',
  'rc-pt:TuesdayAfterEpiphany': '2026-01-06',
  'rc-pt:FiveWoundsLord': '2026-02-07',
  'rc:StMatthias': '2026-05-14',
  'rc:Ascension': '2026-05-17',
  'rc:ImmaculateHeart': '2026-06-15',
};
assert(productionRequest.releaseId === 'roman-catholic-pt-2026-v2', 'Portugal semantic sentinels are no longer tied to the reviewed v2 release.');
assert(productionRequest.approved === true, 'Portugal semantic sentinel release is no longer explicitly approved.');
assert(productionRequest.expected?.occurrences === 389 && productionRequest.expected?.days === 365, 'Portugal semantic sentinel release lost its reviewed 389/365 coverage contract.');
for (const [canonicalEventId, expectedDateISO] of Object.entries(portugalSentinels)) {
  assert(
    productionRequest.semanticChecks?.[canonicalEventId] === expectedDateISO,
    `Portugal semantic sentinel drift: ${canonicalEventId} must remain ${expectedDateISO}.`,
  );
}
assert(
  Object.keys(productionRequest.semanticChecks ?? {}).length === Object.keys(portugalSentinels).length,
  'Portugal semantic sentinel set changed without an explicit reviewed contract update.',
);

console.log('Calendar public-surface contract passed: Today, dated pages, Calendar SSR, Search, Sync/API and ICS share the canonical runtime; canonical month items survive progressive hydration and Portugal semantic sentinels remain pinned.');
