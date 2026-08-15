'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { ADSENSE_CLIENT, ADSENSE_ENABLED, adsenseScriptAllowed } from '../../lib/adsense';

export default function AdSenseBootstrap({ force = false }: { force?: boolean }) {
  const pathname = usePathname();
  if (!ADSENSE_ENABLED || (!force && !adsenseScriptAllowed(pathname))) return null;

  return (
    <Script
      id="adsense-bootstrap"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
    />
  );
}
