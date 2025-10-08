'use client';

type Props = {
  /** caminho do feed ICS, ex.: "/api/ical/all" ou "/api/ical/catolica" */
  feedPath: string;
  /** título opcional para subscrição/nome do calendário */
  title?: string;
  /** para evento único (ex.: página /dia/AAAA-MM-DD): "YYYY-MM-DD" */
  dateISO?: string;
};

function getOrigin() {
  if (typeof window !== 'undefined') return window.location.origin;
  // fallback para builds server-side, define (opcional) na Vercel:
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://santosdodia.com';
}

function googleEventLink(dateISO: string, title: string) {
  // Evento de dia inteiro no Google Calendar
  const [y, m, d] = dateISO.split('-').map(Number);
  const start = `${y}${String(m).padStart(2,'0')}${String(d).padStart(2,'0')}`;
  const endDate = new Date(Date.UTC(y, m-1, d+1));
  const end = `${endDate.getUTCFullYear()}${String(endDate.getUTCMonth()+1).padStart(2,'0')}${String(endDate.getUTCDate()).padStart(2,'0')}`;
  const text = encodeURIComponent(title);
  const details = encodeURIComponent('santosdodia.com');
  return `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${start}/${end}&text=${text}&details=${details}`;
}

function outlookEventLink(dateISO: string, title: string) {
  // Deeplink para Outlook.com evento único (all-day)
  const start = dateISO;
  // end igual ao start para all-day; Outlook interpreta como dia inteiro
  const subject = encodeURIComponent(title);
  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&allday=true&startdt=${start}&enddt=${start}&subject=${subject}`;
}

export default function AddToCalendar({ feedPath, title = 'Santos do Dia', dateISO }: Props) {
  const origin = getOrigin();
  const httpsUrl = `${origin}${feedPath}`;
  const webcalUrl = httpsUrl.replace(/^https?:/, 'webcal:');

  // Subscrições (recomendado para ter sempre atualizações)
  const googleSubscribe = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(httpsUrl)}`;
  const outlookSubscribe = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent(title)}`;
  const office365Subscribe = `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent(title)}`;

  // Eventos únicos (para páginas /dia/AAAA-MM-DD)
  const googleEvent = dateISO ? googleEventLink(dateISO, title) : undefined;
  const outlookEvent = dateISO ? outlookEventLink(dateISO, title) : undefined;

  return (
    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
      {/* Subscrições (preferível) */}
      <a className="btn btn-primary" href={httpsUrl}>Download .ICS</a>
      <a className="btn btn-accent" href={webcalUrl}>Apple (webcal)</a>
      <a className="btn btn-ghost" href={googleSubscribe}>Google (assinar)</a>
      <a className="btn btn-ghost" href={outlookSubscribe}>Outlook.com (assinar)</a>
      <a className="btn btn-ghost" href={office365Subscribe}>Office 365 (assinar)</a>

      {/* Eventos únicos (opcional, quando dateISO existir) */}
      {googleEvent && <a className="btn btn-ghost" href={googleEvent} target="_blank" rel="noreferrer">+ Google (evento)</a>}
      {outlookEvent && <a className="btn btn-ghost" href={outlookEvent} tar
