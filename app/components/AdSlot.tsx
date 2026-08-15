'use client';

import { useEffect } from 'react';
import { ADSENSE_CLIENT, ADSENSE_ENABLED, isValidAdSenseSlot } from '../../lib/adsense';
import { useLanguage } from './LanguageProvider';

const labels = {
  en: 'Advertisement', es: 'Publicidad', pt: 'Publicidade', it: 'Pubblicità', fr: 'Publicité',
  de: 'Anzeige', pl: 'Reklama', ru: 'Реклама', fil: 'Anunsyo', sw: 'Tangazo',
} as const;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ slot, placement }: { slot: string; placement: 'home' | 'profile' }) {
  const { locale } = useLanguage();
  const active = ADSENSE_ENABLED && isValidAdSenseSlot(slot);

  useEffect(() => {
    if (!active) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers and consent state may prevent initialization. Content must remain usable.
    }
  }, [active]);

  if (!active) return null;
  return (
    <aside
      className={`ad-slot ad-slot-${placement}`}
      aria-label={labels[locale]}
      style={{ marginBlock: '1.5rem', width: '100%', overflow: 'hidden' }}
    >
      <small className="ad-label" style={{ display: 'block', marginBottom: '.35rem', textAlign: 'center', opacity: .65 }}>{labels[locale]}</small>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
