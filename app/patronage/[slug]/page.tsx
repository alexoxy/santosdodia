import type { Metadata } from 'next';
import DiscoveryTopicView from '../../components/DiscoveryTopicView';
import { DISCOVERY_TOPICS,getDiscoveryTopic } from '../../../data/discovery';

export function generateStaticParams(){return DISCOVERY_TOPICS.filter(topic=>topic.kind!=='place').map(topic=>({slug:topic.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const topic=getDiscoveryTopic('profession',slug)??getDiscoveryTopic('cause',slug);return topic?{title:topic.labels.en,description:topic.descriptions.en,alternates:{canonical:`/patronage/${slug}`}}:{title:'Patron saint search'}}
export default async function PatronagePage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const kind=getDiscoveryTopic('profession',slug)?'profession':'cause';return <DiscoveryTopicView kind={kind} slug={slug}/>}
