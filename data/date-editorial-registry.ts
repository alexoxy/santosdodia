import type { Locale } from '../lib/i18n';
import { getAnnualDateEditorial as getAnnualDateEditorialBatch1 } from './date-editorial';
import { getAnnualDateEditorialBatch2 } from './date-editorial-batch-2';
import { getAnnualDateEditorialBatch3 } from './date-editorial-batch-3';

export function getAnnualDateEditorial(monthDay: string, locale: Locale) {
  return getAnnualDateEditorialBatch1(monthDay, locale) ?? getAnnualDateEditorialBatch2(monthDay, locale) ?? getAnnualDateEditorialBatch3(monthDay, locale);
}

export function hasAnnualDateEditorial(monthDay: string, locale: Locale) {
  return Boolean(getAnnualDateEditorial(monthDay, locale));
}
