import { NextRequest } from 'next/server';
import {
  mergeObservances,
  parseCategory,
  parseTradition,
  searchObservances
} from '../../../../data/observances';
import { normalizeLocale } from '../../../../lib/i18n';
import { getLiveObservances } from '../../../../lib/live-sources';

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const q = p.get('q') ?? '';
  const locale = normalizeLocale(p.get('locale') ?? request.headers.get('accept-language'));
  const year = Number(p.get('year') ?? new Date().getUTCFullYear());
  const live = p.get('live') !== '0';
  const filters = {
    tradition: parseTradition(p.get('tradition')),
    category: parseCategory(p.get('category')),
    country: p.get('country') ?? undefined,
    patronage: p.get('patronage') ?? undefined
  };
  const curated = searchObservances(q, year, locale, filters);
  const imported = live
    ? await getLiveObservances(year, locale, filters)
    : { data: [], sourceHealth: [] };
  const needle = q.trim().toLocaleLowerCase(locale);
  const matchingLive = imported.data.filter(item => !needle || [
    item.name,
    ...Object.values(item.names),
    item.summary ?? '',
    ...(item.patronages ?? []),
    ...(item.countries ?? []),
    ...item.traditions,
    item.category
  ].join(' ').toLocaleLowerCase(locale).includes(needle));
  const data = mergeObservances(curated, matchingLive).slice(0, 200);
  return Response.json(
    { data, meta: { query: q, locale, year, count: data.length, filters, live, sourceHealth: imported.sourceHealth } },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600', 'Access-Control-Allow-Origin': '*' } }
  );
}
