// app/api/ical/[feed]/route.ts
import type { NextRequest } from 'next/server';

function pad(n: number) { return String(n).padStart(2, '0'); }
function ymd(d: Date) { return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`; }
function nextDay(d: Date) {
  const n = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  return ymd(n);
}

// Next.js 15: context.params é uma Promise<{ feed: string }>
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ feed: string }> }
): Promise<Response> {
  const { feed = 'all' } = await context.params;

  const today = new Date();
  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//santosdodia.com//Calendario//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:demo-${feed}-${ymd(today)}@santosdodia.com
DTSTART;VALUE=DATE:${ymd(today)}
DTEND;VALUE=DATE:${nextDay(today)}
RRULE:FREQ=YEARLY
SUMMARY:Santos do Dia (exemplo)
CATEGORIES:Santo
SEQUENCE:1
END:VEVENT
END:VCALENDAR`;

  return new Response(ics, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
  });
}
