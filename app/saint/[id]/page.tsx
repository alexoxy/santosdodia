import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SaintProfile from "../../components/SaintProfile";
import { getCanonicalPersonAnchor, getCanonicalPersonProfileObservance } from "../../../data/canonical-person-profiles";
import { getObservanceById } from "../../../data/discovery";
import { SAINT_BIOGRAPHIES, getSaintBiography, getSaintBiographyRecord } from "../../../data/saint-biography-registry";
import { isSaintBiographyIndexable } from "../../../lib/editorial-profile-quality";
import type { Locale } from "../../../lib/i18n";
import { getPublishedCanonicalPersonProfileById, getPublishedPersonObservanceById } from "../../../lib/public-observance-profile";
import { requestPublicLocale } from "../../../lib/request-public-locale";
import { SITE_ORIGIN } from "../../../lib/site";
import { serializeStructuredData } from "../../../lib/structured-data";

const YEAR = new Date().getUTCFullYear();

function decodeRouteId(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}

function fallbackProfileDescription(locale: Locale, name: string) {
  if (locale === "pt") return `Data da celebração, tradição cristã e informação de calendário revista sobre ${name}.`;
  if (locale === "es") return `Fecha de celebración, tradición cristiana e información de calendario revisada sobre ${name}.`;
  if (locale === "fr") return `Date de célébration, tradition chrétienne et informations de calendrier vérifiées sur ${name}.`;
  if (locale === "it") return `Data della celebrazione, tradizione cristiana e informazioni di calendario verificate su ${name}.`;
  return `Feast date, Christian tradition and reviewed calendar information for ${name}.`;
}

function notFoundTitle(locale: Locale) {
  if (locale === "pt") return "Santo não encontrado";
  if (locale === "es") return "Santo no encontrado";
  if (locale === "fr") return "Saint introuvable";
  if (locale === "it") return "Santo non trovato";
  return "Saint not found";
}

export function generateStaticParams() {
  return SAINT_BIOGRAPHIES.map((item) => ({ id: item.id }));
}

async function resolveProfile(id: string, locale: Locale, dateISO?: string) {
  const repositoryProfile = getObservanceById(id, YEAR, locale)
    ?? getCanonicalPersonProfileObservance(id, YEAR, locale);
  if (repositoryProfile) return repositoryProfile;

  return await getPublishedCanonicalPersonProfileById(id, YEAR, locale, dateISO)
    ?? getPublishedPersonObservanceById(id, YEAR, locale, dateISO);
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string }>; }): Promise<Metadata> {
  const { id: routeId } = await params;
  const id = decodeRouteId(routeId);
  const { date } = await searchParams;
  const locale = await requestPublicLocale();
  const item = await resolveProfile(id, locale, date);
  if (!item) return { title: notFoundTitle(locale), robots: { index: false, follow: false } };
  const biographyRecord = getSaintBiographyRecord(id);
  const biography = getSaintBiography(id, locale);
  const indexableBiography = Boolean(biographyRecord && isSaintBiographyIndexable(biographyRecord, locale));
  const description = biography?.summary ?? item.summary ?? fallbackProfileDescription(locale, item.name);
  const canonical = `/saint/${encodeURIComponent(id)}`;
  const keywords = [...new Set([item.name, ...Object.values(item.names).filter((value): value is string => Boolean(value)), ...(item.patronages ?? []), ...item.traditions])];
  return {
    title: item.name,
    description,
    keywords,
    alternates: { canonical },
    robots: indexableBiography ? { index: true, follow: true } : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: { title: item.name, description, url: canonical, type: "profile" },
    twitter: { card: "summary", title: item.name, description },
  };
}

export default async function SaintPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string }>; }) {
  const { id: routeId } = await params;
  const id = decodeRouteId(routeId);
  const { date } = await searchParams;
  const locale = await requestPublicLocale();
  const curated = getObservanceById(id, YEAR, locale);
  const canonical = curated ? undefined : getCanonicalPersonProfileObservance(id, YEAR, locale);
  const runtimeCanonical = curated || canonical
    ? undefined
    : await getPublishedCanonicalPersonProfileById(id, YEAR, locale, date);
  const item = curated
    ?? canonical
    ?? runtimeCanonical
    ?? await getPublishedPersonObservanceById(id, YEAR, locale, date);
  if (!item) notFound();

  const biographyRecord = getSaintBiographyRecord(id);
  const biography = getSaintBiography(id, locale);
  const indexableBiography = Boolean(biographyRecord && biography && isSaintBiographyIndexable(biographyRecord, locale));
  const url = `${SITE_ORIGIN}/saint/${encodeURIComponent(id)}`;
  const alternateNames = [...new Set(Object.values(item.names).filter((value): value is string => Boolean(value) && value !== item.name))];
  const properties = [
    { name: "Feast date", value: item.dateISO },
    { name: "Category", value: item.category },
    { name: "Calendar system", value: item.calendarSystem },
    { name: "Christian traditions", value: item.traditions.join(", ") },
    ...(item.patronages?.length ? [{ name: "Patronages", value: item.patronages.join(", ") }] : []),
    ...(item.countries?.length ? [{ name: "Geographic scope", value: item.countries.join(", ") }] : []),
  ];
  const entityId = indexableBiography ? `${url}#person` : `${url}#observance`;
  const entity = indexableBiography && biography ? {
    "@type": "Person",
    "@id": entityId,
    name: item.name,
    alternateName: alternateNames,
    description: biography.summary,
    url,
    additionalProperty: properties.map(property => ({ "@type": "PropertyValue", name: property.name, value: property.value })),
  } : {
    "@type": "DefinedTerm",
    "@id": entityId,
    name: item.name,
    alternateName: alternateNames,
    description: item.summary,
    identifier: item.id,
    termCode: item.id,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: "Santos do Dia Christian observances", url: `${SITE_ORIGIN}/calendar` },
    additionalProperty: properties.map(property => ({ "@type": "PropertyValue", name: property.name, value: property.value })),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        name: item.name,
        description: biography?.summary ?? item.summary,
        mainEntity: { "@id": entityId },
        isPartOf: { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: "Santos do Dia", url: SITE_ORIGIN },
      },
      entity,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Santos do Dia", item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: item.name, item: url },
        ],
      },
    ],
  };

  const calendarObservanceId = getCanonicalPersonAnchor(id)?.primaryObservanceId;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(jsonLd) }} />
    <SaintProfile id={id} runtimeItem={curated ? undefined : item} calendarObservanceId={calendarObservanceId} />
  </>;
}