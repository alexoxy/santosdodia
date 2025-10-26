import DailyHighlight from '../../components/DailyHighlight';
import DailySaints from '../../components/DailySaints';
import CalendarExportLinks from '../../components/CalendarExportLinks';
import TraditionLegend from '../../components/TraditionLegend';
import UpcomingSaints from '../../components/UpcomingSaints';
import { getLocaleDefinition, getMessages } from '../../lib/i18n';
import { getSaintsForDate, getUpcomingSaints } from '../../lib/saints';

export const dynamic = 'force-dynamic';

function pickHighlight(today) {
  if (!today || today.length === 0) {
    return null;
  }

  const catholic = today.find((saint) => saint.tradition === 'catholicism');
  return catholic || today[0];
}

export default async function LocaleHome({ params }) {
  const { locale: localeParam } = await params;
  const localeInfo = getLocaleDefinition(localeParam);
  const locale = localeInfo.code;
  const messages = getMessages(locale);

  const today = await getSaintsForDate(new Date(), locale);
  const highlight = pickHighlight(today);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const upcoming = await getUpcomingSaints({ locale, from: tomorrow, days: 6 });

  return (
    <div className="page-grid">
      <DailySaints
        heading={messages.todayHeading}
        saints={today}
        sourcesLabel={messages.sourcesLabel}
        emptyMessage={messages.noSaintsToday}
      />
      <DailyHighlight
        heading={messages.highlightHeading}
        sourceNote={messages.highlightSource}
        sourcesLabel={messages.sourcesLabel}
        saint={highlight}
      />
      <CalendarExportLinks
        locale={locale}
        heading={messages.calendarExportsHeading}
        allLabel={messages.calendar.all}
        byTraditionLabel={messages.calendar.byTradition}
        byLanguageLabel={messages.calendar.byLanguage}
        downloadLabel={messages.calendar.download}
      />
      <TraditionLegend locale={locale} title={messages.legendHeading} />
      <UpcomingSaints entries={upcoming} heading={messages.upcomingHeading} sourcesLabel={messages.sourcesLabel} />
    </div>
  );
}
