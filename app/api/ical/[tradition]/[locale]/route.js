import { getLocaleDefinition, getMessages } from '../../../../../lib/i18n';
import { createCalendar } from '../../../../../lib/ics';
import { getAllSaints, getSaintsForDate, TRADITIONS } from '../../../../../lib/saints';

export const dynamic = 'force-dynamic';

function resolveTitle(dictionary, saints, tradition) {
  if (tradition === 'all') {
    return dictionary.calendar.all;
  }

  if (saints.length === 0) {
    return dictionary.calendar.byTradition;
  }

  return `${dictionary.calendar.byTradition}: ${saints[0].traditionLabel}`;
}

export async function GET(request, { params }) {
  const { tradition, locale: localeParam } = await params;
  const localeInfo = getLocaleDefinition(localeParam);
  const locale = localeInfo.code;
  const dictionary = getMessages(locale);
  if (tradition !== 'all' && !TRADITIONS[tradition]) {
    return new Response('Tradição desconhecida.', { status: 400 });
  }
  const url = new URL(request.url);
  const dateFilter = url.searchParams.get('date');
  const format = (url.searchParams.get('format') || 'ics').toLowerCase();

  let saints = [];
  if (dateFilter) {
    const records = await getSaintsForDate(dateFilter, locale);
    saints = tradition === 'all' ? records : records.filter((record) => record.tradition === tradition);
  } else {
    const records = await getAllSaints(locale);
    saints = tradition === 'all' ? records : records.filter((record) => record.tradition === tradition);
  }

  if (saints.length === 0) {
    return new Response('Sem dados disponíveis para o calendário solicitado.', { status: 404 });
  }

  const events = saints.map((saint, index) => ({
    date: saint.date,
    summary: saint.name,
    description: saint.bio,
    tradition: saint.tradition,
    uid: `${saint.slug || `${saint.tradition}-${index}`}-${saint.date}`,
    url: `${request.nextUrl.origin}/${locale}/santo/${saint.slug}`
  }));

  if (format === 'json') {
    return Response.json({
      title: resolveTitle(dictionary, saints, tradition),
      locale,
      events
    });
  }

  const calendar = createCalendar({
    title: resolveTitle(dictionary, saints, tradition),
    description: dictionary.siteSubtitle,
    locale,
    events,
    url: `${request.nextUrl.origin}/${locale}`
  });

  return new Response(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="santos-${tradition}-${locale}.ics"`
    }
  });
}
