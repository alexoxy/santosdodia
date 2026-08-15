import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DayView from "../../components/DayView";
import type { Locale } from "../../../lib/i18n";
import { getPublicObservancesForDate } from "../../../lib/public-observances";
import { requestPublicLocale } from "../../../lib/request-public-locale";
import { SITE_ORIGIN } from "../../../lib/site";
import { serializeStructuredData } from "../../../lib/structured-data";

const MONTH_DAY_RE = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function resolveAnnualDate(monthDay: string, referenceYear = new Date().getUTCFullYear()) {
  if (!MONTH_DAY_RE.test(monthDay)) return null;
  const [month, day] = monthDay.split("-").map(Number);
  for (let offset = 0; offset <= 8; offset += 1) {
    const year = referenceYear + offset;
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (
      candidate.getUTCFullYear() === year &&
      candidate.getUTCMonth() === month - 1 &&
      candidate.getUTCDate() === day
    ) return `${year}-${monthDay}`;
  }
  return null;
}

function annualDateLabel(dateISO: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateISO}T00:00:00Z`));
}

function annualTitle(locale: Locale, label: string) {
  if (locale === "pt") return `Santos e celebrações cristãs de ${label}`;
  if (locale === "es") return `Santos y celebraciones cristianas del ${label}`;
  if (locale === "fr") return `Saints et célébrations chrétiennes du ${label}`;
  if (locale === "it") return `Santi e celebrazioni cristiane del ${label}`;
  if (locale === "de") return `Heilige und christliche Feiern am ${label}`;
  if (locale === "pl") return `Święci i obchody chrześcijańskie: ${label}`;
  if (locale === "ru") return `Святые и христианские празднования: ${label}`;
  if (locale === "fil") return `Mga santo at pagdiriwang Kristiyano sa ${label}`;
  if (locale === "sw") return `Watakatifu na maadhimisho ya Kikristo: ${label}`;
  return `Saints and Christian celebrations on ${label}`;
}

function annualDescription(locale: Locale, label: string, names: string[], total: number) {
  const suffix = total > names.length;
  const joined = names.join(", ");
  if (locale === "pt") return names.length
    ? `Conheça os santos e celebrações cristãs associados a ${label}: ${joined}${suffix ? ", entre outros" : ""}. Consulte diferenças entre tradições e calendários cristãos.`
    : `Consulte os santos e celebrações cristãs associados a ${label}, organizados por tradição e sistema de calendário.`;
  if (locale === "es") return names.length
    ? `Conoce los santos y celebraciones cristianas asociados al ${label}: ${joined}${suffix ? ", entre otros" : ""}. Consulta las diferencias entre tradiciones y calendarios cristianos.`
    : `Consulta los santos y celebraciones cristianas asociados al ${label}, organizados por tradición y sistema de calendario.`;
  if (locale === "fr") return names.length
    ? `Découvrez les saints et célébrations chrétiennes associés au ${label} : ${joined}${suffix ? ", entre autres" : ""}. Comparez les traditions et calendriers chrétiens.`
    : `Consultez les saints et célébrations chrétiennes associés au ${label}, classés par tradition et système de calendrier.`;
  if (locale === "it") return names.length
    ? `Scopri i santi e le celebrazioni cristiane associati al ${label}: ${joined}${suffix ? ", e altri" : ""}. Confronta tradizioni e calendari cristiani.`
    : `Consulta i santi e le celebrazioni cristiane associati al ${label}, organizzati per tradizione e sistema di calendario.`;
  return names.length
    ? `Discover saints and Christian celebrations associated with ${label}: ${joined}${suffix ? ", and more" : ""}. Compare Christian traditions and calendar systems.`
    : `Explore saints and Christian celebrations associated with ${label}, organized by tradition and calendar system.`;
}

export async function generateMetadata({ params }: { params: Promise<{ monthDay: string }> }): Promise<Metadata> {
  const { monthDay } = await params;
  const dateISO = resolveAnnualDate(monthDay);
  const locale = await requestPublicLocale();
  if (!dateISO) return { title: "Invalid date", robots: { index: false, follow: false } };
  const label = annualDateLabel(dateISO, locale);
  const items = getPublicObservancesForDate(dateISO, locale);
  const names = items.slice(0, 5).map(item => item.name);
  const title = annualTitle(locale, label);
  const description = annualDescription(locale, label, names, items.length);
  const canonical = `/date/${monthDay}`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: items.length > 0, follow: true },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function AnnualDayPage({ params }: { params: Promise<{ monthDay: string }> }) {
  const { monthDay } = await params;
  const dateISO = resolveAnnualDate(monthDay);
  if (!dateISO) notFound();
  const locale = await requestPublicLocale();
  const label = annualDateLabel(dateISO, locale);
  const items = getPublicObservancesForDate(dateISO, locale);
  const url = `${SITE_ORIGIN}/date/${monthDay}`;
  const title = annualTitle(locale, label);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: title,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        mainEntity: { "@id": `${url}#observances` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#observances`,
        name: title,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          url: `${SITE_ORIGIN}/saint/${encodeURIComponent(item.id)}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Santos do Dia", item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: label, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(jsonLd) }} />
      <DayView dateISO={dateISO} mode="annual" />
    </>
  );
}
