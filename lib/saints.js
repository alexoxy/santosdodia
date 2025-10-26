import fs from 'fs';
import path from 'path';
import { STATIC_SAINTS } from '../data/saints/static';
import { getTraditionLabel } from './i18n';

export const TRADITIONS = {
  catholicism: {
    id: 'catholicism',
    color: '#9b1c1c',
    background: 'rgba(155, 28, 28, 0.14)'
  },
  anglicanism: {
    id: 'anglicanism',
    color: '#1b4965',
    background: 'rgba(27, 73, 101, 0.14)'
  },
  orthodox: {
    id: 'orthodox',
    color: '#94790d',
    background: 'rgba(148, 121, 13, 0.18)'
  }
};

// Configure official data feeds through environment variables. Each feed must
// return an array of records with the same shape used in STATIC_SAINTS. The
// site checks these URLs once per day on the first request to ensure the
// calendar reflects official updates.
const SOURCE_ENV_KEYS = {
  catholicism: 'SAINTS_SOURCE_CATHOLICISM',
  anglicanism: 'SAINTS_SOURCE_ANGLICANISM',
  orthodox: 'SAINTS_SOURCE_ORTHODOX'
};

const globalCacheKey = Symbol.for('santosdodia.saints-cache');

function loadOfficialSnapshot() {
  try {
    const filePath = path.join(process.cwd(), 'data/saints/official.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.records)) {
      return parsed.records;
    }
  } catch (error) {
    // Ignore missing files; local snapshots are optional.
  }

  return [];
}

function getInitialCache() {
  const base = {};
  mergeEntries(base, loadOfficialSnapshot());
  for (const entry of STATIC_SAINTS) {
    const record = normaliseEntry(entry);
    if (!base[record.date]) {
      base[record.date] = {};
    }

    base[record.date][record.tradition] = record;
  }

  return { lastChecked: null, data: base };
}

function getCache() {
  if (!globalThis[globalCacheKey]) {
    globalThis[globalCacheKey] = getInitialCache();
  }

  return globalThis[globalCacheKey];
}

function normaliseEntry(entry) {
  return {
    date: entry.date,
    tradition: entry.tradition,
    slug: entry.slug,
    titles: entry.titles || {},
    bios: entry.bios || {},
    sources: entry.sources || []
  };
}

function normaliseDate(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function stripDiacritics(value) {
  if (!value) {
    return '';
  }

  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function mergeEntries(base, incoming) {
  for (const entry of incoming) {
    if (!entry || !entry.date || !entry.tradition) continue;

    const record = normaliseEntry(entry);
    if (!base[record.date]) {
      base[record.date] = {};
    }

    const existing = base[record.date][record.tradition];
    base[record.date][record.tradition] = existing
      ? {
          ...existing,
          titles: { ...existing.titles, ...record.titles },
          bios: { ...existing.bios, ...record.bios },
          sources: Array.from(new Set([...(existing.sources || []), ...(record.sources || [])]))
        }
      : record;
  }
}

async function fetchExternalSaints(tradition) {
  const envKey = SOURCE_ENV_KEYS[tradition];
  const url = envKey ? process.env[envKey] : null;

  if (!url) {
    return [];
  }

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.warn(`Falha ao atualizar ${tradition} a partir de ${url}: ${response.status}`);
      return [];
    }

    const payload = await response.json();
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.records)) {
      return payload.records;
    }
  } catch (error) {
    console.warn(`Erro ao obter dados de ${tradition}:`, error);
  }

  return [];
}

async function refreshCacheIfNeeded() {
  const cache = getCache();
  const todayKey = normaliseDate(new Date());

  if (cache.lastChecked === todayKey) {
    return cache;
  }

  const updates = await Promise.all(
    Object.keys(TRADITIONS).map(async (tradition) => ({
      tradition,
      entries: await fetchExternalSaints(tradition)
    }))
  );

  let hasUpdates = false;
  for (const update of updates) {
    if (update.entries.length > 0) {
      hasUpdates = true;
      mergeEntries(cache.data, update.entries);
    }
  }

  cache.lastChecked = todayKey;
  cache.lastSyncSuccess = hasUpdates ? todayKey : cache.lastSyncSuccess || todayKey;
  return cache;
}

