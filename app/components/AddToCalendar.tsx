'use client';

type Props = {
  /** Caminho do feed ICS, ex.: "/api/ical/all" */
  feedPath: string;
  /** Nome/descrição para a subscrição */
  title?: string;
  /** Para evento único (página do dia): "YYYY-MM-DD" */
  dateISO?: string;
};

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const env = (process as any)?.env?.NEXT_PUBLIC_SITE_URL;
  return typeof env === 'string' && env.length > 0 ? env : 'https://santosdodia.com';
}

function buildAbsoluteUrl(path: string, origin: string): string {
  try {
    // garante URL absoluta mesmo que feedPath seja relativo
    return new URL(path, origin).toString();
  } catch {
    return origin.replace(/\/$/, '') + path;
  }
}

function googleEventLink(dateISO: string, title: string): string {
  // Evento de dia inteiro no Google Calendar
  const parts = dateISO.split('-').map((n) => parseInt(n, 10));
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  const start = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
  const endDate = new Date(Date.UTC(y, m - 1, d + 1));
  const end = `${endDate.get
