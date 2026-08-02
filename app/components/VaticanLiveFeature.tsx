'use client';
import { useState } from 'react';
import { getFeatureCopy } from '../../lib/feature-copy';
import { useLanguage } from './LanguageProvider';

const CHANNEL_ID='UC7E-LYc1wivk33iyt5bR5zQ';
const LIVE_URL='https://www.youtube.com/@VaticanNews/live';
const OFFICIAL_URL='https://www.vaticannews.va/pt/epg.html';

export default function VaticanLiveFeature(){
 const{locale}=useLanguage();const copy=getFeatureCopy(locale);const[enabled,setEnabled]=useState(false);
 return <section className="vatican-live-feature" aria-labelledby="vatican-live-title">
  <div className="vatican-live-copy"><span className="eyebrow">Vatican Media · official stream</span><h2 id="vatican-live-title">{copy.liveTitle}</h2><p>{copy.liveIntro}</p><div className="vatican-live-actions">{enabled?<a className="text-link" href={LIVE_URL} target="_blank" rel="noreferrer">{copy.openLive} →</a>:<button className="btn btn-primary" type="button" onClick={()=>setEnabled(true)}>{copy.openLive}</button>}<a className="btn btn-secondary" href={OFFICIAL_URL} target="_blank" rel="noreferrer">{copy.officialSource}</a></div></div>
  <div className="vatican-live-media">{enabled?<iframe src={`https://www.youtube-nocookie.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=0`} title="Vatican News official live stream" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>:<button type="button" className="vatican-live-placeholder" onClick={()=>setEnabled(true)} aria-label={copy.openLive}><span aria-hidden="true">▶</span><strong>Vatican News</strong><small>{copy.liveFallback}</small></button>}</div>
  <style jsx>{`
   .vatican-live-feature{display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;padding:clamp(28px,5vw,52px);border-radius:26px;background:#fff;border:1px solid rgba(16,42,67,.08);box-shadow:0 16px 48px rgba(8,27,44,.08)}
   .vatican-live-copy{align-self:center}.vatican-live-copy h2{margin:8px 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:500;line-height:1.05}.vatican-live-copy p{margin:0;color:#637080}.vatican-live-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:24px}
   .vatican-live-media{aspect-ratio:16/9;overflow:hidden;border-radius:20px;background:#081b2c}.vatican-live-media iframe{width:100%;height:100%;border:0}.vatican-live-placeholder{width:100%;height:100%;display:grid;place-items:center;align-content:center;gap:8px;border:0;background:radial-gradient(circle at center,rgba(216,179,92,.2),transparent 36%),#081b2c;color:#fff;cursor:pointer}.vatican-live-placeholder span{width:72px;height:72px;display:grid;place-items:center;border-radius:50%;background:#d8b35c;color:#081b2c;font-size:1.5rem}.vatican-live-placeholder strong{font-family:Georgia,'Times New Roman',serif;font-size:1.5rem;font-weight:500}.vatican-live-placeholder small{color:rgba(255,255,255,.65)}
   @media(max-width:800px){.vatican-live-feature{grid-template-columns:1fr}.vatican-live-media{order:-1}}
  `}</style>
 </section>
}
