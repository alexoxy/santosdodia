'use client';

type Props = {
  feedPath: string;   // Ex.: "/api/ical/all"
  title?: string;     // Nome do calendário (subscrição)
  dateISO?: string;   // Para evento único: "YYYY-MM-DD"
};

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const env = (process as any)?.env?.NEXT_PUBLIC_SITE_URL;
  if (typeof env === 'string' && env.length > 0) return env;
  return 'https://santosdodia.com';
}

function buildAbsoluteUrl(path: string, origin: string): string {
  try {
    return new URL(path, origin).toString();
  } catch {
    return origin.replace(/\/$/, '') + path;
  }
}

function googleEventLink(dateISO: string, title: string): string {
  const parts = dateISO.split('-').map((n) => parseInt(n, 10));
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  const start = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
  const endDate = new Date(Date.UTC(y, m - 1, d + 1));
  const end = `${endDate.getUTCFullYear()}${String(endDate.getUTCMonth() + 1).padStart(2, '0')}${String(endDate.getUTCDate()).padStart(2, '0')}`;
  const text = encodeURIComponent(title);
  const details = encodeURIComponent('santosdodia.com');
  return `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${start}/${end}&text=${text}&details=${details}`;
}

function outlookEventLink(dateISO: string, title: string): string {
  const subject = encodeURIComponent(title);
  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&allday=true&startdt=${dateISO}&enddt=${dateISO}&subject=${subject}`;
}

export default function AddToCalendar(props: Props) {
  const title = props.title ? String(props.title) : 'Santos do Dia';
  const origin = getOrigin();
  const httpsUrl = buildAbsoluteUrl(props.feedPath, origin);
  const webcalUrl = httpsUrl.replace(/^https?:/, 'webcal:');

  const googleSubscribe = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(httpsUrl)}`;
  const outlookSubscribe = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent(title)}`;
  const office365Subscribe = `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent(title)}`;

  let googleEvent: string | null = null;
  let outlookEvent: string | null = null;

  if (props.dateISO && /^\d{4}-\d{2}-\d{2}$/.test(props.dateISO)) {
    googleEvent = googleEventLink(props.dateISO, title);
    outlookEvent = outlookEventLink(props.dateISO, title);
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <a className="btn btn-primary" href={httpsUrl}>Download .ICS</a>
      <a className="btn btn-accent" href={webcalUrl}>Apple (webcal)</a>
      <a className="btn btn-ghost" href={googleSubscribe} target="_blank" rel="noreferrer">Google (assinar)</a>
      <a className="btn btn-ghost" href={outlookSubscribe} target="_blank" rel="noreferrer">Outlook.com (assinar)</a>
      <a className="btn btn-ghost" href={office365Subscribe} target="_blank" rel="noreferrer">Office 365 (assinar)</a>
      {googleEvent ? (
        <a className="btn btn-ghost" href={googleEvent} target="_blank" rel="noreferrer">+ Google (evento)</a>
      ) : null}
      {outlookEvent ? (
        <a className="btn btn-ghost" href={outlookEvent} target="_blank" rel="noreferrer">+ Outlook (evento)</a>
      ) : null}
    </div>
  );
}
