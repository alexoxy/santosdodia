import type { MetadataRoute } from 'next';
import { getAllObservances } from '../data/observances';

export default function sitemap():MetadataRoute.Sitemap{
  const base='https://santosdodia.com',year=new Date().getUTCFullYear();
  const staticRoutes=['','/calendar','/explore','/sources'].map((path,index)=>({
    url:`${base}${path}`,lastModified:new Date(),changeFrequency:(index===0?'daily':'weekly') as 'daily'|'weekly',priority:index===0?1:.8
  }));
  const days=getAllObservances(year).map(item=>({url:`${base}/day/${item.dateISO}`,lastModified:new Date(),changeFrequency:'weekly' as const,priority:.6}));
  return[...new Map([...staticRoutes,...days].map(item=>[item.url,item])).values()];
}
