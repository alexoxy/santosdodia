import snapshot from '../data/generated/source-snapshot.json';
import {
  mergeObservances,
  type Category,
  type Observance,
  type ObservanceFilters,
  type Tradition,
  type ValidationStatus
} from '../data/observances';
import type { Locale, LocalizedText } from './i18n';

export type SourceHealth = {
  sourceId: string;
  ok: boolean;
  checkedAt: string;
  count: number;
  message?: string;
};

export type LiveSourceResult = {
  data: Observance[];
  sourceHealth: SourceHealth[];
};

type UnknownRecord = Record<string, unknown>;
type SnapshotShape = {
  generatedAt: string | null;
  years: Record<string, { observations?: Observance[] }>;
  sourceHealth: SourceHealth[];
};

const SNAPSHOT = snapshot as SnapshotShape;
const API_TIMEOUT_MS = 14_000;

const litcalLocales: Partial<Record<Locale, string>> = {
  en: 'en_US', es: 'es_ES', pt: 'pt_PT', fr: 'fr_FR', ru: 'ru_RU',
  de: 'de_DE', it: 'it_IT', pl: 'pl_PL', fil: 'en_US', sw: 'en_US'
};

function record(value: unknown): UnknownRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : undefined;
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function slug(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'observance';
}

function toDateISO(value: unknown, fallback?: string): string | undefined {
  if (typeof value === 'string') {
    const direct = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (direct) return direct;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const milliseconds = value < 10_000_000_000 ? value * 1000 : value;
    const parsed = new Date(milliseconds);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return fallback?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
}

function categoryFromName(name: string): Category {
  const lower = name.toLowerCase();
  if (/fast|lent|abstin|jejum|ayuno|пост/.test(lower)) return 'fast';
  if (/mary|marian|virgin|theotokos|our lady|madonna|maria|богород/.test(lower)) return 'marian';
  if (/apostle|evangelist|apóstol|apóstolo|апостол/.test(lower)) return 'apostle';
  if (/martyr|mártir|martire|мучен/.test(lower)) return 'martyr';
  if (/lord|christ|nativity|epiphany|theophany|ascension|pentecost|cross|resurrection|easter|pascha|feast|solemnity/.test(lower)) return 'feast';
  return 'saint';
}

function matchesFilters(item: Observance, filters: ObservanceFilters): boolean {
  if (filters.tradition && !item.traditions.includes(filters.tradition)) return false;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.country) {
    const country = filters.country.toUpperCase();
    if (!item.countries?.includes(country) && !item.countries?.includes('GLOBAL')) return false;
  }
  if (filters.patronage) {
    const needle = filters.patronage.toLowerCase();
    if (!item.patronages?.some(value => value.toLowerCase().includes(needle))) return false;
  }
  return true;
}

function withinRange(item: Observance, month?: number, date?: string): boolean {
  if (date) return item.dateISO === date;
  if (month !== undefined) return Number(item.dateISO.slice(5, 7)) === month;
  return true;
}

function namesForLocale(name: string, locale: Locale): LocalizedText {
  return locale === 'en' ? { en: name } : { en: name, [locale]: name } as LocalizedText;
}

