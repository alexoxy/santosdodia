import { ADSENSE_CLIENT, ADSENSE_CODE_ENABLED } from '../../lib/adsense';

// This component belongs in <head>. It is deliberately controlled separately
// from ad serving so the site can be associated/reviewed by AdSense before any
// manual unit is enabled. Auto ads are then managed from the AdSense console.
export default function AdSenseBootstrap() {
  if (!ADSENSE_CODE_ENABLED) return null;

  return (
    <>
      <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
      <script
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
      />
    </>
  );
}
