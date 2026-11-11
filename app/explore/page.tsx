import type { Metadata } from "next";
import Link from "next/link";
import SearchExplorer from "../components/SearchExplorer";
import { getFeatureCopy } from "../../lib/feature-copy";
import { requestPublicLocale } from "../../lib/request-public-locale";

const guideLinks = {
  en: { label: "Editorial guides", text: "Explore connected stories about saints, feast days, traditions and pilgrimage with visible sources." },
  pt: { label: "Guias editoriais", text: "Explore histórias ligadas sobre santos, festas, tradições e peregrinação, sempre com fontes visíveis." },
  es: { label: "Guías editoriales", text: "Explora historias conectadas sobre santos, fiestas, tradiciones y peregrinación, siempre con fuentes visibles." },
  it: { label: "Guide editoriali", text: "Esplora storie collegate su santi, feste, tradizioni e pellegrinaggio, sempre con fonti visibili." },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestPublicLocale();
  const copy = getFeatureCopy(locale);
  return {
    title: copy.findTitle,
    description: copy.findIntro,
    alternates: { canonical: "/explore" },
    robots: { index: false, follow: true },
  };
}

export default async function ExplorePage() {
  const locale = await requestPublicLocale();
  const guideCopy = guideLinks[locale as keyof typeof guideLinks] ?? guideLinks.en;
  return <>
    <SearchExplorer />
    <p><Link className="text-link" href="/guides"><strong>{guideCopy.label}</strong> — {guideCopy.text} →</Link></p>
  </>;
}
