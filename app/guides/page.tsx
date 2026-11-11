import type { Metadata } from 'next';
import Link from 'next/link';
import { EDITORIAL_GUIDES,getEditorialGuideCopy } from '../../data/editorial-guides';
import { requestPublicLocale } from '../../lib/request-public-locale';
import styles from '../components/EditorialGuideView.module.css';

const labels={
 en:{eyebrow:'Editorial guides',title:'Explore saints, feasts and traditions through connected stories',lead:'Curated guides built from substantive profiles, verified calendar entries and visible sources. These pages group related material without turning tradition or devotion into unsupported facts.',open:'Open guide'},
 pt:{eyebrow:'Guias editoriais',title:'Explore santos, festas e tradições através de histórias ligadas entre si',lead:'Guias curados a partir de perfis substantivos, entradas de calendário verificadas e fontes visíveis. Estas páginas agrupam conteúdos relacionados sem transformar tradição ou devoção em factos não sustentados.',open:'Abrir guia'},
 es:{eyebrow:'Guías editoriales',title:'Explora santos, fiestas y tradiciones mediante historias conectadas',lead:'Guías seleccionadas a partir de perfiles sustantivos, entradas de calendario verificadas y fuentes visibles. Estas páginas agrupan contenidos relacionados sin convertir tradición o devoción en hechos no fundamentados.',open:'Abrir guía'},
 it:{eyebrow:'Guide editoriali',title:'Esplora santi, feste e tradizioni attraverso storie collegate',lead:'Guide curate a partire da profili sostanziali, voci di calendario verificate e fonti visibili. Queste pagine raggruppano materiali collegati senza trasformare tradizione o devozione in fatti non documentati.',open:'Apri guida'}
} as const;

export async function generateMetadata():Promise<Metadata>{const locale=await requestPublicLocale();const copy=labels[locale as keyof typeof labels]??labels.en;return{title:copy.eyebrow,description:copy.lead,alternates:{canonical:'/guides'},openGraph:{title:copy.title,description:copy.lead,url:'/guides',type:'website'}}}

export default async function GuidesPage(){const locale=await requestPublicLocale();const copy=labels[locale as keyof typeof labels]??labels.en;return <div className={styles.page}><section className={styles.hero}><div><span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.lead}</p></div><div className={styles.heroMark} aria-hidden="true">✦</div></section><section className={styles.profileGrid}>{EDITORIAL_GUIDES.map(guide=>{const guideCopy=getEditorialGuideCopy(guide,locale);return <Link className={styles.profileCard} key={guide.slug} href={`/guides/${guide.slug}`}><span className="eyebrow">{copy.eyebrow}</span><h2>{guideCopy.title}</h2><p>{guideCopy.lead}</p><span>{copy.open} →</span></Link>})}</section></div>}
