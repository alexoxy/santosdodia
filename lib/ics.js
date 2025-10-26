function escapeText(value) {
  return (value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatDateKey(date) {
  const [year, month, day] = date.split('-');
  return `${year}${month}${day}`;
}

function addDays(date, amount = 1) {
  const [year, month, day] = date.split('-').map((part) => parseInt(part, 10));
  const utcDate = new Date(Date.UTC(year, month - 1, day + amount));
  return utcDate.toISOString().slice(0, 10);
}

function toUtcStamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function createCalendar({ title, description, locale, events, url }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SantosDoDia//Calendário Ecuménico//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(title)}`,
    `X-WR-CALDESC:${escapeText(description || '')}`,
    `X-WR-RELCALID:${escapeText(locale)}`
  ];

  const stamp = toUtcStamp();

  events.forEach((event, index) => {
    const start = formatDateKey(event.date);
    const uid = `${event.uid || `${event.tradition || 'all'}-${event.date}-${index}`}@santosdodia.pt`;
    const summary = escapeText(event.summary);
    const descriptionText = escapeText(event.description || '');
    const endDate = formatDateKey(addDays(event.date, 1));

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${start}`);
    lines.push(`DTEND;VALUE=DATE:${endDate}`);
    lines.push(`SUMMARY:${summary}`);
    if (descriptionText) {
      lines.push(`DESCRIPTION:${descriptionText}`);
    }
    if (event.url) {
      lines.push(`URL:${escapeText(event.url)}`);
    } else if (url) {
      lines.push(`URL:${escapeText(url)}`);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}
