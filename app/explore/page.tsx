import type { Metadata } from "next";
import Link from "next/link";
import SearchExplorer from "../components/SearchExplorer";
import { getFeatureCopy } from "../../lib/feature-copy";
import { requestPublicLocale } from "../../lib/request-public-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestPublicLocale();
  const copy = getFeatureCopy(locale);
  return {
    title: copy.findTitle,
    description: copy.findIntro,
    alternates: { canonical: "/explore" },
  };
}

const guideCopy={
 en:{eyebrow:'Editorial discovery',title:'Explore connected stories',body:'Go beyond search results with curated guides that connect substantive biographies, feast days, traditions and sources without flattening different Churches into one calendar.',action:'Open editorial guides'},
 pt:{eyebrow:'Descoberta editorial',title:'Explore histórias ligadas entre si',body:'Vá além dos resultados de pesquisa com guias curados que ligam biografias substantivas, datas, tradições e fontes sem reduzir Igrejas diferentes a um único calendário.',action:'Abrir guias editoriais'},
 es:{eyebrow:'Descubrimiento editorial',title:'Explora historias conectadas',body:'Ve más allá de los resultados de búsqueda con guías seleccionadas que conectan biografías sustantivas, fechas, tradiciones y fuentes sin reducir Iglesias diferentes a un único calendario.',action:'Abrir guías editoriales'},
 it:{eyebrow:'Scoperta editoriale',title:'Esplora storie collegate',body:'Vai oltre i risultati di ricerca con guide curate che collegano biografie sostanziali, date, tradizioni e fonti senza ridurre Chiese diverse a un unico calendario.',action:'Apri le guide editoriali'}
} as const;

export default async function ExplorePage() {
  const locale=await requestPublicLocale();
  const copy=guideCopy[locale as keyof typeof guideCopy]??guideCopy.en;
  return <><SearchExplorer/><section className="notice-card"><span className="eyebrow">{copy.eyebrow}</span><h2>{copy.title}</h2><p>{copy.body}</p><Link className="btn btn-primary" href="/guides">{copy.action} →</Link></section></>;
}