function resolveName(entry, locale) {
  if (!entry) return '';
  const normalised = (locale || '').toLowerCase();
  const direct = entry.titles[normalised];
  if (direct) return direct;

  const base = entry.titles['pt-pt'] || entry.titles['pt-br'];
  if (base) return base;

  const fallback = Object.values(entry.titles)[0];
  return fallback || '';
}

function resolveBio(entry, locale) {
  if (!entry) return '';
  const normalised = (locale || '').toLowerCase();
  const direct = entry.bios[normalised];
  if (direct) return direct;

  const base = entry.bios['pt-pt'] || entry.bios['pt-br'];
  if (base) return base;

  const fallback = Object.values(entry.bios)[0];
  return fallback || '';
}

function mapEntryToView(entry, locale) {
  const meta = TRADITIONS[entry.tradition];
  return {
    date: entry.date,
    tradition: entry.tradition,
    slug: entry.slug || `${entry.tradition}-${entry.date}`,
    name: resolveName(entry, locale),
    bio: resolveBio(entry, locale),
    titles: entry.titles,
    bios: entry.bios,
    sources: entry.sources,
    color: meta?.color || '#333333',
    background: meta?.background || 'rgba(0,0,0,0.08)',
    traditionLabel: getTraditionLabel(locale, entry.tradition)
  };
}

export async function getSaintsForDate(dateInput, locale) {
  const cache = await refreshCacheIfNeeded();
  const dateKey = normaliseDate(dateInput);
  if (!dateKey) {
    return [];
  }

  const entries = cache.data[dateKey] || {};
  return Object.values(entries)
    .map((entry) => mapEntryToView(entry, locale))
    .sort((a, b) => a.tradition.localeCompare(b.tradition));
}

export async function getUpcomingSaints({ from = new Date(), days = 5, locale }) {
  const cache = await refreshCacheIfNeeded();
  const start = new Date(from);
  const results = [];

  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateKey = normaliseDate(date);
    const entries = cache.data[dateKey];
    if (!entries) continue;

    const perDay = Object.values(entries).map((entry) => mapEntryToView(entry, locale));
    results.push({ date: dateKey, saints: perDay });
  }

  return results;
}

export async function getAllSaints(locale) {
  const cache = await refreshCacheIfNeeded();
  const records = [];

  for (const [date, entries] of Object.entries(cache.data)) {
    for (const entry of Object.values(entries)) {
      records.push(mapEntryToView(entry, locale));
    }
  }

  return records.sort((a, b) => {
    if (a.date === b.date) {
      return a.tradition.localeCompare(b.tradition);
    }

    return a.date.localeCompare(b.date);
  });
}

export async function searchSaints({
  locale,
  query,
  tradition,
  date
}) {
  const records = await getAllSaints(locale);
  const text = (query || '').trim();
  const dateKey = date ? normaliseDate(date) : null;
  const traditionFilter = tradition && tradition !== 'all' ? tradition : null;

  return records.filter((record) => {
    if (traditionFilter && record.tradition !== traditionFilter) {
      return false;
    }

    if (dateKey && record.date !== dateKey) {
      return false;
    }

    if (!text) {
      return true;
    }

    const safeName = stripDiacritics(record.name);
    const safeQuery = stripDiacritics(text);
    return safeName.includes(safeQuery);
  });
}

export function getTraditionOptions(locale) {
  return [
    { value: 'all', label: getTraditionLabel(locale, 'all') || '—' },
    ...Object.keys(TRADITIONS).map((id) => ({
      value: id,
      label: getTraditionLabel(locale, id)
    }))
  ];
}

export function describeTradition(locale, tradition) {
  const meta = TRADITIONS[tradition];
  return {
    id: tradition,
    label: getTraditionLabel(locale, tradition),
    color: meta?.color || '#333333',
    background: meta?.background || 'rgba(0,0,0,0.08)'
  };
}

export function getLastSyncInfo() {
  const cache = getCache();
  return {
    lastChecked: cache.lastChecked,
    lastSyncSuccess: cache.lastSyncSuccess || null
  };
}
