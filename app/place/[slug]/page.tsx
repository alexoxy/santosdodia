import type { Metadata } from 'next';
import DiscoveryTopicView from '../../components/DiscoveryTopicView';
import { DISCOVERY_TOPICS,getDiscoveryTopic } from '../../../data/discovery';

export function generateStaticParams(){return DISCOVERY_TOPICS.filter(topic=>topic.kind==='place').map(topic=>({slug:topic.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const topic=getDiscoveryTopic('place',slug);return topic?{title:topic.labels.en,description:topic.descriptions.en,alternates:{canonical:`/place/${slug}`}}:{title:'Saints by place'}}
export default async function PlacePage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <DiscoveryTopicView kind="place" slug={slug}/>}
