'use client';

import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, TRADITIONS, traditionLabel, type Category, type Tradition } from '../../data/observances';
import type { Locale } from '../../lib/i18n';
import { SITE_ORIGIN } from '../../lib/site';
import AddToCalendar from './AddToCalendar';
import { useLanguage, type ChurchPreference } from './LanguageProvider';

type Country = { countryCode:string; name:string };
type SyncCopy = {
  eyebrow:string; title:string; intro:string; liveTitle:string; liveBody:string; snapshotTitle:string; snapshotBody:string;
  machineTitle:string; machineBody:string; church:string; region:string; category:string; all:string; global:string; year:string;
  subscriptionUrl:string; apiUrl:string; copy:string; copied:string; downloadYear:string; openApi:string; openJson:string;
  refreshNote:string; calendarName:string;
};

const labels: Partial<Record<Locale,SyncCopy>> = {
  en:{eyebrow:'Subscribe once · keep it updated',title:'Sync the liturgical calendar',intro:'Build one persistent calendar feed from the same reviewed data that powers Today and the calendar. Choose a Church, region and category, then subscribe in your calendar app or use the equivalent JSON API.',liveTitle:'Live subscription',liveBody:'Best for normal use. The URL stays stable and currently serves the current and following year, so calendar apps can refresh it over time.',snapshotTitle:'Annual snapshot',snapshotBody:'Download one fixed calendar year as an ICS file for archiving, import or offline use.',machineTitle:'Machine access',machineBody:'Use the equivalent JSON endpoint for apps, agents, websites and integrations. The same filters are preserved.',church:'Church',region:'Region',category:'Category',all:'All',global:'Global',year:'Year',subscriptionUrl:'Subscription URL',apiUrl:'JSON API URL',copy:'Copy',copied:'Copied',downloadYear:'Download annual ICS',openApi:'Open API guide',openJson:'Open JSON',refreshNote:'External calendar apps decide how often they refresh subscribed calendars. Santos do Dia publishes a six-hour refresh hint in the feed.',calendarName:'Santos do Dia liturgical calendar'},
  pt:{eyebrow:'Subscreva uma vez · mantenha atualizado',title:'Sincronizar o calendário litúrgico',intro:'Crie uma subscrição persistente a partir dos mesmos dados revistos que alimentam o Hoje e o calendário. Escolha Igreja, região e categoria e sincronize com a sua agenda ou use a API JSON equivalente.',liveTitle:'Subscrição contínua',liveBody:'É a opção recomendada. O endereço mantém-se estável e serve o ano atual e o seguinte, permitindo que a aplicação de calendário o atualize ao longo do tempo.',snapshotTitle:'Snapshot anual',snapshotBody:'Descarregue um ano civil fixo em ICS para arquivo, importação ou utilização offline.',machineTitle:'Acesso por API',machineBody:'Use o endpoint JSON equivalente em aplicações, agentes, sites e integrações. Os mesmos filtros são preservados.',church:'Igreja',region:'Região',category:'Categoria',all:'Todas',global:'Global',year:'Ano',subscriptionUrl:'URL de subscrição',apiUrl:'URL da API JSON',copy:'Copiar',copied:'Copiado',downloadYear:'Descarregar ICS anual',openApi:'Abrir guia da API',openJson:'Abrir JSON',refreshNote:'Cada aplicação externa decide a frequência com que atualiza calendários subscritos. O Santos do Dia publica no feed uma recomendação de atualização de seis horas.',calendarName:'Calendário litúrgico Santos do Dia'},
  es:{eyebrow:'Suscríbete una vez · mantenlo actualizado',title:'Sincronizar el calendario litúrgico',intro:'Crea una suscripción persistente a partir de los mismos datos revisados que alimentan Hoy y el calendario. Elige Iglesia, región y categoría y sincroniza con tu agenda o utiliza la API JSON equivalente.',liveTitle:'Suscripción continua',liveBody:'Es la opción recomendada. La dirección permanece estable y sirve el año actual y el siguiente para que la aplicación de calendario pueda actualizarla.',snapshotTitle:'Instantánea anual',snapshotBody:'Descarga un año civil fijo en ICS para archivo, importación o uso sin conexión.',machineTitle:'Acceso por API',machineBody:'Utiliza el endpoint JSON equivalente para aplicaciones, agentes, sitios e integraciones. Se conservan los mismos filtros.',church:'Iglesia',region:'Región',category:'Categoría',all:'Todas',global:'Global',year:'Año',subscriptionUrl:'URL de suscripción',apiUrl:'URL de la API JSON',copy:'Copiar',copied:'Copiado',downloadYear:'Descargar ICS anual',openApi:'Abrir guía de API',openJson:'Abrir JSON',refreshNote:'Cada aplicación externa decide la frecuencia de actualización. Santos do Dia publica una recomendación de seis horas en el feed.',calendarName:'Calendario litúrgico Santos do Dia'},
  it:{eyebrow:'Iscriviti una volta · resta aggiornato',title:'Sincronizza il calendario liturgico',intro:'Crea un abbonamento persistente dagli stessi dati revisionati che alimentano Oggi e il calendario. Scegli Chiesa, regione e categoria e sincronizza con la tua agenda oppure usa l’API JSON equivalente.',liveTitle:'Abbonamento continuo',liveBody:'È l’opzione consigliata. L’indirizzo resta stabile e serve l’anno corrente e quello successivo, così l’app di calendario può aggiornarlo.',snapshotTitle:'Snapshot annuale',snapshotBody:'Scarica un anno civile fisso in formato ICS per archivio, importazione o uso offline.',machineTitle:'Accesso API',machineBody:'Usa l’endpoint JSON equivalente per applicazioni, agenti, siti e integrazioni. Gli stessi filtri vengono mantenuti.',church:'Chiesa',region:'Regione',category:'Categoria',all:'Tutte',global:'Globale',year:'Anno',subscriptionUrl:'URL di abbonamento',apiUrl:'URL API JSON',copy:'Copia',copied:'Copiato',downloadYear:'Scarica ICS annuale',openApi:'Apri guida API',openJson:'Apri JSON',refreshNote:'Ogni app esterna decide la frequenza di aggiornamento. Santos do Dia pubblica nel feed una raccomandazione di sei ore.',calendarName:'Calendario liturgico Santos do Dia'},
};

