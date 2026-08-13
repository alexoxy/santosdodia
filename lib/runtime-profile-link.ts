import type { Observance } from '../data/observances';
import type { Locale } from './i18n';
import { getPublicAllObservances } from './public-observances';

const PERSON_CATEGORIES = new Set(['saint', 'apostle', 'martyr']);

function normalizeName(value: string | undefined, locale: Locale = 'en'): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase(locale)
    .replace(/[’'`´.·,:;()\[\]{}\-_/\\]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function collectiveName(value: string | undefined): boolean {
  const name = normalizeName(value);
  return name.startsWith('santos ') ||
    name.startsWith('santas ') ||
    name.startsWith('saints ') ||
    name.startsWith('ss ') ||
    name.startsWith('todos os santos') ||
    name.startsWith('all saints') ||
    name.includes(' e sao ') ||
    name.includes(' e santo ') ||
    name.includes(' e santa ') ||
    name.includes(' and saint ');
}

function explicitSingularPersonName(value: string | undefined): boolean {
  const name = normalizeName(value);
  return name.startsWith('s ') ||
    name.startsWith('sao ') ||
    name.startsWith('santo ') ||
    name.startsWith('santa ') ||
    name.startsWith('beato ') ||
    name.startsWith('beata ') ||
    name.startsWith('st ') ||
    name.startsWith('saint ') ||
    name.startsWith('blessed ');
}

export function isRuntimePersonProfileEligible(item: Pick<Observance, 'category' | 'name' | 'names'>): boolean {
  if (!PERSON_CATEGORIES.has(item.category)) return false;
  if (!explicitSingularPersonName(item.name)) return false;
  return !collectiveName(item.name);
}

function names(item: Observance, locale: Locale): Set<string> {
  return new Set(
    [item.name, item.names?.[locale], item.names?.en, ...Object.values(item.names ?? {})]
      .map((value) => normalizeName(value, locale))
      .filter(Boolean),
  );
}

function compatibleCategory(left: Observance, right: Observance): boolean {
  return left.category === right.category ||
    (PERSON_CATEGORIES.has(left.category) && PERSON_CATEGORIES.has(right.category));
}

export function getExistingProfileId(
  item: Observance,
  year: number,
  locale: Locale = 'en',
): string | null {
  const curated = getPublicAllObservances(year, locale);
  const direct = curated.find((candidate) => candidate.id === item.id);
  if (direct) return direct.id;

  const incomingNames = names(item, locale);
  const matches = curated.filter((candidate) => {
    if (candidate.dateISO !== item.dateISO) return false;
    if (!candidate.traditions.some((value) => item.traditions.includes(value))) return false;
    if (!compatibleCategory(candidate, item)) return false;
    const candidateNames = names(candidate, locale);
    return [...incomingNames].some((value) => candidateNames.has(value));
  });

  const ids = [...new Set(matches.map((candidate) => candidate.id))];
  return ids.length === 1 ? ids[0] : null;
}
