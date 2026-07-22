'use client';
import { SOURCE_CATALOG, traditionLabel } from '../../data/observances';
import { useLanguage } from '../components/LanguageProvider';

export default function SourcesPage(){
  const{copy}=useLanguage();
  const method=[
    [copy.sourcesTitle,copy.sourcesIntro],
    [copy.tradition,copy.disclaimer],
    [copy.validation,copy.machineAccessIntro]
  ];
  return <div className="page-stack">
    <section className="page-hero compact-hero"><div><span className="eyebrow">OSINT · provenance · validation</span><h1>{copy.sourcesTitle}</h1><p>{copy.sourcesIntro}</p></div><div className="hero-symbol">◎</div></section>
    <section className="method-grid">{method.map(([title,body],index)=><article className="method-card" key={title}><span>0{index+1}</span><h2>{title}</h2><p>{body}</p></article>)}</section>
    <section className="source-list-section">
      <div className="section-heading"><div><span className="eyebrow">{copy.methodology}</span><h2>{copy.navSources}</h2></div></div>
      <div className="source-list">{SOURCE_CATALOG.map(source=><article className="source-card" key={source.id}><div>
        <span className="source-kind">{source.kind==='official'?copy.sourceOfficial:copy.sourceReference}</span>
        <h3>{source.name}</h3>
        <p>{source.authority} · {source.updateMode}</p>
        <div className="tag-row">{source.traditions.map(value=><span key={value}>{traditionLabel(copy,value)}</span>)}</div>
      </div><a className="text-link" href={source.url} target="_blank" rel="noreferrer">{copy.navSources} ↗</a></article>)}</div>
    </section>
    <section className="notice-card"><strong>{copy.beta}</strong><p>{copy.disclaimer}</p></section>
  </div>;
}
