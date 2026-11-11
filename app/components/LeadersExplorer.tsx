'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { traditionClass, type Tradition } from '../../data/observances';
import type { Locale } from '../../lib/i18n';

export type LeaderOfficeView = {
  id: string;
  title: string;
  jurisdictionName: string;
  churchId: string;
  churchName: string;
  tradition?: Tradition;
  countryCode?: string;
  countryName?: string;
  regionCode?: string;
  regionName?: string;
};

export type LeaderDirectoryRow = {
  id: string;
  name: string;
  href: string;
  offices: LeaderOfficeView[];
};

const copy: Record<Locale, {
  search: string;
  searchPlaceholder: string;
  church: string;
  country: string;
  region: string;
  allChurches: string;
  allCountries: string;
  allRegions: string;
  results: string;
  noResults: string;
  open: string;
}> = {
  en: { search:'Search',searchPlaceholder:'Search a leader, Church or jurisdiction…',church:'Church',country:'Country',region:'Region',allChurches:'All Churches',allCountries:'All countries',allRegions:'All regions',results:'leaders',noResults:'No leaders match these filters.',open:'Open leader profile' },
  pt: { search:'Pesquisar',searchPlaceholder:'Pesquisar líder, Igreja ou jurisdição…',church:'Igreja',country:'País',region:'Região',allChurches:'Todas as Igrejas',allCountries:'Todos os países',allRegions:'Todas as regiões',results:'líderes',noResults:'Nenhum líder corresponde a estes filtros.',open:'Abrir perfil do líder' },
  es: { search:'Buscar',searchPlaceholder:'Buscar líder, Iglesia o jurisdicción…',church:'Iglesia',country:'País',region:'Región',allChurches:'Todas las Iglesias',allCountries:'Todos los países',allRegions:'Todas las regiones',results:'líderes',noResults:'Ningún líder coincide con estos filtros.',open:'Abrir perfil del líder' },
  fr: { search:'Rechercher',searchPlaceholder:'Rechercher un responsable, une Église ou une juridiction…',church:'Église',country:'Pays',region:'Région',allChurches:'Toutes les Églises',allCountries:'Tous les pays',allRegions:'Toutes les régions',results:'responsables',noResults:'Aucun responsable ne correspond à ces filtres.',open:'Ouvrir le profil' },
  de: { search:'Suchen',searchPlaceholder:'Leitung, Kirche oder Jurisdiktion suchen…',church:'Kirche',country:'Land',region:'Region',allChurches:'Alle Kirchen',allCountries:'Alle Länder',allRegions:'Alle Regionen',results:'Leitungspersonen',noResults:'Keine passenden Leitungspersonen.',open:'Profil öffnen' },
  it: { search:'Cerca',searchPlaceholder:'Cerca un leader, una Chiesa o una giurisdizione…',church:'Chiesa',country:'Paese',region:'Regione',allChurches:'Tutte le Chiese',allCountries:'Tutti i paesi',allRegions:'Tutte le regioni',results:'leader',noResults:'Nessun leader corrisponde ai filtri.',open:'Apri il profilo' },
  pl: { search:'Szukaj',searchPlaceholder:'Szukaj przywódcy, Kościoła lub jurysdykcji…',church:'Kościół',country:'Kraj',region:'Region',allChurches:'Wszystkie Kościoły',allCountries:'Wszystkie kraje',allRegions:'Wszystkie regiony',results:'liderzy',noResults:'Brak liderów spełniających kryteria.',open:'Otwórz profil' },
  ru: { search:'Поиск',searchPlaceholder:'Найти лидера, Церковь или юрисдикцию…',church:'Церковь',country:'Страна',region:'Регион',allChurches:'Все Церкви',allCountries:'Все страны',allRegions:'Все регионы',results:'руководители',noResults:'Нет руководителей по выбранным фильтрам.',open:'Открыть профиль' },
  fil: { search:'Maghanap',searchPlaceholder:'Maghanap ng lider, Simbahan o hurisdiksiyon…',church:'Simbahan',country:'Bansa',region:'Rehiyon',allChurches:'Lahat ng Simbahan',allCountries:'Lahat ng bansa',allRegions:'Lahat ng rehiyon',results:'mga lider',noResults:'Walang lider na tumutugma sa mga filter.',open:'Buksan ang profile' },
  sw: { search:'Tafuta',searchPlaceholder:'Tafuta kiongozi, Kanisa au mamlaka…',church:'Kanisa',country:'Nchi',region:'Eneo',allChurches:'Makanisa yote',allCountries:'Nchi zote',allRegions:'Maeneo yote',results:'viongozi',noResults:'Hakuna viongozi wanaolingana na vichujio.',open:'Fungua wasifu' }
};

