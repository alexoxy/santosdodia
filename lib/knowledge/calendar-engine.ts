import type {
  AnnualPublishedDateRule,
  CalendarSystem,
  DateRule,
  FixedDateRule,
  ISODate,
  RelativeDateRule
} from './model';

export type CivilDate = { year: number; month: number; day: number };
export type DateResolution = {
  dateISO?: ISODate;
  status: 'resolved' | 'fallback' | 'unsupported';
  reason?: string;
};

const COPTIC_EPOCH_JDN = 1825030;
const ETHIOPIAN_EPOCH_JDN = 1724221;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toISODate(value: CivilDate): ISODate {
  return `${value.year}-${pad(value.month)}-${pad(value.day)}` as ISODate;
}

function fromDate(value: Date): CivilDate {
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() };
}

export function addDays(value: CivilDate, offsetDays: number): CivilDate {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return fromDate(date);
}

export function gregorianEaster(year: number): CivilDate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

export function julianDateToJdn(value: CivilDate): number {
  const a = Math.floor((14 - value.month) / 12);
  const y = value.year + 4800 - a;
  const m = value.month + 12 * a - 3;
  return value.day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
}

export function jdnToGregorian(jdn: number): CivilDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

export function orthodoxEaster(year: number): CivilDate {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return jdnToGregorian(julianDateToJdn({ year, month, day }));
}

function isAlexandrianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

function validateAlexandrianDate(year: number, month: number, day: number): string | undefined {
  if (!Number.isInteger(year) || year < 1) return 'Calendar year must be a positive integer.';
  if (!Number.isInteger(month) || month < 1 || month > 13) return 'Calendar month must be between 1 and 13.';
  const maximumDay = month === 13 ? (isAlexandrianLeapYear(year) ? 6 : 5) : 30;
  if (!Number.isInteger(day) || day < 1 || day > maximumDay) return `Calendar day must be between 1 and ${maximumDay}.`;
  return undefined;
}

function alexandrianDateToJdn(year: number, month: number, day: number, epochJdn: number): number {
  return epochJdn - 1 + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day;
}

export function copticToGregorian(year: number, month: number, day: number): CivilDate {
  const error = validateAlexandrianDate(year, month, day);
  if (error) throw new RangeError(error);
  return jdnToGregorian(alexandrianDateToJdn(year, month, day, COPTIC_EPOCH_JDN));
}

export function ethiopianToGregorian(year: number, month: number, day: number): CivilDate {
  const error = validateAlexandrianDate(year, month, day);
  if (error) throw new RangeError(error);
  return jdnToGregorian(alexandrianDateToJdn(year, month, day, ETHIOPIAN_EPOCH_JDN));
}

function resolveNativeFixedWithinGregorianYear(
  calendar: 'coptic' | 'ethiopian',
  month: number,
  day: number,
  gregorianYear: number
): DateResolution {
  const nativeYears = calendar === 'coptic'
    ? [gregorianYear - 284, gregorianYear - 283]
    : [gregorianYear - 8, gregorianYear - 7];
  const converter = calendar === 'coptic' ? copticToGregorian : ethiopianToGregorian;

  for (const nativeYear of nativeYears) {
    try {
      const converted = converter(nativeYear, month, day);
      if (converted.year === gregorianYear) return { dateISO: toISODate(converted), status: 'resolved' };
    } catch {
      // Try the adjacent native year before returning an unsupported result.
    }
  }

  return {
    status: 'unsupported',
    reason: `The ${calendar} date ${month}-${day} could not be resolved inside Gregorian year ${gregorianYear}.`
  };
}

function adventStart(year: number): CivilDate {
  const start = new Date(Date.UTC(year, 10, 27));
  const daysUntilSunday = (7 - start.getUTCDay()) % 7;
  start.setUTCDate(start.getUTCDate() + daysUntilSunday);
  return fromDate(start);
}

function applyWeekdayAdjustment(value: CivilDate, rule: RelativeDateRule): CivilDate {
  if (!rule.weekdayAdjustment) return value;
  const current = new Date(Date.UTC(value.year, value.month - 1, value.day));
  const currentWeekday = current.getUTCDay();
  const target = rule.weekdayAdjustment.weekday;
  let delta = 0;

  if (rule.weekdayAdjustment.direction === 'next') delta = (target - currentWeekday + 7) % 7;
  if (rule.weekdayAdjustment.direction === 'previous') delta = -((currentWeekday - target + 7) % 7);
  if (rule.weekdayAdjustment.direction === 'nearest') {
    const forward = (target - currentWeekday + 7) % 7;
    const backward = -((currentWeekday - target + 7) % 7);
    delta = Math.abs(backward) <= forward ? backward : forward;
  }

  return addDays(value, delta);
}

