import type { MetadataRoute } from "next";
import { getPublicAllObservances } from "../lib/public-observances";
import { DISCOVERY_TOPICS, topicPath } from "../data/discovery";
import { SAINT_BIOGRAPHIES } from "../data/saint-biographies";
import { CHURCHES } from "../data/knowledge/churches";
import { ECCLESIASTICAL_PEOPLE } from "../data/knowledge/ecclesiastical-state";
import { JURISDICTIONS } from "../data/knowledge/jurisdictions";
import {
  churchPath,
  jurisdictionPath,
  personPath,
} from "../lib/knowledge/routes";
import { SITE_ORIGIN } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const year = now.getUTCFullYear();
  const todayISO = now.toISOString().slice(0, 10);
  const dailyLastModified = new Date(`${todayISO}T00:00:00.000Z`);

  const staticRouteDefinitions = [
    {
      path: "",
      changeFrequency: "daily",
      priority: 1,
      lastModified: dailyLastModified,
    },
    { path: "/explore", changeFrequency: "weekly", priority: 0.95 },
    { path: "/calendar", changeFrequency: "weekly", priority: 0.9 },
    {
      path: "/liturgy",
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: dailyLastModified,
    },
    { path: "/churches", changeFrequency: "weekly", priority: 0.9 },
    { path: "/holidays", changeFrequency: "weekly", priority: 0.85 },
    {
      path: "/live",
      changeFrequency: "daily",
      priority: 0.85,
      lastModified: dailyLastModified,
    },
    { path: "/leaders", changeFrequency: "weekly", priority: 0.78 },
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

  const staticRoutes: MetadataRoute.Sitemap = staticRouteDefinitions.map(
    (route) => ({
      ...route,
      url: `${SITE_ORIGIN}${route.path}`,
    }),
  );

  const observances = getPublicAllObservances(year);
  const days: MetadataRoute.Sitemap = observances.map((item) => ({
    url: `${SITE_ORIGIN}/day/${item.dateISO}`,
    changeFrequency: item.dateISO === todayISO ? "daily" : "monthly",
    priority: item.dateISO === todayISO ? 0.9 : 0.65,
    ...(item.dateISO === todayISO ? { lastModified: dailyLastModified } : {}),
  }));
  const saints: MetadataRoute.Sitemap = SAINT_BIOGRAPHIES.map((item) => ({
    url: `${SITE_ORIGIN}/saint/${encodeURIComponent(item.id)}`,
    changeFrequency: "monthly",
    priority: 0.82,
  }));
  const topics: MetadataRoute.Sitemap = DISCOVERY_TOPICS.map((topic) => ({
    url: `${SITE_ORIGIN}${topicPath(topic)}`,
    changeFrequency: "monthly",
    priority: topic.popular ? 0.85 : 0.7,
  }));
  const churches: MetadataRoute.Sitemap = CHURCHES.map((church) => ({
    url: `${SITE_ORIGIN}${churchPath(church)}`,
    changeFrequency: "monthly",
    priority: 0.75,
  }));
  const jurisdictions: MetadataRoute.Sitemap = JURISDICTIONS.map(
    (jurisdiction) => ({
      url: `${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}`,
      changeFrequency: "weekly",
      priority:
        jurisdiction.level === "diocese" || jurisdiction.level === "eparchy"
          ? 0.78
          : 0.72,
    }),
  );
  const leaders: MetadataRoute.Sitemap = ECCLESIASTICAL_PEOPLE.map(
    (person) => ({
      url: `${SITE_ORIGIN}${personPath(person)}`,
      changeFrequency: "weekly",
      priority: 0.76,
    }),
  );

  return [
    ...new Map(
      [
        ...staticRoutes,
        ...days,
        ...saints,
        ...topics,
        ...churches,
        ...jurisdictions,
        ...leaders,
      ].map((item) => [item.url, item]),
    ).values(),
  ];
}
