import { addDays, gregorianEaster, toISODate, type CivilDate } from './calendar-engine';

export type RomanSundayCycle = 'A' | 'B' | 'C';
export type RomanWeekdayCycle = 'I' | 'II';
export type RomanSeason = 'advent' | 'christmas' | 'ordinary-time' | 'lent' | 'easter';
export type RomanPrincipalDay =
  | 'christmas'
  | 'epiphany'
  | 'baptism-of-the-lord'
  | 'ash-wednesday'
  | 'first-sunday-of-lent'
  | 'palm-sunday'
  | 'holy-thursday'
  | 'good-friday'
  | 'holy-saturday'
  | 'easter-sunday'
  | 'ascension'
  | 'pentecost'
  | 'trinity-sunday'
  | 'corpus-christi'
  | 'sacred-heart'
  | 'christ-the-king'
  | 'first-sunday-of-advent';

export type RomanJurisdictionPolicy = {
  id: string;
  churchId: 'church:roman-catholic';
  jurisdictionId: string;
  calendarSystem: 'gregorian';
  epiphany: 'january-6' | 'sunday-january-2-to-8';
  ascension: 'easter-plus-39-thursday' | 'easter-plus-42-sunday';
  corpusChristi: 'easter-plus-60-thursday' | 'easter-plus-63-sunday';
  authority: Array<{ sourceId: string; url: string; role: string }>;
};

export const ROMAN_GENERAL_POLICY: RomanJurisdictionPolicy = {
  id: 'roman-general',
  churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:global',
  calendarSystem: 'gregorian',
  epiphany: 'january-6',
  ascension: 'easter-plus-39-thursday',
  corpusChristi: 'easter-plus-60-thursday',
  authority: [
    {
      sourceId: 'holy-see-universal-norms-liturgical-year',
      url: 'https://www.vatican.va/content/paul-vi/en/motu_proprio/documents/hf_p-vi_motu-proprio_19690214_mysterii-paschalis.html',
      role: 'universal-norms'
    }
  ]
};

export const ROMAN_PORTUGAL_POLICY: RomanJurisdictionPolicy = {
  id: 'roman-portugal',
  churchId: 'church:roman-catholic',
  jurisdictionId: 'jurisdiction:roman-catholic:pt',
  calendarSystem: 'gregorian',
  epiphany: 'sunday-january-2-to-8',
  ascension: 'easter-plus-42-sunday',
  corpusChristi: 'easter-plus-60-thursday',
  authority: [
    {
      sourceId: 'snl-portugal',
      url: 'https://www.liturgia.pt/',
      role: 'portugal-liturgical-authority'
    },
    {
      sourceId: 'holy-see-universal-norms-liturgical-year',
      url: 'https://www.vatican.va/content/paul-vi/en/motu_proprio/documents/hf_p-vi_motu-proprio_19690214_mysterii-paschalis.html',
      role: 'universal-norms'
    }
  ]
};

export type RomanLiturgicalYear = {
  modelVersion: '1.0';
  liturgicalYear: number;
  startDate: string;
  endDate: string;
  sundayCycle: RomanSundayCycle;
  weekdayCycle: RomanWeekdayCycle;
  keyDates: Record<RomanPrincipalDay, string>;
  policy: Pick<RomanJurisdictionPolicy, 'id' | 'churchId' | 'jurisdictionId' | 'calendarSystem'>;
};

export type RomanDateContext = {
  modelVersion: '1.0';
  date: string;
  liturgicalYear: number;
  sundayCycle: RomanSundayCycle;
  weekdayCycle: RomanWeekdayCycle;
  weekdayCycleAppliesToDate: boolean;
  weekdayLectionaryPattern: 'ordinary-time-two-year' | 'seasonal-annual';
  season: RomanSeason;
  seasonWeek: number | null;
  principalDay: RomanPrincipalDay | null;
  policyId: string;
  jurisdictionId: string;
  calendarSystem: 'gregorian';
};

function asDate(value: CivilDate): Date {
  return new Date(Date.UTC(value.year, value.month - 1, value.day));
}

function parseDateISO(value: string): CivilDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) throw new RangeError('Date must use YYYY-MM-DD.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (date.year < 1583 || date.year > 4099) throw new RangeError('Roman kernel supports Gregorian years 1583-4099.');
  const roundTrip = asDate(date);
  if (roundTrip.getUTCFullYear() !== date.year || roundTrip.getUTCMonth() + 1 !== date.month || roundTrip.getUTCDate() !== date.day) {
    throw new RangeError('Invalid civil date.');
  }
  return date;
}

