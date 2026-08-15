import type { Metadata } from 'next';
import CalendarProductNav from '../../components/CalendarProductNav';
import { requestPublicLocale } from '../../../lib/request-public-locale';
import { SITE_ORIGIN } from '../../../lib/site';

const copyByLocale = {
  en:{title:'Liturgical calendar API',intro:'The calendar is available as reviewed JSON data and as subscribable ICS feeds. Use the same filters across the website, API and calendar subscriptions.',observances:'Observances',observancesBody:'List a year, month or date and filter by Christian tradition, category and country.',today:'Today',todayBody:'Resolve the current or selected date using the same public calendar read model.',ics:'ICS subscription',icsBody:'Use a feed without year= for a persistent subscription. Add year= for a fixed annual snapshot.',openapi:'OpenAPI specification',openapiBody:'Machine-readable contract for supported endpoints and parameters.',examples:'Examples',open:'Open endpoint'},
  pt:{title:'API do calendário litúrgico',intro:'O calendário está disponível como dados JSON revistos e como feeds ICS subscrevíveis. Os mesmos filtros são usados no site, na API e nas subscrições.',observances:'Observâncias',observancesBody:'Liste um ano, mês ou data e filtre por tradição cristã, categoria e país.',today:'Hoje',todayBody:'Resolva a data atual ou uma data escolhida usando o mesmo modelo público de calendário.',ics:'Subscrição ICS',icsBody:'Use um feed sem year= para uma subscrição persistente. Acrescente year= para obter um snapshot anual fixo.',openapi:'Especificação OpenAPI',openapiBody:'Contrato legível por máquina com os endpoints e parâmetros suportados.',examples:'Exemplos',open:'Abrir endpoint'},
  es:{title:'API del calendario litúrgico',intro:'El calendario está disponible como datos JSON revisados y como feeds ICS suscribibles. Los mismos filtros se usan en el sitio, la API y las suscripciones.',observances:'Celebraciones',observancesBody:'Lista un año, mes o fecha y filtra por tradición cristiana, categoría y país.',today:'Hoy',todayBody:'Resuelve la fecha actual o una fecha seleccionada usando el mismo modelo público.',ics:'Suscripción ICS',icsBody:'Usa un feed sin year= para una suscripción persistente. Añade year= para una instantánea anual fija.',openapi:'Especificación OpenAPI',openapiBody:'Contrato legible por máquina con endpoints y parámetros compatibles.',examples:'Ejemplos',open:'Abrir endpoint'},
  it:{title:'API del calendario liturgico',intro:'Il calendario è disponibile come dati JSON revisionati e come feed ICS sottoscrivibili. Gli stessi filtri sono usati nel sito, nell’API e negli abbonamenti.',observances:'Osservanze',observancesBody:'Elenca un anno, mese o data e filtra per tradizione cristiana, categoria e paese.',today:'Oggi',todayBody:'Risolvi la data corrente o selezionata usando lo stesso modello pubblico del calendario.',ics:'Abbonamento ICS',icsBody:'Usa un feed senza year= per un abbonamento persistente. Aggiungi year= per uno snapshot annuale fisso.',openapi:'Specifica OpenAPI',openapiBody:'Contratto leggibile dalla macchina con endpoint e parametri supportati.',examples:'Esempi',open:'Apri endpoint'},
} as const;

export async function generateMetadata():Promise<Metadata>{
  const locale = await requestPublicLocale();
  const copy = copyByLocale[locale as keyof typeof copyByLocale] ?? copyByLocale.en;
  return {title:copy.title,description:copy.intro,alternates:{canonical:'/calendar/api'}};
}

export default async function CalendarApiPage(){
  const locale = await requestPublicLocale();
  const copy = copyByLocale[locale as keyof typeof copyByLocale] ?? copyByLocale.en;
  const examples = [
    {title:copy.observances,body:copy.observancesBody,path:'/api/v1/observances?year=2026&locale=pt&tradition=roman-catholic&country=PT'},
    {title:copy.today,body:copy.todayBody,path:'/api/v1/today?locale=pt&tradition=roman-catholic&country=PT'},
    {title:copy.ics,body:copy.icsBody,path:'/api/ical/roman-catholic?locale=pt&country=PT'},
    {title:copy.openapi,body:copy.openapiBody,path:'/openapi.json'},
  ];
  return <div className="page-stack">
    <CalendarProductNav/>
    <section className="page-hero compact-hero"><div><span className="eyebrow">JSON · ICS · OpenAPI</span><h1>{copy.title}</h1><p>{copy.intro}</p></div><div className="hero-symbol" aria-hidden="true">{'{}'}</div></section>
    <section className="source-list-section"><div className="section-heading"><div><span className="eyebrow">{copy.examples}</span><h2>{copy.title}</h2></div></div><div className="institutional-grid">{examples.map(example=><article className="institutional-card" key={example.path}><h2>{example.title}</h2><p>{example.body}</p><p className="machine-url"><code>{SITE_ORIGIN}{example.path}</code></p><a className="btn btn-secondary" href={example.path} target="_blank" rel="noreferrer">{copy.open}</a></article>)}</div></section>
  </div>;
}
