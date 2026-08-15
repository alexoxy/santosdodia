import Link from 'next/link';
import { getAnnualDateEditorial } from '../../data/date-editorial-registry';
import { getEditorialGuideCopy, getEditorialGuide, type EditorialGuide } from '../../data/editorial-guides';
import { SOURCE_CATALOG } from '../../data/observances';
import { getSaintBiography, getSaintBiographyRecord } from '../../data/saint-biography-registry';
import { isSaintBiographyIndexable } from '../../lib/editorial-profile-quality';
import type { Locale } from '../../lib/i18n';
import { getPublicAllObservances } from '../../lib/public-observances';
import styles from './EditorialGuideView.module.css';

function dateLabel(monthDay:string,locale:Locale){
 const year=new Date().getUTCFullYear();
 const [month,day]=monthDay.split('-').map(Number);
 return new Intl.DateTimeFormat(locale,{month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,day)));
}

function guideSources(guide:EditorialGuide,locale:Locale){
 const year=new Date().getUTCFullYear();
 const observances=getPublicAllObservances(year,locale).filter(item=>guide.observanceIds.includes(item.id));
 const calendarSources=observances.flatMap(item=>item.sourceIds).map(id=>SOURCE_CATALOG.find(source=>source.id===id)).filter((source):source is NonNullable<typeof source>=>Boolean(source)).map(source=>({name:source.name,url:source.url,publisher:source.authority,kind:'Calendar'}));
 const biographySources=guide.profileIds.flatMap(id=>getSaintBiographyRecord(id)?.sources??[]).map(source=>({name:source.name,url:source.url,publisher:source.publisher,kind:'Biography'}));
 return [...new Map([...calendarSources,...biographySources].map(source=>[source.url,source])).values()];
}

export default function EditorialGuideView({guide,locale}:{guide:EditorialGuide;locale:Locale}){
 const copy=getEditorialGuideCopy(guide,locale);
 const profiles=guide.profileIds.map(id=>({id,record:getSaintBiographyRecord(id),biography:getSaintBiography(id,locale)})).filter(item=>Boolean(item.record&&item.biography&&isSaintBiographyIndexable(item.record,locale))) as Array<{id:string;record:NonNullable<ReturnType<typeof getSaintBiographyRecord>>;biography:NonNullable<ReturnType<typeof getSaintBiography>>}>;
 const sources=guideSources(guide,locale);
 const related=guide.relatedSlugs.map(slug=>getEditorialGuide(slug)).filter((item):item is EditorialGuide=>Boolean(item));
 return <div className={styles.page}>
  <section className={styles.hero}><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.lead}</p></div><div className={styles.heroMark} aria-hidden="true">✦</div></section>
  <section className={styles.article}><article className={styles.body}>{copy.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</article><aside className={styles.rail}><h2>{copy.sourcesTitle}</h2><p>{sources.length} verified institutional or calendar sources are reused from the linked records. Open each profile or date for claim-level context.</p></aside></section>
  <section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">People · biography · evidence</span><h2>{copy.profilesTitle}</h2></div></div><div className={styles.profileGrid}>{profiles.map(({id,biography})=><Link className={styles.profileCard} href={`/saint/${encodeURIComponent(id)}`} key={id}><span className="eyebrow">Profile</span><h3>{biography.title}</h3><p>{biography.summary}</p><span>Open profile →</span></Link>)}</div></section>
  <section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">Calendar · annual context</span><h2>{copy.datesTitle}</h2></div></div><div className={styles.dateGrid}>{guide.monthDays.map(monthDay=>{const editorial=getAnnualDateEditorial(monthDay,locale);return <Link className={styles.dateCard} href={`/date/${monthDay}`} key={monthDay}><strong>{editorial?.title??dateLabel(monthDay,locale)}</strong><p>{editorial?.lead??dateLabel(monthDay,locale)}</p></Link>})}</div></section>
  <section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">Provenance · audit trail</span><h2>{copy.sourcesTitle}</h2></div></div><div className={styles.sources}>{sources.map(source=><article className={styles.source} key={source.url}><strong>{source.name}</strong><small>{source.kind} · {source.publisher}</small><a className="text-link" href={source.url} target="_blank" rel="noreferrer">Open source ↗</a></article>)}</div></section>
  {related.length?<section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">Continue exploring</span><h2>Related editorial guides</h2></div></div><div className={styles.related}>{related.map(item=>{const itemCopy=getEditorialGuideCopy(item,locale);return <Link key={item.slug} href={`/guides/${item.slug}`}>{itemCopy.title}</Link>})}</div></section>:null}
 </div>;
}