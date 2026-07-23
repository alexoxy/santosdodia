'use client';
import { useEffect,useState } from 'react';
import { biographyUi } from '../../data/saint-biographies';
import { useLanguage } from './LanguageProvider';

type BiographyData={title:string;description?:string;extract:string;url:string;language:string;provider:string;license:string;retrievedAt:string};

export default function OsintBiography({id}:{id:string}){
 const{locale}=useLanguage();const copy=biographyUi[locale];const[data,setData]=useState<BiographyData|null>(null);
 useEffect(()=>{const controller=new AbortController();setData(null);fetch(`/api/v1/biography/${encodeURIComponent(id)}?locale=${locale}`,{signal:controller.signal}).then(response=>response.ok?response.json():null).then(payload=>setData(payload?.data??null)).catch(()=>undefined);return()=>controller.abort()},[id,locale]);
 if(!data)return null;
 return <section className="saint-biography osint-biography"><span className="eyebrow">{copy.history} · OSINT</span><h2>{data.title}</h2>{data.description?<p className="biography-description">{data.description}</p>:null}<div className="biography-text"><p>{data.extract}</p></div><div className="biography-provenance"><div><h3>{copy.sources}</h3><p>{data.provider} · {data.license}</p></div><span>{data.language.toUpperCase()}</span></div><div className="biography-source-links"><a href={data.url} target="_blank" rel="noreferrer"><strong>{data.title}</strong><span>{data.provider} · {data.license}</span></a></div></section>;
}