function validTradition(value:string|null): value is Tradition { return Boolean(value && TRADITIONS.includes(value as Tradition)); }
function validCategory(value:string|null): value is Category { return Boolean(value && CATEGORIES.includes(value as Category)); }

export default function CalendarSyncCenter(){
  const { locale, copy, country, church } = useLanguage();
  const text = labels[locale] ?? labels.en!;
  const currentYear = new Date().getUTCFullYear();
  const [selectedChurch,setSelectedChurch] = useState<ChurchPreference>(church);
  const [selectedCountry,setSelectedCountry] = useState(country ?? 'GLOBAL');
  const [regionTouched,setRegionTouched] = useState(false);
  const [category,setCategory] = useState<'all'|Category>('all');
  const [year,setYear] = useState(currentYear);
  const [countries,setCountries] = useState<Country[]>([]);
  const [copied,setCopied] = useState<'subscription'|'api'|null>(null);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const tradition = params.get('tradition');
    const requestedCountry = params.get('country');
    const requestedCategory = params.get('category');
    if(validTradition(tradition)) setSelectedChurch(tradition);
    if(requestedCountry && /^[A-Z]{2}$/i.test(requestedCountry)) { setSelectedCountry(requestedCountry.toUpperCase()); setRegionTouched(true); }
    if(validCategory(requestedCategory)) setCategory(requestedCategory);
  },[]);
  useEffect(()=>{ if(!regionTouched && country && selectedCountry==='GLOBAL') setSelectedCountry(country); },[country,regionTouched,selectedCountry]);
  useEffect(()=>{
    fetch('/api/v1/religious-holidays?mode=countries')
      .then(response=>response.ok?response.json():null)
      .then(payload=>{ if(Array.isArray(payload?.data)) setCountries(payload.data); })
      .catch(()=>undefined);
  },[]);

  const feedPath = useMemo(()=>{
    const feed = selectedChurch==='all'?'all':selectedChurch;
    const params = new URLSearchParams({locale});
    if(selectedCountry!=='GLOBAL') params.set('country',selectedCountry);
    if(category!=='all') params.set('category',category);
    return `/api/ical/${feed}?${params}`;
  },[selectedChurch,selectedCountry,category,locale]);
  const snapshotPath = useMemo(()=>`${feedPath}&year=${year}`,[feedPath,year]);
  const apiPath = useMemo(()=>{
    const params = new URLSearchParams({year:String(year),locale});
    if(selectedChurch!=='all') params.set('tradition',selectedChurch);
    if(selectedCountry!=='GLOBAL') params.set('country',selectedCountry);
    if(category!=='all') params.set('category',category);
    return `/api/v1/observances?${params}`;
  },[selectedChurch,selectedCountry,category,locale,year]);
  const subscriptionUrl = `${SITE_ORIGIN}${feedPath}`;
  const apiUrl = `${SITE_ORIGIN}${apiPath}`;
  const regionNames = new Intl.DisplayNames([locale],{type:'region'});

  async function copyValue(kind:'subscription'|'api',value:string){
    try { await navigator.clipboard.writeText(value); setCopied(kind); window.setTimeout(()=>setCopied(null),1600); } catch { setCopied(null); }
  }

  return <div className="page-stack">
    <section className="page-hero compact-hero">
      <div><span className="eyebrow">{text.eyebrow}</span><h1>{text.title}</h1><p>{text.intro}</p></div>
      <div className="hero-symbol" aria-hidden="true">↻</div>
    </section>

    <section className="filter-panel" aria-label={text.title}>
      <div className="filter-group"><label>{text.church}</label><select value={selectedChurch} onChange={event=>setSelectedChurch(event.target.value as ChurchPreference)}><option value="all">{text.all}</option>{TRADITIONS.map(value=><option key={value} value={value}>{traditionLabel(copy,value)}</option>)}</select></div>
      <div className="filter-group"><label>{text.region}</label><select value={selectedCountry} onChange={event=>{setRegionTouched(true);setSelectedCountry(event.target.value);}}><option value="GLOBAL">{text.global}</option>{countries.map(value=><option key={value.countryCode} value={value.countryCode}>{regionNames.of(value.countryCode) ?? value.name}</option>)}</select></div>
      <div className="filter-group"><label>{text.category}</label><select value={category} onChange={event=>setCategory(event.target.value as 'all'|Category)}><option value="all">{text.all}</option>{CATEGORIES.map(value=><option key={value} value={value}>{copy[value]}</option>)}</select></div>
      <div className="filter-group"><label>{text.year}</label><select value={year} onChange={event=>setYear(Number(event.target.value))}>{Array.from({length:5},(_,index)=>currentYear-1+index).map(value=><option key={value} value={value}>{value}</option>)}</select></div>
    </section>

    <section className="institutional-grid">
      <article className="institutional-card"><span className="eyebrow">ICS · webcal · Apple · Google · Outlook</span><h2>{text.liveTitle}</h2><p>{text.liveBody}</p><AddToCalendar feedPath={feedPath} title={text.calendarName}/><p><strong>{text.subscriptionUrl}</strong></p><p className="machine-url"><code>{subscriptionUrl}</code></p><button className="btn btn-tertiary" type="button" onClick={()=>copyValue('subscription',subscriptionUrl)}>{copied==='subscription'?text.copied:text.copy}</button><small>{text.refreshNote}</small></article>
      <article className="institutional-card"><span className="eyebrow">ICS · {year}</span><h2>{text.snapshotTitle}</h2><p>{text.snapshotBody}</p><a className="btn btn-secondary" href={snapshotPath} download>{text.downloadYear}</a></article>
      <article className="institutional-card"><span className="eyebrow">JSON · OpenAPI</span><h2>{text.machineTitle}</h2><p>{text.machineBody}</p><p><strong>{text.apiUrl}</strong></p><p className="machine-url"><code>{apiUrl}</code></p><div className="button-row"><a className="btn btn-secondary" href={apiPath} target="_blank" rel="noreferrer">{text.openJson}</a><a className="btn btn-secondary" href="/calendar/api">{text.openApi}</a><button className="btn btn-tertiary" type="button" onClick={()=>copyValue('api',apiUrl)}>{copied==='api'?text.copied:text.copy}</button></div></article>
    </section>
  </div>;
}
