'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './DiscoveryViews.module.css';

type MapPoint = {
  id: string;
  entityId: string;
  qid?: string;
  name: string;
  relationType: string;
  placeId?: string;
  placeName?: string;
  historicalName?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  century?: number;
  anchorYear?: number;
  confidence?: number;
  sourceIds: string[];
};
type Summary = {
  centuries: Array<{ century: number; saintCount: number }>;
  countries: Array<{ countryCode: string; saintCount: number; placeCount: number }>;
};
type Api<T> = { ready: boolean; data: T; meta?: Record<string, unknown>; error?: string };

type Cluster = {
  key: string;
  latitude: number;
  longitude: number;
  points: MapPoint[];
};

function countryName(code: string) {
  try { return new Intl.DisplayNames(['pt-PT'], { type: 'region' }).of(code) ?? code; } catch { return code; }
}
function centuryLabel(value: number) { return value > 0 ? `Século ${roman(value)}` : `Século ${roman(Math.abs(value))} a.C.`; }
function roman(value: number) {
  const pairs: Array<[number, string]> = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let n = value; let out = '';
  for (const [number, glyph] of pairs) while (n >= number) { out += glyph; n -= number; }
  return out;
}
function relationLabel(value: string) {
  return ({ birth:'Nascimento', death:'Morte', burial:'Sepultura', activity:'Atividade', martyrdom:'Martírio', other:'Outro vínculo' } as Record<string,string>)[value] ?? value;
}
function x(longitude: number) { return ((longitude + 180) / 360) * 100; }
function y(latitude: number) { return ((90 - latitude) / 180) * 100; }
function cluster(points: MapPoint[]): Cluster[] {
  const groups = new Map<string, MapPoint[]>();
  for (const point of points) {
    const lat = Math.round(point.latitude * 2) / 2;
    const lon = Math.round(point.longitude * 2) / 2;
    const key = `${lat}|${lon}`;
    const list = groups.get(key) ?? []; list.push(point); groups.set(key, list);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    latitude: items.reduce((sum, item) => sum + item.latitude, 0) / items.length,
    longitude: items.reduce((sum, item) => sum + item.longitude, 0) / items.length,
    points: items.sort((a,b) => a.name.localeCompare(b.name, 'pt'))
  }));
}

export default function SaintsWorldMap({ datasetId, personCount }: { datasetId: string; personCount: number }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [century, setCentury] = useState('');
  const [country, setCountry] = useState('');
  const [relation, setRelation] = useState('');
  const [selected, setSelected] = useState<Cluster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/navigation/summary?locale=pt')
      .then((response) => response.json())
      .then((body: Api<Summary>) => { if (!cancelled && body.ready) setSummary(body.data); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ locale: 'pt', limit: '2000' });
    if (century) params.set('century', century);
    if (country) params.set('country', country);
    if (relation) params.set('relation', relation);
    setLoading(true); setError(''); setSelected(null);
    fetch(`/api/v1/navigation/map?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json() as Api<MapPoint[]>;
        if (!response.ok || !body.ready) throw new Error(body.error ?? 'Mapa temporariamente indisponível.');
        setPoints(body.data);
      })
      .catch((err) => { if (err?.name !== 'AbortError') setError(err instanceof Error ? err.message : 'Mapa temporariamente indisponível.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [century, country, relation]);

  const clusters = useMemo(() => cluster(points), [points]);
  const titleFor = (item: Cluster) => item.points.length === 1
    ? `${item.points[0].name} — ${item.points[0].placeName ?? 'local associado'}`
    : `${item.points.length} registos neste local`;

  return <div className={styles.shell}>
    <div className={styles.toolbar}>
      <div className={styles.field}>
        <label htmlFor="map-century">Século</label>
        <select id="map-century" value={century} onChange={(event) => setCentury(event.target.value)}>
          <option value="">Todos</option>
          {(summary?.centuries ?? []).map((item) => <option key={item.century} value={item.century}>{centuryLabel(item.century)} · {item.saintCount}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="map-country">País atual</label>
        <select id="map-country" value={country} onChange={(event) => setCountry(event.target.value)}>
          <option value="">Todos</option>
          {(summary?.countries ?? []).map((item) => <option key={item.countryCode} value={item.countryCode}>{countryName(item.countryCode)} · {item.saintCount}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="map-relation">Relação</label>
        <select id="map-relation" value={relation} onChange={(event) => setRelation(event.target.value)}>
          <option value="">Todas</option>
          {['birth','death','burial','activity','martyrdom'].map((value) => <option key={value} value={value}>{relationLabel(value)}</option>)}
        </select>
      </div>
      <div className={styles.status}>{loading ? 'A atualizar…' : `${points.length.toLocaleString('pt-PT')} vínculos · ${clusters.length.toLocaleString('pt-PT')} locais visíveis`}</div>
    </div>

    {error ? <div className={styles.error}>{error}</div> : <div className={styles.mapLayout}>
      <div className={styles.mapFrame} aria-label="Mapa-múndi dos santos">
        <img className={styles.mapLand} src="/world-map-land.svg" alt="" />
        {clusters.map((item) => {
          const size = Math.min(10, Math.max(1, Math.ceil(Math.log2(item.points.length + 1))));
          return <button
            key={item.key}
            className={styles.mapPoint}
            style={{ left: `${x(item.longitude)}%`, top: `${y(item.latitude)}%`, ['--cluster-size' as string]: size }}
            title={titleFor(item)}
            aria-label={titleFor(item)}
            onClick={() => setSelected(item)}
          />;
        })}
      </div>
      <aside className={styles.panel} aria-live="polite">
        {selected ? <>
          <div>
            <h2>{selected.points.length === 1 ? selected.points[0].placeName ?? selected.points[0].name : `${selected.points.length} santos / vínculos`}</h2>
            <div className={styles.panelMeta}>
              {selected.points[0]?.countryCode ? <span className={styles.chip}>{countryName(selected.points[0].countryCode)}</span> : null}
              <span className={styles.chip}>{selected.latitude.toFixed(2)}°, {selected.longitude.toFixed(2)}°</span>
            </div>
          </div>
          <ul className={styles.resultList}>
            {selected.points.map((point) => <li key={point.id} className={styles.resultItem}>
              <strong>{point.name}</strong>
              <small>{relationLabel(point.relationType)}{point.century ? ` · ${centuryLabel(point.century)}` : ''}</small>
              {point.historicalName ? <small>Contexto histórico: {point.historicalName}</small> : null}
              {point.placeName ? <small>Localização atual: {point.placeName}</small> : null}
            </li>)}
          </ul>
        </> : <>
          <h2>Explorar geograficamente</h2>
          <p>Selecione um ponto. O local atual e a designação histórica são tratados separadamente para não projetar fronteiras modernas sobre épocas antigas.</p>
          <div className={styles.panelMeta}><span className={styles.chip}>Dataset {datasetId.slice(0, 20)}…</span><span className={styles.chip}>{personCount.toLocaleString('pt-PT')} pessoas publicadas</span></div>
        </>}
      </aside>
    </div>}
  </div>;
}