function compareDates(a: CivilDate, b: CivilDate): number {
  return asDate(a).getTime() - asDate(b).getTime();
}

function daysBetween(a: CivilDate, b: CivilDate): number {
  return Math.round((asDate(b).getTime() - asDate(a).getTime()) / 86_400_000);
}

function weekday(value: CivilDate): number {
  return asDate(value).getUTCDay();
}

function nextSundayAfter(value: CivilDate): CivilDate {
  const delta = ((7 - weekday(value)) % 7) || 7;
  return addDays(value, delta);
}

export function firstSundayOfAdvent(civilYear: number): CivilDate {
  if (!Number.isInteger(civilYear) || civilYear < 1583 || civilYear > 4099) throw new RangeError('Civil year out of supported range.');
  const november27 = { year: civilYear, month: 11, day: 27 };
  const delta = (7 - weekday(november27)) % 7;
  return addDays(november27, delta);
}

export function romanSundayCycle(liturgicalYear: number): RomanSundayCycle {
  const remainder = liturgicalYear % 3;
  if (remainder === 1) return 'A';
  if (remainder === 2) return 'B';
  return 'C';
}

export function romanWeekdayCycle(liturgicalYear: number): RomanWeekdayCycle {
  return liturgicalYear % 2 === 0 ? 'II' : 'I';
}

function transferredEpiphany(year: number): CivilDate {
  for (let day = 2; day <= 8; day += 1) {
    const candidate = { year, month: 1, day };
    if (weekday(candidate) === 0) return candidate;
  }
  throw new Error(`Could not resolve transferred Epiphany for ${year}.`);
}

function baptismOfTheLord(year: number, epiphany: CivilDate, policy: RomanJurisdictionPolicy): CivilDate {
  if (policy.epiphany === 'sunday-january-2-to-8') {
    if (epiphany.day === 7 || epiphany.day === 8) return addDays(epiphany, 1);
    return addDays(epiphany, 7);
  }
  return nextSundayAfter(epiphany);
}

export function calculateRomanLiturgicalYear(
  liturgicalYear: number,
  policy: RomanJurisdictionPolicy = ROMAN_GENERAL_POLICY
): RomanLiturgicalYear {
  if (!Number.isInteger(liturgicalYear) || liturgicalYear < 1584 || liturgicalYear > 4099) {
    throw new RangeError('Liturgical year must be between 1584 and 4099.');
  }

  const start = firstSundayOfAdvent(liturgicalYear - 1);
  const nextStart = firstSundayOfAdvent(liturgicalYear);
  const christmas = { year: liturgicalYear - 1, month: 12, day: 25 };
  const epiphany = policy.epiphany === 'january-6'
    ? { year: liturgicalYear, month: 1, day: 6 }
    : transferredEpiphany(liturgicalYear);
  const baptism = baptismOfTheLord(liturgicalYear, epiphany, policy);
  const easter = gregorianEaster(liturgicalYear);
  const ascension = addDays(easter, policy.ascension === 'easter-plus-42-sunday' ? 42 : 39);
  const corpusChristi = addDays(easter, policy.corpusChristi === 'easter-plus-63-sunday' ? 63 : 60);

  const keyDates: Record<RomanPrincipalDay, string> = {
    'christmas': toISODate(christmas),
    'epiphany': toISODate(epiphany),
    'baptism-of-the-lord': toISODate(baptism),
    'ash-wednesday': toISODate(addDays(easter, -46)),
    'first-sunday-of-lent': toISODate(addDays(easter, -42)),
    'palm-sunday': toISODate(addDays(easter, -7)),
    'holy-thursday': toISODate(addDays(easter, -3)),
    'good-friday': toISODate(addDays(easter, -2)),
    'holy-saturday': toISODate(addDays(easter, -1)),
    'easter-sunday': toISODate(easter),
    'ascension': toISODate(ascension),
    'pentecost': toISODate(addDays(easter, 49)),
    'trinity-sunday': toISODate(addDays(easter, 56)),
    'corpus-christi': toISODate(corpusChristi),
    'sacred-heart': toISODate(addDays(easter, 68)),
    'christ-the-king': toISODate(addDays(nextStart, -7)),
    'first-sunday-of-advent': toISODate(start)
  };

  return {
    modelVersion: '1.0',
    liturgicalYear,
    startDate: toISODate(start),
    endDate: toISODate(addDays(nextStart, -1)),
    sundayCycle: romanSundayCycle(liturgicalYear),
    weekdayCycle: romanWeekdayCycle(liturgicalYear),
    keyDates,
    policy: {
      id: policy.id,
      churchId: policy.churchId,
      jurisdictionId: policy.jurisdictionId,
      calendarSystem: policy.calendarSystem
    }
  };
}

