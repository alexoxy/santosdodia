import type { MetadataRoute } from "next";
import { getPublicAllObservances } from "../lib/public-observances";
import { hasAnnualDateEditorial } from "../data/date-editorial-registry";
import { EDITORIAL_GUIDES } from "../data/editorial-guides";
import { SAINT_BIOGRAPHIES } from "../data/saint-biography-registry";
import { isSaintBiographyReadyForLaunchedLocales } from "../lib/editorial-profile-quality";
import { SITE_ORIGIN } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const year = now.getUTCFullYear();
  const todayISO = now.toISOString().slice(0, 10);
  const dailyLastModified = new Date(`${todayISO}T00:00:00.000Z`);

  // The sitemap is a curated publication surface, not an inventory of every
  // public route. Utility, search and structured-directory routes stay usable
  // but remain outside search until an explicit substantive editorial gate is met.
  const staticRouteDefinitions = [
    { path: "", changeFrequency: "daily", priority: 1, lastModified: dailyLastModified },
    { path: "/guides", changeFrequency: "weekly", priority: 0.88 },
    { path: "/about", changeFrequency: "monthly", priority: 0.75 },
    { path: "/sources", changeFrequency: "monthly", priority: 0.7 },
    { path: "/copyright", changeFrequency: "monthly", priority: 0.6 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.6 },
    { path: "/advertising", changeFrequency: "monthly", priority: 0.6 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.55 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.65 },
    { path: "/corrections", changeFrequency: "monthly", priority: 0.6 },
    { path: "/developers", changeFrequency: "monthly", priority: 0.6 },
  ] as const;

  const staticRoutes: MetadataRoute.Sitemap = staticRouteDefinitions.map(route => ({ ...route, url: `${SITE_ORIGIN}${route.path}` }));
  const observances = getPublicAllObservances(year);
  const annualDays: MetadataRoute.Sitemap = [...new Set(observances.map(item => item.dateISO.slice(5)))]
    .filter(monthDay => hasAnnualDateEditorial(monthDay, "en"))
    .map(monthDay => ({
      url: `${SITE_ORIGIN}/date/${monthDay}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  const saints: MetadataRoute.Sitemap = SAINT_BIOGRAPHIES.filter(isSaintBiographyReadyForLaunchedLocales).map(item => ({
    url: `${SITE_ORIGIN}/saint/${encodeURIComponent(item.id)}`,
    changeFrequency: "monthly",
    priority: 0.82,
    lastModified: new Date(`${item.verifiedAt}T00:00:00.000Z`),
  }));
  const guides: MetadataRoute.Sitemap = EDITORIAL_GUIDES.map(guide => ({
    url: `${SITE_ORIGIN}/guides/${guide.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...new Map([...staticRoutes, ...annualDays, ...saints, ...guides].map(item => [item.url, item])).values()];
}
