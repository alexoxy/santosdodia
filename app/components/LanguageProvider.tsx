'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type Locale, ui } from '../../lib/i18n';
import { normalizeReadyPublicLocale } from '../../lib/public-locale-policy';
import { normalizeTimeZone } from '../../lib/date-context';
import { parseTradition, type Tradition } from '../../data/observances';

export type ChurchPreference='all'|Tradition;
type Value={locale:Locale;setLocale:(locale:Locale)=>void;copy:(typeof ui)[Locale];country?:string;countryName?:string;timeZone:string;contextReady:boolean;church:ChurchPreference;setChurch:(church:ChurchPreference)=>void};
const Context=createContext<Value|null>(null);

export default function LanguageProvider({initialLocale,initialCountry,initialChurch='roman-catholic',initialTimeZone,children}:{initialLocale:Locale;initialCountry?:string;initialChurch?:ChurchPreference;initialTimeZone?:string;children:React.ReactNode}){
 const[locale,setLocaleState]=useState<Locale>(normalizeReadyPublicLocale(initialLocale));const[country,setCountry]=useState(initialCountry?.toUpperCase());const[timeZone,setTimeZone]=useState(normalizeTimeZone(initialTimeZone));const[contextReady,setContextReady]=useState(Boolean(initialTimeZone));const[church,setChurchState]=useState<ChurchPreference>(initialChurch);
 useEffect(()=>{const saved=window.localStorage.getItem('sdd-locale');const next=normalizeReadyPublicLocale(saved??initialLocale);setLocaleState(next);document.documentElement.lang=next;window.localStorage.setItem('sdd-locale',next);document.cookie=`sdd-locale=${next}; path=/; max-age=31536000; samesite=lax`;const browserTimeZone=normalizeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);setTimeZone(browserTimeZone);document.cookie=`sdd-timezone=${encodeURIComponent(browserTimeZone)}; path=/; max-age=31536000; samesite=lax`;setContextReady(true);const storedChurch=window.localStorage.getItem('sdd-tradition');if(storedChurch==='all')setChurchState('all');else{const parsed=parseTradition(storedChurch);if(parsed)setChurchState(parsed)}},[initialLocale]);
 useEffect(()=>{if(country)return;fetch('/api/v1/context').then(r=>r.ok?r.json():null).then(d=>{if(d?.country)setCountry(String(d.country).toUpperCase())}).catch(()=>undefined)},[country]);
 function setLocale(next:Locale){const publicLocale=normalizeReadyPublicLocale(next);setLocaleState(publicLocale);window.localStorage.setItem('sdd-locale',publicLocale);document.cookie=`sdd-locale=${publicLocale}; path=/; max-age=31536000; samesite=lax`;document.documentElement.lang=publicLocale}
 function setChurch(next:ChurchPreference){setChurchState(next);window.localStorage.setItem('sdd-tradition',next);document.cookie=`sdd-tradition=${next}; path=/; max-age=31536000; samesite=lax`}
 const countryName=useMemo(()=>{if(!country)return;try{return new Intl.DisplayNames([locale],{type:'region'}).of(country)??country}catch{return country}},[country,locale]);
 const value=useMemo<Value>(()=>({locale,setLocale,copy:ui[locale],country,countryName,timeZone,contextReady,church,setChurch}),[locale,country,countryName,timeZone,contextReady,church]);return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useLanguage(){const value=useContext(Context);if(!value)throw new Error('useLanguage must be used inside LanguageProvider');return value}
