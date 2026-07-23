'use client';
import { TRADITIONS,traditionLabel } from '../../data/observances';
import { getFeatureCopy } from '../../lib/feature-copy';
import { useLanguage } from './LanguageProvider';

export default function TraditionFeeds(){const{locale,copy}=useLanguage();const feature=getFeatureCopy(locale);return <section className="source-list-section tradition-feeds"><div className="section-heading"><div><span className="eyebrow">ICS · Apple · Google · Outlook</span><h2>{feature.calendarByTradition}</h2><p>{feature.calendarByTraditionIntro}</p></div></div><div className="tradition-feed-grid">{TRADITIONS.map(tradition=><article className="tradition-feed-card" key={tradition}><strong>{traditionLabel(copy,tradition)}</strong><a className="btn btn-secondary" href={`/api/ical/${tradition}?locale=${locale}`}>{feature.subscribe}</a></article>)}</div></section>}
