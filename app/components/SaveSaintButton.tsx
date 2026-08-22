'use client';

import { useEffect, useState } from 'react';

type SavedSaint = {
  id: string;
  name: string;
  dateISO?: string;
  href: string;
  savedAt: string;
};

const STORAGE_KEY = 'sdd-saved-saints-v1';
const EVENT_NAME = 'sdd-saved-saints-changed';

function readSaved(): SavedSaint[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string') : [];
  } catch {
    return [];
  }
}

function writeSaved(items: SavedSaint[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export default function SaveSaintButton({ id, name, dateISO, locale = 'en' }: { id: string; name: string; dateISO?: string; locale?: string }) {
  const [saved, setSaved] = useState(false);
  const labels = locale === 'pt'
    ? { save: 'Guardar santo', saved: 'Guardado', remove: 'Remover dos guardados' }
    : locale === 'es'
      ? { save: 'Guardar santo', saved: 'Guardado', remove: 'Quitar de guardados' }
      : locale === 'fr'
        ? { save: 'Enregistrer', saved: 'Enregistré', remove: 'Retirer des favoris' }
        : locale === 'it'
          ? { save: 'Salva santo', saved: 'Salvato', remove: 'Rimuovi dai salvati' }
          : { save: 'Save saint', saved: 'Saved', remove: 'Remove from saved' };

  useEffect(() => {
    const sync = () => setSaved(readSaved().some(item => item.id === id));
    sync();
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, [id]);

  function toggle() {
    const current = readSaved();
    if (current.some(item => item.id === id)) {
      writeSaved(current.filter(item => item.id !== id));
      setSaved(false);
      return;
    }
    writeSaved([
      { id, name, dateISO, href: `/saint/${encodeURIComponent(id)}`, savedAt: new Date().toISOString() },
      ...current,
    ].slice(0, 100));
    setSaved(true);
  }

  return <button
    type="button"
    className={`btn ${saved ? 'btn-primary save-saint-button is-saved' : 'btn-secondary save-saint-button'}`}
    aria-pressed={saved}
    aria-label={saved ? labels.remove : labels.save}
    onClick={toggle}
  >
    <span aria-hidden="true">{saved ? '★' : '☆'}</span> {saved ? labels.saved : labels.save}
  </button>;
}

export { EVENT_NAME as SAVED_SAINTS_EVENT, STORAGE_KEY as SAVED_SAINTS_STORAGE_KEY };
export type { SavedSaint };
