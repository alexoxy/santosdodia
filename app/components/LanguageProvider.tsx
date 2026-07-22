'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeLocale, type Locale, ui } from '../../lib/i18n';

type Value={locale:Locale;setLocale:(locale:Locale)=>void;copy:(typeof ui)[Locale];country?:string;countryName?:string};
const Context=createContext<Value|null>(null);
export default function LanguageProvider({initialLocale,initialCountry,children}:{initialLocale:Locale;initialCountry?:string;children:React.ReactNode}){
 const[locale,setLocaleState]=useState<Locale>(initialLocale);const[country,setCountry]=useState(initialCountry?.toUpperCase());
 useEffect(()=>{const saved=window.localStorage.getItem('sdd-locale');const next=saved?normalizeLocale(saved):normalizeLocale(navigator.languages?.[0]??navigator.language);setLocaleState(next);document.documentElement.lang=next},[]);
 useEffect(()=>{if(country)return;fetch('/api/v1/context').then(r=>r.ok?r.json():null).then(d=>{if(d?.country)setCountry(String(d.country).toUpperCase())}).catch(()=>undefined)},[country]);
 function setLocale(next:Locale){setLocaleState(next);window.localStorage.setItem('sdd-locale',next);document.cookie=`sdd-locale=${next}; path=/; max-age=31536000; samesite=lax`;document.documentElement.lang=next}
 const countryName=useMemo(()=>{if(!country)return;try{return new Intl.DisplayNames([locale],{type:'region'}).of(country)??country}catch{return country}},[country,locale]);
 const value=useMemo<Value>(()=>({locale,setLocale,copy:ui[locale],country,countryName}),[locale,country,countryName]);return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useLanguage(){const value=useContext(Context);if(!value)throw new Error('useLanguage must be used inside LanguageProvider');return value}
