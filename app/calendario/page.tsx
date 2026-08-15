import type { Metadata } from "next";
import CalendarExplorer from "../components/CalendarExplorer";
import TraditionFeeds from "../components/TraditionFeeds";
import { ui } from "../../lib/i18n";
import { requestPublicLocale } from "../../lib/request-public-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestPublicLocale();
  const copy = ui[locale];
  return {
    title: copy.calendarTitle,
    description: copy.calendarIntro,
    alternates: { canonical: "/calendar" },
  };
}

export default function CalendarPage() {
  return (
    <div className="page-stack">
      <CalendarExplorer />
      <TraditionFeeds />
    </div>
  );
}
