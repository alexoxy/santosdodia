'use client';

import { getInstitutionalCopy,type InstitutionalPageKind } from '../../lib/institutional-copy';
import { italianInstitutionalCopy } from '../../lib/institutional-copy-it';
import { useLanguage } from './LanguageProvider';

const REPORT_URL='https://github.com/alexoxy/santosdodia/issues/new';

export default function InstitutionalPage({kind}:{kind:InstitutionalPageKind}){
 const{locale}=useLanguage();
 const inherited=locale==='it'?null:getInstitutionalCopy(locale);
 const copy=locale==='it'?italianInstitutionalCopy:inherited!;
 const fallbackNotice=inherited?.fallbackNotice;
 const page=copy.pages[kind];
 return <div className="page-stack institutional-page">
  <section className="page-hero compact-hero institutional-hero"><div><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.intro}</p><small>{copy.updated}</small></div><div className="hero-symbol" aria-hidden="true">§</div></section>
  {fallbackNotice?<section className="notice-card" role="status"><strong>{fallbackNotice}</strong></section>:null}
  {page.sections?<section className="institutional-grid">{page.sections.map(section=><article className="institutional-card" key={section.title}><h2>{section.title}</h2>{section.body.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{section.items?<ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul>:null}</article>)}</section>:null}
  {page.faqs?<section className="faq-list">{page.faqs.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>:null}
  {kind==='corrections'?<section className="correction-action"><a className="btn btn-primary" href={REPORT_URL} target="_blank" rel="noreferrer">{copy.report} ↗</a></section>:null}
 </div>;
}