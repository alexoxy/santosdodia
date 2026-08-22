'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { getRetentionCopy } from '../../lib/product-retention-i18n';

type SavedSaint = {
  id: string;
  dateISO?: string;
  savedAt: string;
};

const STORAGE_KEY = 'sdd-saved-saints-v1';
const EVENT_NAME = 'sdd-saved-saints-changed';

function readSavedSaints(): SavedSaint[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap(item => {
      if (!item || typeof item !== 'object') return [];
      const candidate = item as Record<string, unknown>;
      if (typeof candidate.id !== 'string' || !candidate.id.trim()) return [];
      return [{
        id: candidate.id,
        dateISO: typeof candidate.dateISO === 'string' ? candidate.dateISO : undefined,
        savedAt: typeof candidate.savedAt === 'string' ? candidate.savedAt : '',
      }];
    });
  } catch {
    return [];
  }
}

function writeSavedSaints(items: SavedSaint[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export default function SaveSaintButton({ id, dateISO, locale = 'en' }: { id: string; dateISO?: string; locale?: Locale }) {
  const [saved, setSaved] = useState(false);
  const labels = getRetentionCopy(locale);

  useEffect(() => {
    const sync = () => setSaved(readSavedSaints().some(item => item.id === id));
    sync();
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, [id]);

  function toggle() {
    const current = readSavedSaints();
    if (current.some(item => item.id === id)) {
      writeSavedSaints(current.filter(item => item.id !== id));
      setSaved(false);
      return;
    }
    writeSavedSaints([
      { id, dateISO, savedAt: new Date().toISOString() },
      ...current,
    ].slice(0, 100));
    setSaved(true);
  }

  return <button
    type="button"
    className={`btn ${saved ? 'btn-primary save-saint-button is-saved' : 'btn-secondary save-saint-button'}`}
    aria-pressed={saved}
    aria-label={saved ? labels.removeSaved : labels.saveSaint}
    onClick={toggle}
  >
    <span aria-hidden="true">{saved ? '★' : '☆'}</span> {saved ? labels.savedSaint : labels.saveSaint}
  </button>;
}

export {
  EVENT_NAME as SAVED_SAINTS_EVENT,
  STORAGE_KEY as SAVED_SAINTS_STORAGE_KEY,
  readSavedSaints,
  writeSavedSaints,
};
export type { SavedSaint };
