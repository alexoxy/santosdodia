import type { Metadata } from 'next';
import CalendarProductNav from '../../components/CalendarProductNav';
import { requestPublicLocale } from '../../../lib/request-public-locale';
import { SITE_ORIGIN } from '../../../lib/site';
import {
  calculateRomanLiturgicalYear,
  romanDateContext,
  romanPolicyForJurisdiction
} from '../../../lib/knowledge/roman-liturgical-year';
import {
  liturgicalToolCopy,
  localizeRomanPrincipalDay,
  localizeRomanSeason,
  normalizeLiturgicalToolLocale,
  type LiturgicalToolLocale
} from '../../../lib/knowledge/liturgical-calendar-localization';
import {
  localizeRomanVestmentColourResolution,
  romanVestmentColourCopy,
  romanVestmentColourGuide
} from '../../../lib/knowledge/roman-vestment-colour-localization';
import { romanVestmentColoursForDateContext } from '../../../lib/knowledge/roman-vestment-colours';

const localeTags: Record<LiturgicalToolLocale, string> = { en: 'en-GB', pt: 'pt-PT', es: 'es-ES', it: 'it-IT' };

function formatDate(value: string, locale: LiturgicalToolLocale) {
  return new Intl.DateTimeFormat(localeTags[locale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export async function generateMetadata(): Promise<Metadata> {
  const requestLocale = normalizeLiturgicalToolLocale(await requestPublicLocale());
  const copy = liturgicalToolCopy(requestLocale);
  return {
    title: copy.title,
    description: copy.intro,
    alternates: { canonical: '/tools/liturgical-calendar' }
  };
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LiturgicalCalendarToolPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedLocale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const locale = normalizeLiturgicalToolLocale(requestedLocale ?? await requestPublicLocale());
  const copy = liturgicalToolCopy(locale);
  const colourCopy = romanVestmentColourCopy(locale);
  const colourGuide = romanVestmentColourGuide(locale);
  const jurisdictionValue = Array.isArray(params.jurisdiction) ? params.jurisdiction[0] : params.jurisdiction;
  const jurisdiction = jurisdictionValue === 'GLOBAL' ? 'GLOBAL' : 'PT';
  const policy = romanPolicyForJurisdiction(jurisdiction);
  const rawYear = Array.isArray(params.year) ? params.year[0] : params.year;
  const parsedYear = Number(rawYear ?? new Date().getUTCFullYear());
  const year = Number.isInteger(parsedYear) && parsedYear >= 1584 && parsedYear <= 4099 ? parsedYear : new Date().getUTCFullYear();
  const rawDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const date = typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/u.test(rawDate) ? rawDate : '';
  const liturgicalYear = calculateRomanLiturgicalYear(year, policy);
  let context: ReturnType<typeof romanDateContext> | null = null;
  if (date) {
    try { context = romanDateContext(date, policy); } catch { context = null; }
  }
  const vestmentResolution = context ? romanVestmentColoursForDateContext(context) : null;
  const localizedVestmentResolution = vestmentResolution ? localizeRomanVestmentColourResolution(locale, vestmentResolution) : null;
  const apiPath = `/api/v1/liturgical-calendar?year=${year}&jurisdiction=${jurisdiction}&locale=${locale}${date ? `&date=${date}` : ''}`;
  const syncParams = new URLSearchParams({ tradition: 'roman-catholic' });
  const icsParams = new URLSearchParams({ locale });
  if (jurisdiction === 'PT') {
    syncParams.set('country', 'PT');
    icsParams.set('country', 'PT');
  }
  const syncPath = `/calendar/subscribe?${syncParams}`;
  const rollingIcsPath = `/api/ical/roman-catholic?${icsParams}`;
  const annualIcsPath = `${rollingIcsPath}&year=${year}`;

  return <div className="page-stack">
    <CalendarProductNav />
    <section className="page-hero compact-hero">
      <div>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </div>
      <div className="hero-symbol" aria-hidden="true">A/B/C</div>
    </section>

    <section className="source-list-section">
      <form method="get" className="filter-grid">
        <label>{copy.year}<input name="year" type="number" min="1584" max="4099" defaultValue={year} /></label>
        <label>{copy.date}<input name="date" type="date" defaultValue={date} /></label>
        <label>{copy.jurisdiction}<select name="jurisdiction" defaultValue={jurisdiction}><option value="PT">{copy.portugal}</option><option value="GLOBAL">{copy.general}</option></select></label>
        <label>{copy.language}<select name="locale" defaultValue={locale}><option value="pt">Português</option><option value="en">English</option><option value="es">Español</option><option value="it">Italiano</option></select></label>
        <button className="btn btn-primary" type="submit">{copy.calculate}</button>
      </form>
    </section>

    <section className="institutional-grid">
      <article className="institutional-card"><span className="eyebrow">{copy.year}</span><h2>{liturgicalYear.liturgicalYear}</h2><p>{formatDate(liturgicalYear.startDate, locale)} — {formatDate(liturgicalYear.endDate, locale)}</p></article>
      <article className="institutional-card"><span className="eyebrow">{copy.sundayCycle}</span><h2>{liturgicalYear.sundayCycle}</h2><p>{copy.cycleChangeNote}</p></article>
      {context ? <article className="institutional-card"><span className="eyebrow">{copy.weekdayCycle}</span><h2>{context.weekdayCycle}</h2><p>{context.date}</p></article> : null}
      {context ? <article className="institutional-card"><span className="eyebrow">{copy.season}</span><h2>{localizeRomanSeason(locale, context.season)}</h2><p>{context.seasonWeek === null ? '—' : `${copy.week} ${context.seasonWeek}`}</p></article> : null}
      {context ? <article className="institutional-card"><span className="eyebrow">{copy.principalDay}</span><h2>{context.principalDay ? localizeRomanPrincipalDay(locale, context.principalDay) : '—'}</h2><p>{context.principalDay ? formatDate(context.date, locale) : copy.noPrincipalDay}</p></article> : null}
      {localizedVestmentResolution ? <article className="institutional-card"><span className="eyebrow">{colourCopy.title}</span><h2>{localizedVestmentResolution.resolvedColourLabel ?? localizedVestmentResolution.defaultColourLabel ?? '—'}</h2><p>{colourCopy.defaultLabel}: {localizedVestmentResolution.defaultColourLabel ?? '—'}</p>{localizedVestmentResolution.permittedAlternativeColourLabels.length ? <p>{colourCopy.alternativesLabel}: {localizedVestmentResolution.permittedAlternativeColourLabels.join(', ')}</p> : null}{localizedVestmentResolution.note ? <small>{localizedVestmentResolution.note}</small> : null}</article> : null}
    </section>

    <section className="source-list-section">
      <div className="section-heading"><div><span className="eyebrow">{colourCopy.title}</span><h2>{colourCopy.title}</h2></div></div>
      <div className="institutional-grid">
        {colourGuide.map(entry => <article className="institutional-card" key={entry.code}><span className="eyebrow">{entry.code}</span><h3>{entry.label}</h3><p>{entry.usage}</p></article>)}
      </div>
      <p><small>{colourCopy.authorityNote}</small></p>
    </section>

    <section className="source-list-section">
      <div className="section-heading"><div><span className="eyebrow">{copy.keyDates}</span><h2>{copy.keyDates}</h2></div></div>
      <div className="institutional-grid">
        {Object.entries(liturgicalYear.keyDates).map(([key, value]) => <article className="institutional-card" key={key}><h3>{localizeRomanPrincipalDay(locale, key as keyof typeof liturgicalYear.keyDates)}</h3><p>{formatDate(value, locale)}</p><code>{value}</code></article>)}
      </div>
    </section>

    <section className="source-list-section">
      <div className="institutional-grid">
        <article className="institutional-card"><h2>{copy.method}</h2><p>{copy.methodBody}</p><p><strong>{policy.id}</strong> · {policy.calendarSystem}</p></article>
        <article className="institutional-card"><h2>{copy.subscribe}</h2><p>{copy.subscribeBody}</p><div className="button-row"><a className="btn btn-primary" href={syncPath}>{copy.subscribe}</a><a className="btn btn-secondary" href={annualIcsPath} download>{copy.annualIcs}</a></div></article>
        <article className="institutional-card"><h2>{copy.machine}</h2><p className="machine-url"><code>{SITE_ORIGIN}{apiPath}</code></p><a className="btn btn-secondary" href={apiPath} target="_blank" rel="noreferrer">JSON</a> <a className="btn btn-secondary" href="/openapi.json" target="_blank" rel="noreferrer">OpenAPI</a></article>
      </div>
    </section>
  </div>;
}
