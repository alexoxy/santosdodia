'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getRetentionCopy } from '../../lib/product-retention-i18n';
import { SAVED_SAINTS_EVENT, SAVED_SAINTS_STORAGE_KEY, type SavedSaint } from './SaveSaintButton';
import { useLanguage } from './LanguageProvider';

function readSaved(): SavedSaint[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_SAINTS_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function SavedSaintsList() {
  const { locale } = useLanguage();
  const [items, setItems] = useState<SavedSaint[]>([]);
  const copy = getRetentionCopy(locale);

  useEffect(() => {
    const sync = () => setItems(readSaved());
    sync();
    window.addEventListener(SAVED_SAINTS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SAVED_SAINTS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  function remove(id: string) {
    const next = readSaved().filter(item => item.id !== id);
    window.localStorage.setItem(SAVED_SAINTS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SAVED_SAINTS_EVENT));
    setItems(next);
  }

  return <section className="saved-saints-panel">
    <div className="section-heading compact"><div><span className="eyebrow">SantosDia</span><h1>{copy.savedTitle}</h1></div></div>
    {items.length ? <div className="saved-saints-list">
      {items.map(item => <article className="saved-saint-card" key={item.id}>
        <div>
          <h2><Link href={item.href}>{item.name}</Link></h2>
          {item.dateISO ? <p>{item.dateISO.slice(5)}</p> : null}
        </div>
        <button type="button" className="text-link saved-remove" onClick={() => remove(item.id)}>{copy.remove}</button>
      </article>)}
    </div> : <div className="empty-state saved-empty"><span>☆</span><p>{copy.savedEmpty}</p><small>{copy.savedEmptyHint}</small><Link className="btn btn-primary" href="/explore">{copy.discoverSaints}</Link></div>}
  </section>;
}
