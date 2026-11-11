import Link from 'next/link';
import { getAnnualDateEditorial } from '../../data/date-editorial-registry';
import { getEditorialGuideCopy, getEditorialGuide, type EditorialGuide } from '../../data/editorial-guides';
import { SOURCE_CATALOG } from '../../data/observances';
import { getSaintBiography, getSaintBiographyRecord } from '../../data/saint-biography-registry';
import { isSaintBiographyIndexable } from '../../lib/editorial-profile-quality';
import type { Locale } from '../../lib/i18n';
import { getPublicAllObservances } from '../../lib/public-observances';
import styles from './EditorialGuideView.module.css';

const guideUi={
 en:{sourceNote:(count:number)=>`${count} verified institutional or calendar sources are reused from the linked records. Open each profile or date for claim-level context.`,people:'People · biography · evidence',profile:'Profile',openProfile:'Open profile',calendar:'Calendar · annual context',provenance:'Provenance · audit trail',calendarSource:'Calendar',biographySource:'Biography',openSource:'Open source',continue:'Continue exploring',related:'Related editorial guides'},
 pt:{sourceNote:(count:number)=>`${count} fontes institucionais ou de calendário verificadas são reutilizadas a partir dos registos ligados. Abra cada perfil ou data para consultar o contexto das afirmações.`,people:'Pessoas · biografia · evidência',profile:'Perfil',openProfile:'Abrir perfil',calendar:'Calendário · contexto anual',provenance:'Proveniência · pista de auditoria',calendarSource:'Calendário',biographySource:'Biografia',openSource:'Abrir fonte',continue:'Continuar a explorar',related:'Guias editoriais relacionados'},
 es:{sourceNote:(count:number)=>`${count} fuentes institucionales o de calendario verificadas se reutilizan desde los registros enlazados. Abre cada perfil o fecha para consultar el contexto de las afirmaciones.`,people:'Personas · biografía · evidencia',profile:'Perfil',openProfile:'Abrir perfil',calendar:'Calendario · contexto anual',provenance:'Procedencia · pista de auditoría',calendarSource:'Calendario',biographySource:'Biografía',openSource:'Abrir fuente',continue:'Seguir explorando',related:'Guías editoriales relacionadas'},
 it:{sourceNote:(count:number)=>`${count} fonti istituzionali o di calendario verificate sono riutilizzate dai record collegati. Apri ogni profilo o data per il contesto delle singole affermazioni.`,people:'Persone · biografia · prove',profile:'Profilo',openProfile:'Apri profilo',calendar:'Calendario · contesto annuale',provenance:'Provenienza · traccia di verifica',calendarSource:'Calendario',biographySource:'Biografia',openSource:'Apri fonte',continue:'Continua a esplorare',related:'Guide editoriali correlate'}
} as const;

function dateLabel(monthDay:string,locale:Locale){
 const year=new Date().getUTCFullYear();
 const [month,day]=monthDay.split('-').map(Number);
 return new Intl.DateTimeFormat(locale,{month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,day)));
}

function guideSources(guide:EditorialGuide,locale:Locale,ui:typeof guideUi.en){
 const year=new Date().getUTCFullYear();
 const observances=getPublicAllObservances(year,locale).filter(item=>guide.observanceIds.includes(item.id));
 const calendarSources=observances.flatMap(item=>item.sourceIds).map(id=>SOURCE_CATALOG.find(source=>source.id===id)).filter((source):source is NonNullable<typeof source>=>Boolean(source)).map(source=>({name:source.name,url:source.url,publisher:source.authority,kind:ui.calendarSource}));
 const biographySources=guide.profileIds.flatMap(id=>getSaintBiographyRecord(id)?.sources??[]).map(source=>({name:source.name,url:source.url,publisher:source.publisher,kind:ui.biographySource}));
 return [...new Map([...calendarSources,...biographySources].map(source=>[source.url,source])).values()];
}

export default function EditorialGuideView({guide,locale}:{guide:EditorialGuide;locale:Locale}){
 const copy=getEditorialGuideCopy(guide,locale);
 const ui=(guideUi[locale as keyof typeof guideUi]??guideUi.en) as typeof guideUi.en;
 const profiles=guide.profileIds.map(id=>({id,record:getSaintBiographyRecord(id),biography:getSaintBiography(id,locale)})).filter(item=>Boolean(item.record&&item.biography&&isSaintBiographyIndexable(item.record,locale))) as Array<{id:string;record:NonNullable<ReturnType<typeof getSaintBiographyRecord>>;biography:NonNullable<ReturnType<typeof getSaintBiography>>}>;
 const sources=guideSources(guide,locale,ui);
 const related=guide.relatedSlugs.map(slug=>getEditorialGuide(slug)).filter((item):item is EditorialGuide=>Boolean(item));
 return <div className={styles.page}>
  <section className={styles.hero}><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.lead}</p></div><div className={styles.heroMark} aria-hidden="true">✦</div></section>
  <section className={styles.article}><article className={styles.body}>{copy.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</article><aside className={styles.rail}><h2>{copy.sourcesTitle}</h2><p>{ui.sourceNote(sources.length)}</p></aside></section>
  <section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">{ui.people}</span><h2>{copy.profilesTitle}</h2></div></div><div className={styles.profileGrid}>{profiles.map(({id,biography})=><Link className={styles.profileCard} href={`/saint/${encodeURIComponent(id)}`} key={id}><span className="eyebrow">{ui.profile}</span><h3>{biography.title}</h3><p>{biography.summary}</p><span>{ui.openProfile} →</span></Link>)}</div></section>
  <section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">{ui.calendar}</span><h2>{copy.datesTitle}</h2></div></div><div className={styles.dateGrid}>{guide.monthDays.map(monthDay=>{const editorial=getAnnualDateEditorial(monthDay,locale);return <Link className={styles.dateCard} href={`/date/${monthDay}`} key={monthDay}><strong>{editorial?.title??dateLabel(monthDay,locale)}</strong><p>{editorial?.lead??dateLabel(monthDay,locale)}</p></Link>})}</div></section>
  <section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">{ui.provenance}</span><h2>{copy.sourcesTitle}</h2></div></div><div className={styles.sources}>{sources.map(source=><article className={styles.source} key={source.url}><strong>{source.name}</strong><small>{source.kind} · {source.publisher}</small><a className="text-link" href={source.url} target="_blank" rel="noreferrer">{ui.openSource} ↗</a></article>)}</div></section>
  {related.length?<section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">{ui.continue}</span><h2>{ui.related}</h2></div></div><div className={styles.related}>{related.map(item=>{const itemCopy=getEditorialGuideCopy(item,locale);return <Link key={item.slug} href={`/guides/${item.slug}`}>{itemCopy.title}</Link>})}</div></section>:null}
 </div>;
}
