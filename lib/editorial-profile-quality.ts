import type { SaintBiography } from '../data/saint-biographies';
import type { Locale } from './i18n';
import { READY_PUBLIC_LOCALES } from './public-locale-policy';

export const EDITORIAL_PROFILE_MINIMUM = {
  summaryCharacters: 120,
  paragraphs: 2,
  bodyWords: 90,
  sources: 2,
} as const;

export type EditorialProfileAssessment = {
  indexable: boolean;
  locale: Locale;
  reasons: string[];
  summaryCharacters: number;
  paragraphCount: number;
  bodyWords: number;
  sourceCount: number;
};

function wordCount(value: string) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function validReviewDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function assessSaintBiography(biography: SaintBiography, locale: Locale): EditorialProfileAssessment {
  const title = biography.title[locale]?.trim() ?? '';
  const summary = biography.summary[locale]?.trim() ?? '';
  const paragraphs = biography.paragraphs[locale] ?? [];
  const bodyWords = paragraphs.reduce((total, paragraph) => total + wordCount(paragraph), 0);
  const sourceCount = new Set(biography.sources.map(source => source.url.trim()).filter(Boolean)).size;
  const reasons: string[] = [];

  if (!title) reasons.push('missing-localized-title');
  if (summary.length < EDITORIAL_PROFILE_MINIMUM.summaryCharacters) reasons.push('summary-too-short');
  if (paragraphs.length < EDITORIAL_PROFILE_MINIMUM.paragraphs) reasons.push('insufficient-paragraphs');
  if (bodyWords < EDITORIAL_PROFILE_MINIMUM.bodyWords) reasons.push('body-too-short');
  if (sourceCount < EDITORIAL_PROFILE_MINIMUM.sources) reasons.push('insufficient-distinct-sources');
  if (!validReviewDate(biography.verifiedAt)) reasons.push('invalid-review-date');

  return {
    indexable: reasons.length === 0,
    locale,
    reasons,
    summaryCharacters: summary.length,
    paragraphCount: paragraphs.length,
    bodyWords,
    sourceCount,
  };
}

export function isSaintBiographyIndexable(biography: SaintBiography, locale: Locale) {
  return assessSaintBiography(biography, locale).indexable;
}

export function isSaintBiographyReadyForLaunchedLocales(biography: SaintBiography) {
  return READY_PUBLIC_LOCALES.every(locale => isSaintBiographyIndexable(biography, locale));
}
