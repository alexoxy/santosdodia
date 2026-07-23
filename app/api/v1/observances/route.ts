import { NextRequest } from 'next/server';
import {
  getAllObservances,
  getMonthlyObservances,
  getObservancesForDate,
  mergeObservances,
  parseCategory,
  parseTradition
} from '../../../../data/observances';
import { normalizeLocale } from '../../../../lib/i18n';
import { displayObservanceName, displayPatronages } from '../../../../lib/locale-display';
import { getLiveObservances } from '../../../../lib/live-sources';

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const locale = normalizeLocale(p.get('locale') ?? request.headers.get('accept-language'));
  const now = new Date();
  const year = Number(p.get('year') ?? now.getUTCFullYear());
  const month = p.has('month') ? Number(p.get('month')) : undefined;
  const date = p.get('date') ?? undefined;
  const live = p.get('live') !== '0';
  const filters = {
    tradition: parseTradition(p.get('tradition')),
    category: parseCategory(p.get('category')),
    country: p.get('country') ?? undefined,
    patronage: p.get('patronage') ?? undefined
  };

  if (!Number.isInteger(year) || year < 1900 || year > 2200) return Response.json({ error: 'Invalid year.' }, { status: 400 });
  if (month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12)) return Response.json({ error: 'Invalid month.' }, { status: 400 });

  const curated = date
    ? getObservancesForDate(date, locale, filters)
    : month
      ? getMonthlyObservances(year, month - 1, locale, filters)
      : getAllObservances(year, locale, filters);

  const imported = live
    ? await getLiveObservances(year, locale, filters, { month, date })
    : { data: [], sourceHealth: [] };

  const merged = mergeObservances(curated, imported.data);
  const data = merged.map(item => ({
    ...item,
    originalName: item.name,
    name: displayObservanceName(item.names, locale, item.name),
    summary: item.summaries?.[locale],
    patronages: displayPatronages(item.patronages, locale)
  })).filter(item => Boolean(item.name));
  const withheld = merged.length - data.length;

  return Response.json({
    data,
    meta: { year, month, date, locale, count: data.length, withheldForTranslation: withheld, filters, live, sourceHealth: imported.sourceHealth, generatedAt: new Date().toISOString() }
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400', 'Access-Control-Allow-Origin': '*' }
  });
}
