'use client';

import { useEffect, useState } from 'react';

type Props = {
  dateISO: string;
};

function getStorageKey(dateISO: string) {
  return `santosdodia:candle:${dateISO}`;
}

export default function CandleButton({ dateISO }: Props) {
  const [count, setCount] = useState(0);
  const [hasLit, setHasLit] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasLit(false);
    setCount(0);
    try {
      const raw = window.localStorage.getItem(getStorageKey(dateISO));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { count?: number; lastLit?: string };
      if (typeof parsed.count === 'number' && parsed.count >= 0) {
        setCount(parsed.count);
      }
      if (parsed.lastLit) {
        const today = new Date().toISOString().slice(0, 10);
        if (parsed.lastLit === today) {
          setHasLit(true);
        }
      }
    } catch {
      // ignora leituras inválidas
    }
  }, [dateISO]);

  function persist(nextCount: number, lit: boolean) {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        count: nextCount,
        lastLit: lit ? new Date().toISOString().slice(0, 10) : undefined
      };
      window.localStorage.setItem(getStorageKey(dateISO), JSON.stringify(payload));
    } catch {
      // storage pode falhar (modo incógnito), ignoramos
    }
  }

  function handleClick() {
    if (hasLit) return;
    const next = count + 1;
    setCount(next);
    setHasLit(true);
    persist(next, true);
  }

  return (
    <div className="candle-widget">
      <button className="btn btn-primary" onClick={handleClick} disabled={hasLit}>
        {hasLit ? 'Vela acesa' : 'Acender vela'}
      </button>
      <span className="candle-counter" aria-live="polite">
        {count === 0 ? 'Ainda ninguém acendeu uma vela hoje.' : `${count} vela${count > 1 ? 's' : ''} acesa${count > 1 ? 's' : ''} no teu dispositivo.`}
      </span>
    </div>
  );
}
