'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getObservanceById } from '../../data/discovery';
import { getSaintBiography } from '../../data/saint-biography-registry';
import { yearInTimeZone } from '../../lib/date-context';
import { displayObservanceName } from '../../lib/locale-display';
import { getRetentionCopy } from '../../lib/product-retention-i18n';
import {
  SAVED_SAINTS_EVENT,
  readSavedSaints,
  writeSavedSaints,
  type SavedSaint,
} from './SaveSaintButton';
import { useLanguage } from './LanguageProvider';

export default function SavedSaintsList() {
  const { locale, timeZone } = useLanguage();
  const [items, setItems] = useState<SavedSaint[]>([]);
  const copy = getRetentionCopy(locale);
  const year = yearInTimeZone(timeZone);
  const dateFormatter = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', timeZone: 'UTC' });

  useEffect(() => {
    const sync = () => setItems(readSavedSaints());
    sync();
    window.addEventListener(SAVED_SAINTS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SAVED_SAINTS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  function remove(id: string) {
    const next = readSavedSaints().filter(item => item.id !== id);
    writeSavedSaints(next);
    setItems(next);
  }

  return <section className="saved-saints-panel">
    <div className="section-heading compact"><div><span className="eyebrow">SantosDia</span><h1>{copy.savedTitle}</h1></div></div>
    {items.length ? <div className="saved-saints-list">
      {items.map(item => {
        const observance = getObservanceById(item.id, year, locale);
        const biography = getSaintBiography(item.id, locale);
        const name = observance
          ? displayObservanceName(observance.names, locale, observance.name)
          : biography?.title;
        const dateISO = observance?.dateISO ?? item.dateISO;
        const dateLabel = dateISO && /^\d{4}-\d{2}-\d{2}$/.test(dateISO)
          ? dateFormatter.format(new Date(`${dateISO}T00:00:00Z`))
          : undefined;
        return <article className="saved-saint-card" key={item.id}>
          <div>
            <h2><Link href={`/saint/${encodeURIComponent(item.id)}`}>{name || item.id}</Link></h2>
            {dateLabel ? <p>{dateLabel}</p> : null}
          </div>
          <button type="button" className="text-link saved-remove" onClick={() => remove(item.id)}>{copy.remove}</button>
        </article>;
      })}
    </div> : <div className="empty-state saved-empty"><span>☆</span><p>{copy.savedEmpty}</p><small>{copy.savedEmptyHint}</small><Link className="btn btn-primary" href="/explore">{copy.discoverSaints}</Link></div>}
  </section>;
}
