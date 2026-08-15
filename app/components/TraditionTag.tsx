'use client';

import Link from 'next/link';
import { traditionClass, traditionLabel, type Tradition } from '../../data/observances';
import { useLanguage } from './LanguageProvider';

export default function TraditionTag({tradition,compact=false}:{tradition:Tradition;compact?:boolean}){
  const {copy}=useLanguage();
  return <Link
    className={`tradition-tag ${traditionClass(tradition)}${compact?' compact':''}`}
    href={`/explore?tradition=${encodeURIComponent(tradition)}`}
    aria-label={`${copy.tradition}: ${traditionLabel(copy,tradition)}`}
  >
    <span className="tradition-tag-dot" aria-hidden="true"/>
    {traditionLabel(copy,tradition)}
  </Link>;
}
