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
  searchRoute,
  icalRoute,
  todayPanel,
  calendarExplorer,
  searchExplorer,
  syncCenter,
  productionRequestText,
] = await Promise.all([
  source('app/api/v1/observances/route.ts'),
  source('app/api/v1/today/route.ts'),
  source('app/api/v1/search/route.ts'),
  source('app/api/ical/[feed]/route.ts'),
  source('app/components/TodayPanel.tsx'),
  source('app/components/CalendarExplorer.tsx'),
  source('app/components/SearchExplorer.tsx'),
  source('app/components/CalendarSyncCenter.tsx'),
  source('data/releases/roman-catholic-pt-2026-v2.production-request.json'),
]);

// API / JSON surfaces must accept the country scope and carry it to the
// publication-safe D1 read model rather than rebuilding a shadow calendar.
requirePattern(observancesRoute, /country:\s*p\.get\("country"\)\s*\?\?\s*undefined/, 'Observances API');
requirePattern(observancesRoute, /countryCode:\s*filters\.country/, 'Observances API D1 read');
requirePattern(observancesRoute, /mode:\s*"public"/, 'Observances API publication mode');

requirePattern(todayRoute, /country:params\.get\("country"\)\?\?undefined/, 'Today API');
requirePattern(todayRoute, /mergePublishedCalendarRange\(curated,\{fromDate:date,toDate:date,locale,filters\}\)/, 'Today API canonical runtime');

requirePattern(searchRoute, /country:p\.get\("country"\)\?\?undefined/, 'Search API');
requirePattern(searchRoute, /mergePublishedCalendarRange\(curated,\{fromDate:`\$\{year\}-01-01`,toDate:`\$\{year\}-12-31`,locale,filters\}\)/, 'Search API canonical runtime');

// ICS must use the same country filter and the same canonical runtime as JSON.
requirePattern(icalRoute, /country=query\.get\("country"\)\?\?undefined/, 'ICS feed');
requirePattern(icalRoute, /mergePublishedCalendarRange\(curated,\{fromDate:`\$\{year\}-01-01`,toDate:`\$\{year\}-12-31`,locale,filters\}\)/, 'ICS canonical runtime');

// User-facing surfaces must preserve the territorial selection when they call
// those endpoints. GLOBAL intentionally omits country so the D1 read-model
// guard resolves only the General/Global calendar.
requirePattern(todayPanel, /if \(country\) params\.set\("country", country\);/, 'Today panel');
requirePattern(searchExplorer, /if \(country\) params\.set\("country", country\);/, 'Search explorer');
assert(
  occurrenceCount(calendarExplorer, /params\.set\("country", region\)/g) >= 1 &&
    occurrenceCount(calendarExplorer, /feedParams\.set\("country", region\)/g) >= 1,
  'Calendar explorer no longer keeps the same territorial scope in JSON and ICS.',
);
assert(
  occurrenceCount(syncCenter, /params\.set\('country',selectedCountry\)/g) >= 2,
  'Calendar Sync no longer keeps the same territorial scope in subscription and JSON URLs.',
);

// Structural guardrail: each machine surface remains connected to the shared
// canonical publication runtime/read model. This prevents a future feature from
// quietly reintroducing a separate Portugal dataset for one surface.
assert(
  [todayRoute, searchRoute, icalRoute].every(text => text.includes('mergePublishedCalendarRange')),
  'A calendar machine surface has diverged from the canonical runtime.',
);
assert(
  observancesRoute.includes('readCalendarOccurrences') && observancesRoute.includes('mergePublicCalendarObservances'),
  'Observances API has diverged from the publication-safe D1 adapter.',
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

console.log('Calendar public-surface contract passed: Today, Calendar, Search, Sync/API and ICS remain jurisdiction-consistent and preserve reviewed Portugal semantic sentinels.');
