import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const route = fs.readFileSync(path.join(root, 'app/api/ical/[feed]/route.ts'), 'utf8');
const sync = fs.readFileSync(path.join(root, 'app/components/CalendarSyncCenter.tsx'), 'utf8');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'config/product-platform-contract.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(route.includes('rollingCivilYearWindowForUtcInstant()'), 'Rolling ICS route must use the shared Y-1..Y+3 window when year is omitted.');
assert(route.includes('explicitYear?[explicitYear]:rollingCivilYearWindowForUtcInstant()'), 'Explicit year must remain a one-year snapshot.');
assert(route.includes('X-SANTOSDIA-FEED-MODE:${explicitYear?"snapshot":"rolling"}'), 'ICS must identify rolling versus snapshot mode.');
assert(route.includes('X-SANTOSDIA-YEARS:${years.join(",")}'), 'ICS must expose its materialised year window.');
assert(route.includes('URL:${SITE_ORIGIN}/day/${item.dateISO}'), 'Every ICS event must retain a canonical SantosDia backlink.');
assert(route.includes('REFRESH-INTERVAL;VALUE=DURATION:PT6H'), 'Rolling ICS must retain a six-hour refresh hint.');
assert(route.includes('s-maxage=21600'), 'Cloudflare cache TTL must match the six-hour refresh policy.');
assert(!route.includes('[currentYear,currentYear+1]'), 'Legacy two-year rolling feed must not return.');

assert(sync.includes('rollingCivilYearWindow(currentYear)'), 'Calendar Sync UI must reuse the shared rolling year window.');
assert(sync.includes('janela móvel de cinco anos'), 'Portuguese sync copy must explain the five-year rolling subscription.');
assert(!sync.includes('serve o ano atual e o seguinte'), 'Portuguese legacy two-year copy must be removed.');
assert(!sync.includes('serves the current and following year'), 'English legacy two-year copy must be removed.');

assert(contract.rollingMaterialization?.pastCivilYears === 1, 'Product contract must retain one past civil year.');
assert(contract.rollingMaterialization?.futureCivilYears === 3, 'Product contract must retain three future civil years.');
assert(contract.retentionAndDistribution?.ics?.rollingSubscriptionHasNoExplicitYear === true, 'No-year ICS must remain the persistent subscription contract.');
assert(contract.retentionAndDistribution?.ics?.annualSnapshotRequiresExplicitYear === true, 'Explicit-year ICS must remain the snapshot contract.');

console.log('Rolling ICS surface guard passed: Y-1..Y+3 subscription, explicit-year snapshot, backlinks and Cloudflare cache policy are aligned.');
