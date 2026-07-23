'use client';
import { SOURCE_CATALOG, traditionLabel } from '../../data/observances';
import type { Locale } from '../../lib/i18n';
import { ROMAN_SOURCE_STACK, type RomanSourceTier } from '../../lib/roman-source-stack';
import { useLanguage } from '../components/LanguageProvider';

const romanHeading:Record<Locale,string>={en:'Roman Catholic source hierarchy',es:'Jerarquía de fuentes católicas romanas',pt:'Hierarquia de fontes católicas romanas',fr:'Hiérarchie des sources catholiques romaines',fil:'Pagkakasunod-sunod ng mga sangguniang Romano Katoliko',ru:'Иерархия римско-католических источников',sw:'Mpangilio wa vyanzo vya Kikatoliki ya Roma',de:'Hierarchie römisch-katholischer Quellen',it:'Gerarchia delle fonti cattoliche romane',pl:'Hierarchia źródeł rzymskokatolickich'};
const tierLabels:Record<Locale,Record<RomanSourceTier,string>>={
 en:{primary:'Primary source','exact-mirror':'Exact local mirror','calculation-backup':'Independent calculation backup','official-validation':'Official validation'},
 es:{primary:'Fuente principal','exact-mirror':'Espejo local exacto','calculation-backup':'Cálculo independiente de respaldo','official-validation':'Validación oficial'},
 pt:{primary:'Fonte principal','exact-mirror':'Espelho local exato','calculation-backup':'Cálculo independente de reserva','official-validation':'Validação oficial'},
 fr:{primary:'Source principale','exact-mirror':'Miroir local exact','calculation-backup':'Calcul indépendant de secours','official-validation':'Validation officielle'},
 fil:{primary:'Pangunahing sanggunian','exact-mirror':'Eksaktong lokal na salamin','calculation-backup':'Malayang reserbang pagkalkula','official-validation':'Opisyal na pagpapatunay'},
 ru:{primary:'Основной источник','exact-mirror':'Точное локальное зеркало','calculation-backup':'Независимый резервный расчёт','official-validation':'Официальная проверка'},
 sw:{primary:'Chanzo kikuu','exact-mirror':'Nakala kamili ya ndani','calculation-backup':'Hesabu huru ya akiba','official-validation':'Uthibitishaji rasmi'},
 de:{primary:'Primärquelle','exact-mirror':'Exakter lokaler Spiegel','calculation-backup':'Unabhängige Ersatzberechnung','official-validation':'Amtliche Prüfung'},
 it:{primary:'Fonte principale','exact-mirror':'Mirror locale esatto','calculation-backup':'Calcolo indipendente di riserva','official-validation':'Validazione ufficiale'},
 pl:{primary:'Źródło główne','exact-mirror':'Dokładna kopia lokalna','calculation-backup':'Niezależne obliczenie zapasowe','official-validation':'Weryfikacja urzędowa'}
};

export default function SourcesPage(){
  const{copy,locale}=useLanguage();
  const method=[[copy.sourcesTitle,copy.sourcesIntro],[copy.tradition,copy.disclaimer],[copy.validation,copy.machineAccessIntro]];
  return <div className="page-stack">
    <section className="page-hero compact-hero"><div><span className="eyebrow">OSINT · provenance · validation</span><h1>{copy.sourcesTitle}</h1><p>{copy.sourcesIntro}</p></div><div className="hero-symbol">◎</div></section>
    <section className="method-grid">{method.map(([title,body],index)=><article className="method-card" key={title}><span>0{index+1}</span><h2>{title}</h2><p>{body}</p></article>)}</section>
    <section className="source-list-section"><div className="section-heading"><div><span className="eyebrow">LitCal · mirror · validation</span><h2>{romanHeading[locale]}</h2></div></div><div className="source-list">{ROMAN_SOURCE_STACK.map(source=><article className="source-card" key={source.id}><div><span className="source-kind">{tierLabels[locale][source.tier]}</span><h3>{source.name}</h3>{source.license?<div className="tag-row"><span>{source.license}</span></div>:null}</div><a className="text-link" href={source.url} target={source.url.startsWith('http')?'_blank':undefined} rel={source.url.startsWith('http')?'noreferrer':undefined}>{copy.navSources} ↗</a></article>)}</div></section>
    <section className="source-list-section"><div className="section-heading"><div><span className="eyebrow">{copy.methodology}</span><h2>{copy.navSources}</h2></div></div><div className="source-list">{SOURCE_CATALOG.map(source=><article className="source-card" key={source.id}><div><span className="source-kind">{source.kind==='official'?copy.sourceOfficial:copy.sourceReference}</span><h3>{source.name}</h3><div className="tag-row">{source.traditions.map(value=><span key={value}>{traditionLabel(copy,value)}</span>)}</div></div><a className="text-link" href={source.url} target="_blank" rel="noreferrer">{copy.navSources} ↗</a></article>)}</div></section>
    <section className="notice-card"><strong>{copy.beta}</strong><p>{copy.disclaimer}</p></section>
  </div>;
}
