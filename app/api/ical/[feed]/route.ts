function pad(n:number){return String(n).padStart(2,'0');}
function ymd(d:Date){return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}`;}
function next(d:Date){const n=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+1));return ymd(n);}

export async function GET(req: Request, { params }: { params: { feed: string } }) {
  const feed = params.feed || 'all';
  const today = new Date();
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//santosdodia.com//Calendario//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    [
      'BEGIN:VEVENT',
      `UID:demo-${feed}-${ymd(today)}@santosdodia.com`,
      `DTSTART;VALUE=DATE:${ymd(today)}`,
      `DTEND;VALUE=DATE:${next(today)}`,
      'RRULE:FREQ=YEARLY',
      'SUMMARY:Santos do Dia (exemplo)',
      'CATEGORIES:Santo',
      'SEQUENCE:1',
      'END:VEVENT',
    ].join('\\n'),
    'END:VCALENDAR'
  ].join('\\n');

  return new Response(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' }});
}