function makeObservance(args: {
  sourceId: string;
  externalId?: string;
  dateISO: string;
  name: string;
  locale: Locale;
  traditions: Tradition[];
  calendarSystem: Observance['calendarSystem'];
  validationStatus: ValidationStatus;
  category?: Category;
  summary?: string;
}): Observance {
  const [year, month, day] = args.dateISO.split('-').map(Number);
  return {
    id: `${args.sourceId}-${args.externalId ? slug(args.externalId) : slug(args.name)}-${args.dateISO}`,
    externalId: args.externalId,
    month,
    day,
    dateISO: args.dateISO,
    traditions: args.traditions,
    category: args.category ?? categoryFromName(args.name),
    calendarSystem: args.calendarSystem,
    names: namesForLocale(args.name, args.locale),
    name: args.name,
    summaries: args.summary ? { en: args.summary } : undefined,
    summary: args.summary,
    countries: ['GLOBAL'],
    sourceIds: [args.sourceId],
    translationStatus: args.locale === 'en' ? 'source' : 'assisted',
    validationStatus: args.validationStatus,
    lastVerified: new Date().toISOString().slice(0, 10)
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'SantosDoDia/2.0 (+https://santosdodia.com)' },
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(API_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function litcalEvents(payload: unknown): unknown[] {
  const root = record(payload);
  if (!root) return Array.isArray(payload) ? payload : [];
  const candidate = root.LitCal ?? root.litcal ?? root.events ?? root.calendar ?? root.data;
  if (Array.isArray(candidate)) return candidate;
  const objectCandidate = record(candidate);
  return objectCandidate ? Object.values(objectCandidate).flatMap(value => Array.isArray(value) ? value : [value]) : [];
}

function parseLitcal(payload: unknown, year: number, locale: Locale): Observance[] {
  const output: Observance[] = [];
  for (const raw of litcalEvents(payload)) {
    const item = record(raw);
    if (!item) continue;
    const nestedDate = record(item.date);
    const date = toDateISO(item.date ?? item.dateISO ?? item.datetime ?? nestedDate?.date ?? item.timestamp);
    const name = text(item.name ?? item.title ?? item.event_name ?? item.name_lcl ?? record(item.event)?.name);
    if (!date || !date.startsWith(`${year}-`) || !name) continue;
    const grade = text(item.grade_lcl ?? item.grade ?? item.rank);
    const color = text(item.color);
    const summary = [grade, color ? `Liturgical colour: ${color}` : undefined].filter(Boolean).join(' · ') || undefined;
    output.push(makeObservance({
      sourceId: 'litcal-api', externalId: text(item.event_key ?? item.event_idx ?? item.id), dateISO: date,
      name, locale, traditions: ['roman-catholic'], calendarSystem: 'gregorian',
      validationStatus: 'verified', summary
    }));
  }
  return output;
}

function parseOrthodox(payload: unknown, locale: Locale): Observance[] {
  const root = record(payload);
  const data = record(root?.data);
  if (!data) return [];
  const output: Observance[] = [];
  for (const [key, rawDay] of Object.entries(data)) {
    const day = record(rawDay);
    if (!day) continue;
    const date = toDateISO(day.gregorianDate ?? day.gregorian_date, key);
    if (!date) continue;
    for (const rawSaint of Array.isArray(day.saints) ? day.saints : []) {
      const saint = record(rawSaint);
      const name = text(saint?.name ?? saint?.label ?? saint?.title);
      if (!saint || !name) continue;
      output.push(makeObservance({
        sourceId: 'orthodox-range-api', externalId: text(saint.id), dateISO: date, name, locale,
        traditions: ['eastern-orthodox'], calendarSystem: 'julian', validationStatus: 'review-required',
        category: categoryFromName(name)
      }));
    }
    for (const rawEvent of Array.isArray(day.events) ? day.events : []) {
      const event = record(rawEvent);
      const name = text(event?.label ?? event?.name ?? event?.title);
      if (!event || !name) continue;
      output.push(makeObservance({
        sourceId: 'orthodox-range-api', externalId: text(event.id), dateISO: date, name, locale,
        traditions: ['eastern-orthodox'], calendarSystem: 'julian', validationStatus: 'review-required',
        category: text(event.kind) === 'saint' ? 'saint' : categoryFromName(name)
      }));
    }
  }
  return output;
}

function snapshotItems(year: number): Observance[] {
  const items = SNAPSHOT.years?.[String(year)]?.observations;
  return Array.isArray(items) ? items : [];
}

function sourceWanted(filters: ObservanceFilters, candidates: Tradition[]): boolean {
  return !filters.tradition || candidates.includes(filters.tradition);
}

export async function getLiveObservances(
  year: number,
  locale: Locale,
  filters: ObservanceFilters = {},
  range: { month?: number; date?: string } = {}
): Promise<LiveSourceResult> {
  const tasks: Promise<{ sourceId: string; data: Observance[]; health: SourceHealth }>[] = [];
  const checkedAt = new Date().toISOString();

  if (sourceWanted(filters, ['roman-catholic'])) {
    const apiLocale = litcalLocales[locale] ?? 'en_US';
    tasks.push((async () => {
      const sourceId = 'litcal-api';
      try {
        const payload = await fetchJson(`https://litcal.johnromanodorazio.com/api/v5/calendar/${year}?locale=${encodeURIComponent(apiLocale)}&year_type=CIVIL`);
        const data = parseLitcal(payload, year, locale);
        return { sourceId, data, health: { sourceId, ok: data.length > 0, checkedAt, count: data.length, message: data.length ? undefined : 'No events returned.' } };
      } catch (error) {
        return { sourceId, data: [], health: { sourceId, ok: false, checkedAt, count: 0, message: error instanceof Error ? error.message : 'Fetch failed.' } };
      }
    })());
  }

  if (sourceWanted(filters, ['eastern-orthodox'])) {
    const lang = locale === 'ru' ? 'ru' : 'en';
    tasks.push((async () => {
      const sourceId = 'orthodox-range-api';
      try {
        const payload = await fetchJson(`https://api.ispovednik.org/api/v1/saints/year/${year}?lang=${lang}`);
        const data = parseOrthodox(payload, locale);
        return { sourceId, data, health: { sourceId, ok: data.length > 0, checkedAt, count: data.length, message: data.length ? undefined : 'No saints returned.' } };
      } catch (error) {
        return { sourceId, data: [], health: { sourceId, ok: false, checkedAt, count: 0, message: error instanceof Error ? error.message : 'Fetch failed.' } };
      }
    })());
  }

  const settled = await Promise.all(tasks);
  const live = settled.flatMap(item => item.data);
  const fallback = live.length ? [] : snapshotItems(year);
  const data = mergeObservances(live, fallback)
    .filter(item => matchesFilters(item, filters) && withinRange(item, range.month, range.date));

  return { data, sourceHealth: settled.map(item => item.health) };
}
