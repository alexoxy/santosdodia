'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPopularTopics, topicLabel, topicPath } from '../../data/discovery';
import { getFeatureCopy } from '../../lib/feature-copy';
import { useLanguage } from './LanguageProvider';

export default function PatronageSearch({compact=false}:{compact?:boolean}){
 const{locale}=useLanguage();const copy=getFeatureCopy(locale);const router=useRouter();const[q,setQuery]=useState('');
 function submit(event:FormEvent){event.preventDefault();const value=q.trim();router.push(value?`/explore?q=${encodeURIComponent(value)}`:'/explore')}
 const popular=getPopularTopics().slice(0,compact?5:8);
 return <section className={`patron-search${compact?' patron-search-compact':''}`}>
  <div className="patron-search-heading"><span className="eyebrow">{copy.findEyebrow}</span>{compact?null:<><h2>{copy.findTitle}</h2><p>{copy.findIntro}</p></>}</div>
  <form className="patron-search-form" onSubmit={submit} role="search">
   <label className="sr-only" htmlFor={compact?'patron-search-compact':'patron-search'}>{copy.findPlaceholder}</label>
   <span aria-hidden="true">⌕</span><input id={compact?'patron-search-compact':'patron-search'} value={q} onChange={event=>setQuery(event.target.value)} placeholder={copy.findPlaceholder}/><button className="btn btn-primary" type="submit">{copy.findButton}</button>
  </form>
  <div className="search-intents" aria-label={copy.findEyebrow}><span>{copy.byProfession}</span><span>{copy.byPlace}</span><span>{copy.byDate}</span><span>{copy.bySaint}</span></div>
  <div className="popular-topics"><strong>{copy.popular}</strong><div>{popular.map(topic=><Link href={topicPath(topic)} key={`${topic.kind}-${topic.slug}`}>{topicLabel(topic,locale)}</Link>)}</div></div>
 </section>;
}
