import type { MetadataRoute } from 'next';
import { getAllObservances } from '../data/observances';
import { SITE_ORIGIN } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const year = new Date().getUTCFullYear();
  const staticRoutes = ['', '/calendar', '/liturgy', '/explore', '/sources'].map((path, index) => ({
    url: `${SITE_ORIGIN}${path}`,
    lastModified: new Date(),
    changeFrequency: (index === 0 ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: index === 0 ? 1 : path === '/liturgy' ? 0.9 : 0.8
  }));
  const days = getAllObservances(year).map(item => ({
    url: `${SITE_ORIGIN}/day/${item.dateISO}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));
  return [...new Map([...staticRoutes, ...days].map(item => [item.url, item])).values()];
}
