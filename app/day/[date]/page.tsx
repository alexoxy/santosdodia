import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DayView from "../../components/DayView";
import { isValidDateISO } from "../../../data/observances";
import type { Locale } from "../../../lib/i18n";
import { publicSaintProfilePath } from "../../../lib/public-entity-links";
import { getPublicObservancesForDate } from "../../../lib/public-observances";
import { requestPublicLocale } from "../../../lib/request-public-locale";
import { SITE_ORIGIN } from "../../../lib/site";
import { serializeStructuredData } from "../../../lib/structured-data";

function dateLabel(dateISO: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${dateISO}T00:00:00Z`));
}

function invalidDateTitle(locale: Locale) {
  if (locale === "pt") return "Data inválida";
  if (locale === "es") return "Fecha no válida";
  if (locale === "fr") return "Date invalide";
  if (locale === "it") return "Data non valida";
  return "Invalid date";
}

function dayTitle(locale: Locale, label: string) {
  if (locale === "pt") return `Santos e celebrações cristãs em ${label}`;
  if (locale === "es") return `Santos y celebraciones cristianas del ${label}`;
  if (locale === "fr") return `Saints et célébrations chrétiennes du ${label}`;
  if (locale === "it") return `Santi e celebrazioni cristiane del ${label}`;
  return `Saints and Christian feasts on ${label}`;
}

function dayDescription(
  locale: Locale,
  label: string,
  names: string[],
  total: number,
) {
  const suffix = total > names.length;
  if (locale === "pt")
    return names.length
      ? `Santos e celebrações cristãs assinalados em ${label}: ${names.join(", ")}${suffix ? ", entre outros" : ""}.`
      : `Santos e celebrações cristãs de ${label}, organizados por tradição e sistema de calendário.`;
  if (locale === "es")
    return names.length
      ? `Santos y celebraciones cristianas del ${label}: ${names.join(", ")}${suffix ? ", entre otros" : ""}.`
      : `Santos y celebraciones cristianas del ${label}, organizados por tradición y sistema de calendario.`;
  if (locale === "fr")
    return names.length
      ? `Saints et célébrations chrétiennes du ${label} : ${names.join(", ")}${suffix ? ", et autres" : ""}.`
      : `Saints et célébrations chrétiennes du ${label}, classés par tradition et calendrier.`;
  if (locale === "it")
    return names.length
      ? `Santi e celebrazioni cristiane del ${label}: ${names.join(", ")}${suffix ? ", e altri" : ""}.`
      : `Santi e celebrazioni cristiane del ${label}, organizzati per tradizione e sistema di calendario.`;
  return names.length
    ? `Christian saints and feasts observed on ${label}: ${names.join(", ")}${suffix ? ", and more" : ""}.`
    : `Christian saints and feasts for ${label}, organized by Church tradition and calendar system.`;
}

function observanceListName(locale: Locale, label: string) {
  if (locale === "pt") return `Celebrações cristãs em ${label}`;
  if (locale === "es") return `Celebraciones cristianas del ${label}`;
  if (locale === "fr") return `Célébrations chrétiennes du ${label}`;
  if (locale === "it") return `Celebrazioni cristiane del ${label}`;
  return `Christian observances on ${label}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const locale = await requestPublicLocale();
  if (!isValidDateISO(date))
    return {
      title: invalidDateTitle(locale),
      robots: { index: false, follow: false },
    };
  const label = dateLabel(date, locale);
  const items = getPublicObservancesForDate(date, locale);
  const names = items.slice(0, 5).map((item) => item.name);
  const description = dayDescription(locale, label, names, items.length);
  const title = dayTitle(locale, label);
  const canonical = `/day/${date}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isValidDateISO(date)) notFound();
  const locale = await requestPublicLocale();
  const label = dateLabel(date, locale);
  const items = getPublicObservancesForDate(date, locale);
  const url = `${SITE_ORIGIN}/day/${date}`;
  const title = dayTitle(locale, label);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: title,
        dateCreated: date,
        inLanguage: locale,
        mainEntity: { "@id": `${url}#observances` },
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_ORIGIN}/#website`,
          name: "Santos do Dia",
          url: SITE_ORIGIN,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#observances`,
        name: observanceListName(locale, label),
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => {
          const profilePath = publicSaintProfilePath(item.id, locale);
          return {
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: profilePath
              ? `${SITE_ORIGIN}${profilePath}`
              : `${url}#observance-${encodeURIComponent(item.id)}`,
          };
        }),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(jsonLd) }}
      />
      <DayView dateISO={date} />
    </>
  );
}