function resolveArmenianFixed(rule: FixedDateRule, year: number): DateResolution {
  if (rule.variant === 'armenian-jerusalem') {
    return {
      dateISO: toISODate(jdnToGregorian(julianDateToJdn({ year, month: rule.month, day: rule.day }))),
      status: 'resolved'
    };
  }
  return { dateISO: toISODate({ year, month: rule.month, day: rule.day }), status: 'resolved' };
}

function resolveFixed(rule: FixedDateRule, year: number): DateResolution {
  if (rule.calendar === 'gregorian' || rule.calendar === 'revised-julian') {
    return { dateISO: toISODate({ year, month: rule.month, day: rule.day }), status: 'resolved' };
  }
  if (rule.calendar === 'julian') {
    const gregorian = jdnToGregorian(julianDateToJdn({ year, month: rule.month, day: rule.day }));
    return { dateISO: toISODate(gregorian), status: 'resolved' };
  }
  if (rule.calendar === 'coptic' || rule.calendar === 'ethiopian') {
    return resolveNativeFixedWithinGregorianYear(rule.calendar, rule.month, rule.day, year);
  }
  if (rule.calendar === 'armenian') return resolveArmenianFixed(rule, year);
  return { status: 'unsupported', reason: `Calendar system ${rule.calendar} requires a dedicated rule or annual publication.` };
}

function easterForRule(rule: RelativeDateRule, year: number): DateResolution | CivilDate {
  if (rule.anchor === 'gregorian-easter') return gregorianEaster(year);
  if (rule.anchor === 'orthodox-easter' || rule.anchor === 'coptic-easter' || rule.anchor === 'ethiopian-easter') {
    return orthodoxEaster(year);
  }
  if (rule.anchor === 'armenian-easter') {
    if (rule.variant === 'armenian-jerusalem') {
      return {
        status: 'unsupported',
        reason: 'The Jerusalem Armenian Easter cycle must be supplied by an annual authoritative calendar.'
      };
    }
    return gregorianEaster(year);
  }
  return { status: 'unsupported', reason: 'The rule is not anchored to Easter.' };
}

function pentecostAnchor(rule: RelativeDateRule, year: number): DateResolution | CivilDate {
  const calendar: CalendarSystem = rule.calendar;
  if (calendar === 'julian' || calendar === 'coptic' || calendar === 'ethiopian') return addDays(orthodoxEaster(year), 49);
  if (calendar === 'armenian' && rule.variant === 'armenian-jerusalem') {
    return {
      status: 'unsupported',
      reason: 'The Jerusalem Armenian Pentecost cycle must be supplied by an annual authoritative calendar.'
    };
  }
  return addDays(gregorianEaster(year), 49);
}

function isDateResolution(value: CivilDate | DateResolution): value is DateResolution {
  return 'status' in value;
}

function resolveRelative(rule: RelativeDateRule, year: number): DateResolution {
  let anchor: CivilDate | DateResolution;
  switch (rule.anchor) {
    case 'gregorian-easter':
    case 'orthodox-easter':
    case 'coptic-easter':
    case 'ethiopian-easter':
    case 'armenian-easter':
      anchor = easterForRule(rule, year);
      break;
    case 'pentecost':
      anchor = pentecostAnchor(rule, year);
      break;
    case 'advent-start':
      anchor = adventStart(year);
      break;
    case 'christmas':
      anchor = { year, month: 12, day: 25 };
      break;
    default:
      return { status: 'unsupported', reason: 'Unknown date anchor.' };
  }

  if (isDateResolution(anchor)) return anchor;
  const adjusted = applyWeekdayAdjustment(addDays(anchor, rule.offsetDays), rule);
  return { dateISO: toISODate(adjusted), status: 'resolved' };
}

function resolveAnnual(rule: AnnualPublishedDateRule, year: number): DateResolution {
  if (!rule.fallbackRule) {
    return { status: 'unsupported', reason: `Annual source ${rule.sourceId} has no cached date or deterministic fallback.` };
  }
  const fallback = resolveDateRule(rule.fallbackRule, year);
  return fallback.dateISO ? { ...fallback, status: 'fallback' } : fallback;
}

export function resolveDateRule(rule: DateRule, year: number): DateResolution {
  if (!Number.isInteger(year) || year < 1) return { status: 'unsupported', reason: 'Invalid year.' };
  if (rule.type === 'fixed') return resolveFixed(rule, year);
  if (rule.type === 'relative') return resolveRelative(rule, year);
  return resolveAnnual(rule, year);
}
