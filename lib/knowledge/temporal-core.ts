import type { CalendarSystem, CalendarVariant, DateRule, ISODate } from './model';
import { jdnToGregorian, julianDateToJdn, resolveDateRule, toISODate } from './calendar-engine';

export type InstantLike = Date | string | number;

export type NativeCalendarCoordinate = {
  calendar: CalendarSystem;
  variant?: CalendarVariant;
  year?: number;
  month?: number;
  day?: number;
  ruleType: DateRule['type'];
};

export type CalendarBridgeResult = {
  targetCivilYear: number;
  native: NativeCalendarCoordinate;
  canonicalGregorianDate?: ISODate;
  canonicalJdn?: number;
  status: 'resolved' | 'fallback' | 'unsupported';
  reason?: string;
};

function toDate(value: InstantLike): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid instant.');
  return date;
}

export function isValidIanaTimeZone(value: string | undefined | null): value is string {
  if (!value || typeof value !== 'string' || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(value: string | undefined | null, fallback = 'UTC'): string {
  return isValidIanaTimeZone(value) ? value : fallback;
}

export function civilDateAtInstant(value: InstantLike, timeZone: string): ISODate {
  const zone = normalizeTimeZone(timeZone);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(toDate(value));
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const year = Number(byType.year);
  const month = Number(byType.month);
  const day = Number(byType.day);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new RangeError(`Could not resolve civil date in ${zone}.`);
  }
  return toISODate({ year, month, day });
}

export function civilYearAtInstant(value: InstantLike, timeZone: string): number {
  return Number(civilDateAtInstant(value, timeZone).slice(0, 4));
}

export function gregorianDateToJdn(dateISO: ISODate): number {
  const match = String(dateISO).match(/^([+-]?\d+)-(\d{2})-(\d{2})$/u);
  if (!match) throw new RangeError(`Invalid Gregorian ISO date: ${dateISO}.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function gregorianDateFromJdn(jdn: number): ISODate {
  if (!Number.isInteger(jdn)) throw new RangeError('JDN must be an integer.');
  return toISODate(jdnToGregorian(jdn));
}

function resolveJulianFixedInsideCivilYear(month: number, day: number, targetCivilYear: number): CalendarBridgeResult {
  for (const nativeYear of [targetCivilYear - 1, targetCivilYear, targetCivilYear + 1]) {
    const jdn = julianDateToJdn({ year: nativeYear, month, day });
    const gregorian = jdnToGregorian(jdn);
    if (gregorian.year === targetCivilYear) {
      return {
        targetCivilYear,
        native: { calendar: 'julian', ruleType: 'fixed', year: nativeYear, month, day },
        canonicalGregorianDate: toISODate(gregorian),
        canonicalJdn: jdn,
        status: 'resolved',
      };
    }
  }
  return {
    targetCivilYear,
    native: { calendar: 'julian', ruleType: 'fixed', month, day },
    status: 'unsupported',
    reason: `Julian ${month}-${day} could not be projected into Gregorian year ${targetCivilYear}.`,
  };
}

export function bridgeDateRule(rule: DateRule, targetCivilYear: number): CalendarBridgeResult {
  if (!Number.isInteger(targetCivilYear) || targetCivilYear < 1) {
    return {
      targetCivilYear,
      native: { calendar: rule.calendar, variant: rule.variant, ruleType: rule.type },
      status: 'unsupported',
      reason: 'Target civil year must be a positive integer.',
    };
  }

  if (rule.type === 'fixed' && rule.calendar === 'julian') {
    return resolveJulianFixedInsideCivilYear(rule.month, rule.day, targetCivilYear);
  }

  const resolution = resolveDateRule(rule, targetCivilYear);
  const native: NativeCalendarCoordinate = {
    calendar: rule.calendar,
    variant: rule.variant,
    ruleType: rule.type,
    month: rule.type === 'fixed' ? rule.month : undefined,
    day: rule.type === 'fixed' ? rule.day : undefined,
  };
  if (!resolution.dateISO) {
    return { targetCivilYear, native, status: resolution.status, reason: resolution.reason };
  }
  return {
    targetCivilYear,
    native,
    canonicalGregorianDate: resolution.dateISO,
    canonicalJdn: gregorianDateToJdn(resolution.dateISO),
    status: resolution.status,
    reason: resolution.reason,
  };
}

export function sameCanonicalDay(left: CalendarBridgeResult, right: CalendarBridgeResult): boolean {
  return left.status !== 'unsupported' && right.status !== 'unsupported' && left.canonicalJdn === right.canonicalJdn;
}

export function allDayIcsDate(dateISO: ISODate): string {
  return String(dateISO).replaceAll('-', '');
}
