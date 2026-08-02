import type { MetadataRoute } from 'next';
import { getAllObservances } from '../data/observances';
import { DISCOVERY_TOPICS,topicPath } from '../data/discovery';
import { CHURCHES } from '../data/knowledge/churches';
import { JURISDICTIONS } from '../data/knowledge/jurisdictions';
import { churchPath, jurisdictionPath } from '../lib/knowledge/routes';
import { SITE_ORIGIN } from '../lib/site';

export default function sitemap():MetadataRoute.Sitemap{
 const year=new Date().getUTCFullYear(),now=new Date();
 const staticRoutes=['','/calendar','/holidays','/liturgy','/explore','/live','/churches','/copyright','/developers'].map((path,index)=>({url:`${SITE_ORIGIN}${path}`,lastModified:now,changeFrequency:(index===0?'daily':'weekly') as 'daily'|'weekly',priority:index===0?1:path==='/explore'?0.95:path==='/calendar'||path==='/liturgy'||path==='/churches'?0.9:path==='/holidays'||path==='/live'?0.85:0.65}));
 const observances=getAllObservances(year),days=observances.map(item=>({url:`${SITE_ORIGIN}/day/${item.dateISO}`,lastModified:now,changeFrequency:'weekly' as const,priority:0.65})),saints=observances.map(item=>({url:`${SITE_ORIGIN}/saint/${item.id}`,lastModified:now,changeFrequency:'monthly' as const,priority:0.8})),topics=DISCOVERY_TOPICS.map(topic=>({url:`${SITE_ORIGIN}${topicPath(topic)}`,lastModified:now,changeFrequency:'monthly' as const,priority:topic.popular?0.85:0.7}));
 const churches=CHURCHES.map(church=>({url:`${SITE_ORIGIN}${churchPath(church)}`,lastModified:now,changeFrequency:'monthly' as const,priority:0.75}));
 const jurisdictions=JURISDICTIONS.map(jurisdiction=>({url:`${SITE_ORIGIN}${jurisdictionPath(jurisdiction)}`,lastModified:now,changeFrequency:'weekly' as const,priority:jurisdiction.level==='diocese'||jurisdiction.level==='eparchy'?0.78:0.72}));
 return[...new Map([...staticRoutes,...days,...saints,...topics,...churches,...jurisdictions].map(item=>[item.url,item])).values()]
}
