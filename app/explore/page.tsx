import type { Metadata } from "next";
import SearchExplorer from "../components/SearchExplorer";
import { getFeatureCopy } from "../../lib/feature-copy";
import { requestPublicLocale } from "../../lib/request-public-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestPublicLocale();
  const copy = getFeatureCopy(locale);
  return {
    title: copy.findTitle,
    description: copy.findIntro,
    alternates: { canonical: "/explore" },
  };
}

export default function ExplorePage() {
  return <SearchExplorer />;
}
