'use client';
import { LIVE_STREAM_SOURCES } from '../../data/live-streams';
import { SOURCE_CATALOG,traditionLabel } from '../../data/observances';
import { getFeatureCopy } from '../../lib/feature-copy';
import { useLanguage } from './LanguageProvider';

export default function CopyrightSources(){
 const{locale,copy}=useLanguage();const feature=getFeatureCopy(locale);
 const sections=[
  [feature.copyrightContent,'The Santos do Dia interface, original editorial summaries, software structure and branding are project content unless another attribution is shown. Source code and third-party packages retain their respective licences.'],
  [feature.copyrightData,'Calendar dates, names, patronages and jurisdictional associations are attributed to the source records below. A source link is evidence of provenance, not permission to reproduce an entire third-party publication.'],
  [feature.copyrightImages,'Only public-domain, openly licensed or expressly authorised visual material should be published. Every image must retain author, source and licence metadata. No third-party image is currently required for the core experience.'],
  [feature.copyrightEmbeds,'Live video and recordings remain hosted by the originating institution or platform. Santos do Dia links to or embeds the authorised player and does not claim ownership of the broadcast.'],
  [feature.copyrightCorrections,'Rights holders and institutions may request a correction, updated attribution or removal through the project contact channel. Changes must be recorded in GitHub so that production remains reproducible.']
 ];
 return <div className="page-stack copyright-page">
  <section className="page-hero compact-hero"><div><span className="eyebrow">Copyright · provenance · licensing</span><h1>{feature.copyrightTitle}</h1><p>{feature.copyrightIntro}</p></div><div className="hero-symbol">©</div></section>
  <section className="rights-grid">{sections.map(([title,body],index)=><article className="rights-card" key={title}><span>0{index+1}</span><h2>{title}</h2><p>{body}</p></article>)}</section>
  <section className="source-list-section"><div className="section-heading"><div><span className="eyebrow">Calendar · patronage · validation</span><h2>{feature.copyrightData}</h2></div></div><div className="source-list">{SOURCE_CATALOG.map(source=><article className="source-card" key={source.id}><div><span className="source-kind">{source.kind==='official'?copy.sourceOfficial:copy.sourceReference}</span><h3>{source.name}</h3><p>{source.note}</p><div className="tag-row">{source.traditions.map(value=><span key={value}>{traditionLabel(copy,value)}</span>)}{source.licenseNote?<span>{source.licenseNote}</span>:null}</div></div><a className="text-link" href={source.url} target="_blank" rel="noreferrer">{copy.navSources} ↗</a></article>)}</div></section>
  <section className="source-list-section"><div className="section-heading"><div><span className="eyebrow">Live · archive · official media</span><h2>{feature.copyrightEmbeds}</h2></div></div><div className="source-list">{LIVE_STREAM_SOURCES.map(source=><article className="source-card" key={source.id}><div><span className="source-kind">{feature.officialSource}</span><h3>{source.organization}</h3><div className="tag-row"><span>{traditionLabel(copy,source.tradition)}</span><span>{feature.verifiedOn}: {source.verifiedAt}</span></div></div><a className="text-link" href={source.sourceUrl} target="_blank" rel="noreferrer">{feature.officialSource} ↗</a></article>)}</div></section>
  <section className="notice-card"><strong>{feature.copyrightNoAffiliation}</strong><p>{copy.disclaimer}</p></section>
 </div>;
}