function uniqueOptions(values: Array<{ value?: string; label?: string }>) {
  const map = new Map<string,string>();
  for (const item of values) if (item.value && item.label) map.set(item.value, item.label);
  return [...map].map(([value,label])=>({value,label})).sort((a,b)=>a.label.localeCompare(b.label));
}

export default function LeadersExplorer({ rows, locale }: { rows: LeaderDirectoryRow[]; locale: Locale }) {
  const text=copy[locale]??copy.en;
  const [query,setQuery]=useState('');
  const [church,setChurch]=useState('all');
  const [country,setCountry]=useState('all');
  const [region,setRegion]=useState('all');

  const churchOptions=useMemo(()=>uniqueOptions(rows.flatMap(row=>row.offices.map(office=>({value:office.churchId,label:office.churchName})))),[rows]);
  const countryOptions=useMemo(()=>uniqueOptions(rows.flatMap(row=>row.offices.map(office=>({value:office.countryCode,label:office.countryName})))),[rows]);
  const regionOptions=useMemo(()=>uniqueOptions(rows.flatMap(row=>row.offices.filter(office=>country==='all'||office.countryCode===country).map(office=>({value:office.regionCode,label:office.regionName})))),[rows,country]);

  const filtered=useMemo(()=>{
    const needle=query.trim().toLocaleLowerCase(locale);
    return rows.filter(row=>row.offices.some(office=>{
      if(church!=='all'&&office.churchId!==church)return false;
      if(country!=='all'&&office.countryCode!==country)return false;
      if(region!=='all'&&office.regionCode!==region)return false;
      if(!needle)return true;
      return [row.name,office.title,office.jurisdictionName,office.churchName,office.countryName,office.regionName]
        .filter(Boolean).join(' ').toLocaleLowerCase(locale).includes(needle);
    }));
  },[rows,query,church,country,region,locale]);

  return <section className="search-card leader-directory">
    <div className="leader-filters">
      <label><span>{text.search}</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={text.searchPlaceholder}/></label>
      <label><span>{text.church}</span><select value={church} onChange={event=>setChurch(event.target.value)}><option value="all">{text.allChurches}</option>{churchOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label><span>{text.country}</span><select value={country} onChange={event=>{setCountry(event.target.value);setRegion('all')}}><option value="all">{text.allCountries}</option>{countryOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label><span>{text.region}</span><select value={region} onChange={event=>setRegion(event.target.value)}><option value="all">{text.allRegions}</option>{regionOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    </div>
    <div className="section-heading compact"><div><span className="eyebrow">{filtered.length} {text.results}</span></div></div>
    {filtered.length?<div className="result-grid">{filtered.map(row=>{
      const first=row.offices[0];
      const colourClass=first?.tradition?traditionClass(first.tradition):'';
      return <article className={`result-card leader-card ${colourClass}`} key={row.id}>
        {first?<span className="leader-church">{first.churchName}</span>:null}
        <h2>{row.name}</h2>
        {row.offices.map(office=><p key={office.id}>{office.title}{office.jurisdictionName?` · ${office.jurisdictionName}`:''}{office.countryName?` · ${office.countryName}`:''}</p>)}
        <Link className="text-link" href={row.href}>{text.open} →</Link>
      </article>;
    })}</div>:<div className="empty-state"><span>✦</span><p>{text.noResults}</p></div>}
  </section>;
}
