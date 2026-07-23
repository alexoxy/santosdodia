'use client';
import { SITE_ORIGIN } from '../../lib/site';
import { useLanguage } from './LanguageProvider';

function origin() {
  return typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || SITE_ORIGIN;
}
function nextDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function AddToCalendar({ feedPath, title = 'Santos do Dia', dateISO }: { feedPath: string; title?: string; dateISO?: string }) {
  const { copy } = useLanguage();
  const url = new URL(feedPath, origin()).toString();
  const webcal = url.replace(/^https?:/, 'webcal:');
  let google = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(url)}`;
  let outlook = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(url)}&name=${encodeURIComponent(title)}`;
  if (dateISO && /^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    const end = nextDate(dateISO);
    google = `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${dateISO.replaceAll('-', '')}/${end.replaceAll('-', '')}&text=${encodeURIComponent(title)}&details=${encodeURIComponent(SITE_ORIGIN)}`;
    outlook = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&allday=true&startdt=${dateISO}&enddt=${end}&subject=${encodeURIComponent(title)}`;
  }
  return <div className="button-row"><a className="btn btn-primary" href={url}>{copy.downloadIcs}</a><a className="btn btn-secondary" href={webcal}>{copy.apple}</a><a className="btn btn-secondary" href={google} target="_blank" rel="noreferrer">{copy.google}</a><a className="btn btn-secondary" href={outlook} target="_blank" rel="noreferrer">{copy.outlook}</a></div>;
}
