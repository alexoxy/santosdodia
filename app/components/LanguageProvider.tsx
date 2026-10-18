'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type Locale, ui } from '../../lib/i18n';
import { normalizeReadyPublicLocale } from '../../lib/public-locale-policy';
import { CALENDAR_REGION_COOKIE, parseCalendarRegion, countryFromLanguages, preferredTimeZone } from '../../lib/calendar-preferences';
import { parseTradition, type Tradition } from '../../data/observances';

export type ChurchPreference='all'|Tradition;
type Value={locale:Locale;setLocale:(locale:Locale)=>void;copy:(typeof ui)[Locale];calendarRegion?:string;setCalendarRegion:(region:string)=>void;country?:string;countryName?:string;timeZone:string;contextReady:boolean;church:ChurchPreference;setChurch:(church:ChurchPreference)=>void};
const Context=createContext<Value|null>(null);

export default function LanguageProvider({initialLocale,initialCountry,initialCalendarRegion,initialChurch='roman-catholic',initialTimeZone,children}:{initialLocale:Locale;initialCountry?:string;initialCalendarRegion?:string;initialChurch?:ChurchPreference;initialTimeZone?:string;children:React.ReactNode}){
 const[calendarRegion,setCalendarRegionState]=useState(parseCalendarRegion(initialCalendarRegion));
 const[locale,setLocaleState]=useState<Locale>(normalizeReadyPublicLocale(initialLocale));const[country,setCountry]=useState(initialCountry?.toUpperCase());const[timeZone,setTimeZone]=useState(preferredTimeZone(initialTimeZone, 'UTC'));const[contextReady,setContextReady]=useState(true);const[church,setChurchState]=useState<ChurchPreference>(initialChurch);
 useEffect(()=>{const saved=window.localStorage.getItem('sdd-locale');const next=normalizeReadyPublicLocale(saved??initialLocale);setLocaleState(next);document.documentElement.lang=next;window.localStorage.setItem('sdd-locale',next);document.cookie=`sdd-locale=${next}; path=/; max-age=31536000; samesite=lax`;const browserTimeZone=preferredTimeZone(initialTimeZone, Intl.DateTimeFormat().resolvedOptions().timeZone);setTimeZone(browserTimeZone);document.cookie=`sdd-timezone=${encodeURIComponent(browserTimeZone)}; path=/; max-age=31536000; samesite=lax`;setContextReady(true);const storedChurch=window.localStorage.getItem('sdd-tradition');if(storedChurch==='all')setChurchState('all');else{const parsed=parseTradition(storedChurch);if(parsed)setChurchState(parsed)}},[initialLocale,initialTimeZone]);
 useEffect(()=>{if(country)return;let active=true;const fallback=()=>countryFromLanguages(navigator.languages?.length?navigator.languages:[navigator.language]);fetch('/api/v1/context').then(r=>r.ok?r.json():null).then(d=>{if(active)setCountry(d?.country?String(d.country).toUpperCase():fallback())}).catch(()=>{if(active)setCountry(fallback())});return()=>{active=false}},[country]);
 function setCalendarRegion(value:string){const next=parseCalendarRegion(value);if(!next)return;setCalendarRegionState(next);document.cookie=`${CALENDAR_REGION_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`}
 function setLocale(next:Locale){const publicLocale=normalizeReadyPublicLocale(next);setLocaleState(publicLocale);window.localStorage.setItem('sdd-locale',publicLocale);document.cookie=`sdd-locale=${publicLocale}; path=/; max-age=31536000; samesite=lax`;document.documentElement.lang=publicLocale}
 function setChurch(next:ChurchPreference){setChurchState(next);window.localStorage.setItem('sdd-tradition',next);document.cookie=`sdd-tradition=${next}; path=/; max-age=31536000; samesite=lax`}
 const countryName=useMemo(()=>{if(!country)return;try{return new Intl.DisplayNames([locale],{type:'region'}).of(country)??country}catch{return country}},[country,locale]);
 const value=useMemo<Value>(()=>({locale,setLocale,copy:ui[locale],calendarRegion,setCalendarRegion,country,countryName,timeZone,contextReady,church,setChurch}),[locale,calendarRegion,country,countryName,timeZone,contextReady,church]);return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useLanguage(){const value=useContext(Context);if(!value)throw new Error('useLanguage must be used inside LanguageProvider');return value}
