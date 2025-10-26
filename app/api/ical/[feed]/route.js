import { availableFeeds, getAllFeasts } from '@/data/feasts.js';

function toIcsDate(dateISO) {
  return dateISO.replace(/-/g, '');
}

function nextDateISO(dateISO) {
  const d = new Date(`${dateISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function escapeText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function buildCalendar(feedKey, year) {
  const tradition = availableFeeds[feedKey];
  const feasts = getAllFeasts(year, tradition);
  const label =
    feedKey === 'all'
      ? 'Santos do Dia — calendário combinado'
      : tradition === 'catolica'
      ? 'Santos do Dia — tradição católica'
      : 'Santos do Dia — tradição ortodoxa';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//santosdodia.com//Calendario//PT',
    `NAME:${escapeText(label)}`,
    `X-WR-CALNAME:${escapeText(label)}`,
    `X-WR-CALDESC:${escapeText(label)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const feast of feasts) {
    const start = toIcsDate(feast.dateISO);
    const end = toIcsDate(nextDateISO(feast.dateISO));
    const title = escapeText(feast.name);
    const descriptionParts = [
      feast.tradition === 'catolica' ? 'Tradição católica' : 'Tradição ortodoxa',
      feast.notes ? `Notas: ${feast.notes}` : undefined
    ].filter((value) => typeof value === 'string' && value.length > 0);
    const description = escapeText(descriptionParts.join('\n'));

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${feast.id}@santosdodia.com`);
    lines.push(`DTSTAMP:${start}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${start}`);
    lines.push(`DTEND;VALUE=DATE:${end}`);
    lines.push('RRULE:FREQ=YEARLY');
    lines.push(`SUMMARY:${title}`);
    if (description) {
      lines.push(`DESCRIPTION:${description}`);
    }
    lines.push('CATEGORIES:Santo');
    lines.push('END:VEVENT');
  }

  if (feasts.length === 0) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${feedKey}-placeholder@santosdodia.com`);
    lines.push(`DTSTAMP:${year}0101T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${year}0101`);
    lines.push(`DTEND;VALUE=DATE:${year}0102`);
    lines.push('SUMMARY:Santos do Dia');
    lines.push('DESCRIPTION:Ainda não existem festas registadas neste calendário.');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export async function GET(_req, context) {
  const { feed = 'all' } = await context.params;
  const candidate = (feed.toLowerCase() || 'all');

  if (!Object.prototype.hasOwnProperty.call(availableFeeds, candidate)) {
    return new Response('Feed não encontrado', { status: 404 });
  }

  const year = new Date().getUTCFullYear();
  const calendar = buildCalendar(candidate, year);

  return new Response(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
