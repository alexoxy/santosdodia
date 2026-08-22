import { localize, type Locale } from '../lib/i18n';
import { biographyUi, SAINT_BIOGRAPHIES as BASE_SAINT_BIOGRAPHIES, type SaintBiography } from './saint-biographies';
import { EDITORIAL_SCALE_BATCH_4 } from './saint-biographies-batch-4';
import { EDITORIAL_SCALE_BATCH_5 } from './saint-biographies-batch-5';

export { biographyUi };
export type { BiographySource, SaintBiography } from './saint-biographies';

export const SAINT_BIOGRAPHIES: SaintBiography[] = [...BASE_SAINT_BIOGRAPHIES, ...EDITORIAL_SCALE_BATCH_4, ...EDITORIAL_SCALE_BATCH_5];

export function getSaintBiographyRecord(id: string) {
  return SAINT_BIOGRAPHIES.find(item => item.id === id);
}

export function getSaintBiography(id: string, locale: Locale) {
  const biography = getSaintBiographyRecord(id);
  if (!biography) return undefined;
  const localeParagraphs = biography.paragraphs[locale];
  return {
    ...biography,
    title: localize(biography.title, locale),
    summary: localize(biography.summary, locale),
    paragraphs: localeParagraphs?.length ? localeParagraphs : biography.paragraphs.en,
    facts: biography.facts.map(fact => ({ label: localize(fact.label, locale), value: localize(fact.value, locale) })),
  };
}
