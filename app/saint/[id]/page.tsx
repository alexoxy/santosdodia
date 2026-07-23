import type { Metadata } from 'next';
import SaintProfile from '../../components/SaintProfile';
import { getAllObservances } from '../../../data/observances';
import { getObservanceById } from '../../../data/discovery';

export function generateStaticParams(){const year=new Date().getUTCFullYear();return getAllObservances(year).map(item=>({id:item.id}))}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const{id}=await params;const item=getObservanceById(id,new Date().getUTCFullYear(),'en');return item?{title:item.name,description:`Feast date, Christian traditions, patronages, sources and an individual calendar feed for ${item.name}.`,alternates:{canonical:`/saint/${id}`}}:{title:'Saint not found'}}
export default async function SaintPage({params}:{params:Promise<{id:string}>}){const{id}=await params;return <SaintProfile id={id}/>}