export function liturgicalYearForDate(dateISO: string): number {
  const date = parseDateISO(dateISO);
  const advent = firstSundayOfAdvent(date.year);
  return compareDates(date, advent) >= 0 ? date.year + 1 : date.year;
}

function principalDayForDate(dateISO: string, year: RomanLiturgicalYear): RomanPrincipalDay | null {
  for (const [key, value] of Object.entries(year.keyDates) as Array<[RomanPrincipalDay, string]>) {
    if (value === dateISO) return key;
  }
  return null;
}

function ordinaryWeek(date: CivilDate, baptism: CivilDate, pentecost: CivilDate, christKing: CivilDate): number {
  if (compareDates(date, pentecost) > 0) {
    if (weekday(date) === 0) {
      return 34 - Math.floor(daysBetween(date, christKing) / 7);
    }
    const daysUntilSunday = (7 - weekday(date)) % 7;
    const upcomingSunday = addDays(date, daysUntilSunday || 7);
    const upcomingSundayNumber = 34 - Math.floor(daysBetween(upcomingSunday, christKing) / 7);
    return upcomingSundayNumber - 1;
  }

  const secondSunday = nextSundayAfter(baptism);
  if (compareDates(date, secondSunday) < 0) return 1;
  return 2 + Math.floor(daysBetween(secondSunday, date) / 7);
}

export function romanDateContext(
  dateISO: string,
  policy: RomanJurisdictionPolicy = ROMAN_GENERAL_POLICY
): RomanDateContext {
  const date = parseDateISO(dateISO);
  const liturgicalYear = liturgicalYearForDate(dateISO);
  const year = calculateRomanLiturgicalYear(liturgicalYear, policy);
  const key = Object.fromEntries(Object.entries(year.keyDates).map(([name, value]) => [name, parseDateISO(value)])) as Record<RomanPrincipalDay, CivilDate>;
  const principalDay = principalDayForDate(dateISO, year);

  let season: RomanSeason;
  let seasonWeek: number | null = null;

  if (compareDates(date, key['first-sunday-of-advent']) >= 0 && compareDates(date, key.christmas) < 0) {
    season = 'advent';
    seasonWeek = 1 + Math.floor(daysBetween(key['first-sunday-of-advent'], date) / 7);
  } else if (compareDates(date, key.christmas) >= 0 && compareDates(date, key['baptism-of-the-lord']) <= 0) {
    season = 'christmas';
  } else if (compareDates(date, key['ash-wednesday']) < 0) {
    season = 'ordinary-time';
    seasonWeek = ordinaryWeek(date, key['baptism-of-the-lord'], key.pentecost, key['christ-the-king']);
  } else if (compareDates(date, key['easter-sunday']) < 0) {
    season = 'lent';
    if (compareDates(date, key['first-sunday-of-lent']) < 0) seasonWeek = 0;
    else seasonWeek = 1 + Math.floor(daysBetween(key['first-sunday-of-lent'], date) / 7);
  } else if (compareDates(date, key.pentecost) <= 0) {
    season = 'easter';
    seasonWeek = 1 + Math.floor(daysBetween(key['easter-sunday'], date) / 7);
  } else {
    season = 'ordinary-time';
    seasonWeek = ordinaryWeek(date, key['baptism-of-the-lord'], key.pentecost, key['christ-the-king']);
  }

  const weekdayCycleAppliesToDate = season === 'ordinary-time';
  return {
    modelVersion: '1.0',
    date: dateISO,
    liturgicalYear,
    sundayCycle: year.sundayCycle,
    weekdayCycle: year.weekdayCycle,
    weekdayCycleAppliesToDate,
    weekdayLectionaryPattern: weekdayCycleAppliesToDate ? 'ordinary-time-two-year' : 'seasonal-annual',
    season,
    seasonWeek,
    principalDay,
    policyId: policy.id,
    jurisdictionId: policy.jurisdictionId,
    calendarSystem: 'gregorian'
  };
}

export function romanPolicyForJurisdiction(value: string | null | undefined): RomanJurisdictionPolicy {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (!normalized || normalized === 'PT' || normalized === 'JURISDICTION:ROMAN-CATHOLIC:PT') return ROMAN_PORTUGAL_POLICY;
  if (normalized === 'GLOBAL' || normalized === 'JURISDICTION:ROMAN-CATHOLIC:GLOBAL') return ROMAN_GENERAL_POLICY;
  throw new RangeError(`Unsupported Roman jurisdiction policy: ${value}.`);
}
