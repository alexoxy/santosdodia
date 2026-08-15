import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EditorialGuideView from '../../components/EditorialGuideView';
import { EDITORIAL_GUIDES,getEditorialGuide,getEditorialGuideCopy } from '../../../data/editorial-guides';
import { requestPublicLocale } from '../../../lib/request-public-locale';
import { SITE_ORIGIN } from '../../../lib/site';
import { serializeStructuredData } from '../../../lib/structured-data';

export function generateStaticParams(){return EDITORIAL_GUIDES.map(guide=>({slug:guide.slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const guide=getEditorialGuide(slug);if(!guide)return{title:'Guide not found',robots:{index:false,follow:false}};
 const locale=await requestPublicLocale();const copy=getEditorialGuideCopy(guide,locale);const canonical=`/guides/${guide.slug}`;
 return{title:copy.title,description:copy.lead,alternates:{canonical},robots:{index:true,follow:true},openGraph:{title:copy.title,description:copy.lead,url:canonical,type:'article'},twitter:{card:'summary',title:copy.title,description:copy.lead}};
}

export default async function GuidePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const guide=getEditorialGuide(slug);if(!guide)notFound();const locale=await requestPublicLocale();const copy=getEditorialGuideCopy(guide,locale);const url=`${SITE_ORIGIN}/guides/${guide.slug}`;
 const jsonLd={"@context":"https://schema.org","@graph":[{"@type":"CollectionPage","@id":url,url,name:copy.title,description:copy.lead,inLanguage:locale,isPartOf:{"@id":`${SITE_ORIGIN}/#website`}},{"@type":"BreadcrumbList","@id":`${url}#breadcrumbs`,itemListElement:[{"@type":"ListItem",position:1,name:'Santos do Dia',item:SITE_ORIGIN},{"@type":"ListItem",position:2,name:'Editorial guides',item:`${SITE_ORIGIN}/guides`},{"@type":"ListItem",position:3,name:copy.title,item:url}]}]};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeStructuredData(jsonLd)}}/><EditorialGuideView guide={guide} locale={locale}/></>;
}