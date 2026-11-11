'use client';

import { ADSENSE_CODE_ENABLED } from '../../lib/adsense';
import { useLanguage } from './LanguageProvider';

const labels = {
  en: 'Privacy and cookie settings', es: 'Privacidad y cookies', pt: 'Privacidade e cookies', it: 'Privacy e cookie', fr: 'Confidentialité et cookies',
  de: 'Datenschutz und Cookies', pl: 'Prywatność i pliki cookie', ru: 'Конфиденциальность и cookie', fil: 'Privacy at cookies', sw: 'Faragha na vidakuzi',
} as const;

type GoogleFc = { callbackQueue: Array<() => void>; showRevocationMessage?: () => void };
declare global { interface Window { googlefc?: GoogleFc } }

export default function PrivacyChoicesLink() {
  const { locale } = useLanguage();
  if (!ADSENSE_CODE_ENABLED) return null;
  return (
    <button
      className="text-link footer-privacy-button"
      style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }}
      type="button"
      onClick={() => {
        const fc = window.googlefc;
        if (!fc?.showRevocationMessage) {
          window.location.assign('/privacy#advertising-privacy-title');
          return;
        }
        fc.callbackQueue = fc.callbackQueue || [];
        fc.callbackQueue.push(fc.showRevocationMessage);
      }}
    >
      {labels[locale]}
    </button>
  );
}
