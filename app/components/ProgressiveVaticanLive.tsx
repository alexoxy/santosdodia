'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { getFeatureCopy } from '../../lib/feature-copy';
import { getVaticanLiveCopy } from '../../lib/vatican-live-copy';
import { getNetworkConnection, isConstrainedConnection } from '../../lib/network-mode';
import { useLanguage } from './LanguageProvider';

const VaticanLiveFeature = dynamic(() => import('./VaticanLiveFeature'), {
  ssr: false,
  loading: () => <div className="progressive-live-loading" aria-live="polite">…</div>
});

export default function ProgressiveVaticanLive() {
  const { locale } = useLanguage();
  const copy = getFeatureCopy(locale);
  const vatican = getVaticanLiveCopy(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [constrained, setConstrained] = useState(false);

  useEffect(() => {
    const connection = getNetworkConnection();
    const update = () => {
      const next = isConstrainedConnection(connection);
      setConstrained(next);
      document.documentElement.dataset.network = next ? 'constrained' : 'standard';
    };

    update();
    connection?.addEventListener?.('change', update);
    return () => connection?.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (ready || constrained || !containerRef.current) return;
    if (!('IntersectionObserver' in window)) {
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px 0px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [constrained, ready]);

  return <div ref={containerRef} className="progressive-live-shell">
    {ready ? <VaticanLiveFeature /> : <section className="progressive-live-placeholder" aria-labelledby="progressive-live-title">
      <div>
        <span className="eyebrow">{vatican.eyebrow}</span>
        <h2 id="progressive-live-title">{vatican.title}</h2>
        <p>{constrained ? copy.liveFallback : vatican.intro}</p>
      </div>
      <div className="button-row">
        <button className="btn btn-secondary" type="button" onClick={() => setReady(true)}>{copy.openLive}</button>
        <a className="text-link" href="/live">{vatican.otherLives} →</a>
      </div>
    </section>}
  </div>;
}
