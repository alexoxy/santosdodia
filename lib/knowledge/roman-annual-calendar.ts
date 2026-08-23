import {
  calculateRomanLiturgicalYear,
  romanDateContext,
  type RomanDateContext,
  type RomanJurisdictionPolicy,
  type RomanPrincipalDay
} from './roman-liturgical-year';
import {
  resolveRomanPrecedence,
  romanPrecedenceLevelForClass,
  type RomanPrecedenceCandidate,
  type RomanPrecedenceClassCode,
  type RomanPrecedenceResolution
} from './roman-precedence';

export type RomanAnnualCandidateOrigin = 'temporale' | 'sanctorale' | 'proper';

export type RomanAnnualCalendarCandidate = RomanPrecedenceCandidate & {
  dateISO: string;
  origin: RomanAnnualCandidateOrigin;
  observanceId?: string;
  sourceIds?: string[];
};

export type RomanAnnualCalendarDay = {
  dateISO: string;
  context: RomanDateContext;
  candidates: RomanAnnualCalendarCandidate[];
  precedence: RomanPrecedenceResolution;
  celebratedCandidateId: string | null;
  permittedCandidateIds: string[];
  transferRequiredCandidateIds: string[];
  omittedCandidateIds: string[];
};

export type RomanAnnualCalendar = {
  modelVersion: '0.2-shadow';
  civilYear: number;
  churchId: 'church:roman-catholic';
  jurisdictionId: string;
  calendarSystem: 'gregorian';
  days: RomanAnnualCalendarDay[];
  unresolvedDates: string[];
  transferQueue: Array<{ dateISO: string; candidateId: string }>;
  counts: {
    days: number;
    leapYear: boolean;
    suppliedCandidates: number;
    unresolvedDates: number;
    transferRequired: number;
    datesWithOptions: number;
  };
  publicationAllowed: false;
};

const principalClass: Partial<Record<RomanPrincipalDay, { precedenceClass: RomanPrecedenceClassCode; isSolemnity: boolean }>> = {
  'holy-thursday': { precedenceClass: 'paschal-triduum', isSolemnity: false },
  'good-friday': { precedenceClass: 'paschal-triduum', isSolemnity: false },
  'holy-saturday': { precedenceClass: 'paschal-triduum', isSolemnity: false },
  'easter-sunday': { precedenceClass: 'paschal-triduum', isSolemnity: false },
  christmas: { precedenceClass: 'principal-temporale', isSolemnity: true },
  'holy-family': { precedenceClass: 'general-lord-feast', isSolemnity: false },
  epiphany: { precedenceClass: 'principal-temporale', isSolemnity: true },
  ascension: { precedenceClass: 'principal-temporale', isSolemnity: true },
  pentecost: { precedenceClass: 'principal-temporale', isSolemnity: true },
  'ash-wednesday': { precedenceClass: 'principal-temporale', isSolemnity: false },
  'first-sunday-of-lent': { precedenceClass: 'principal-temporale', isSolemnity: false },
  'palm-sunday': { precedenceClass: 'principal-temporale', isSolemnity: false },
  'first-sunday-of-advent': { precedenceClass: 'principal-temporale', isSolemnity: false },
  'trinity-sunday': { precedenceClass: 'general-calendar-solemnity', isSolemnity: true },
  'corpus-christi': { precedenceClass: 'general-calendar-solemnity', isSolemnity: true },
  'sacred-heart': { precedenceClass: 'general-calendar-solemnity', isSolemnity: true },
  'christ-the-king': { precedenceClass: 'general-calendar-solemnity', isSolemnity: true },
  'baptism-of-the-lord': { precedenceClass: 'general-lord-feast', isSolemnity: false }
};

function dateFromIso(dateISO: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(dateISO);
  if (!match) throw new RangeError(`Invalid annual-calendar date ${dateISO}.`);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (date.toISOString().slice(0, 10) !== dateISO) throw new RangeError(`Invalid annual-calendar date ${dateISO}.`);
  return date;
}

function addIsoDays(dateISO: string, amount: number): string {
  const date = dateFromIso(dateISO);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function isSunday(dateISO: string): boolean {
  return dateFromIso(dateISO).getUTCDay() === 0;
}

function monthDay(dateISO: string): number {
  return Number(dateISO.slice(5, 7)) * 100 + Number(dateISO.slice(8, 10));
}

function isChristmasOctaveWeekday(dateISO: string): boolean {
  const md = monthDay(dateISO);
  return md >= 1226 || md <= 101;
}

function temporaleIdentity(dateISO: string, context: RomanDateContext): string {
  return `temporale:${context.principalDay ?? context.season}:${dateISO}`;
}

export function romanTemporaleCandidateForDate(
  dateISO: string,
  policy: RomanJurisdictionPolicy
): RomanAnnualCalendarCandidate {
  const context = romanDateContext(dateISO, policy);
  const liturgicalYear = calculateRomanLiturgicalYear(context.liturgicalYear, policy);
  const principal = context.principalDay ? principalClass[context.principalDay] : undefined;
  if (principal) {
    return {
      id: temporaleIdentity(dateISO, context),
      dateISO,
      origin: 'temporale',
      precedenceClass: principal.precedenceClass,
      isSolemnity: principal.isSolemnity,
      sourceIds: ['holy-see-universal-norms-liturgical-year', 'snl-portugal-precedence-table']
    };
  }

  const easter = liturgicalYear.keyDates['easter-sunday'];
  const palmSunday = liturgicalYear.keyDates['palm-sunday'];
  const octaveEnd = addIsoDays(easter, 7);
  const holyWeekMonday = addIsoDays(palmSunday, 1);
  const holyWeekWednesday = addIsoDays(palmSunday, 3);

  let precedenceClass: RomanPrecedenceClassCode;
  if (isSunday(dateISO)) {
    precedenceClass = context.season === 'advent' || context.season === 'lent' || context.season === 'easter'
      ? 'principal-temporale'
      : 'christmas-or-ordinary-sunday';
  } else if (dateISO > easter && dateISO < octaveEnd) {
    precedenceClass = 'principal-temporale';
  } else if (dateISO >= holyWeekMonday && dateISO <= holyWeekWednesday) {
    precedenceClass = 'principal-temporale';
  } else if (context.season === 'lent') {
    precedenceClass = 'privileged-weekday';
  } else if (context.season === 'advent' && monthDay(dateISO) >= 1217 && monthDay(dateISO) <= 1224) {
    precedenceClass = 'privileged-weekday';
  } else if (isChristmasOctaveWeekday(dateISO)) {
    precedenceClass = 'privileged-weekday';
  } else {
    precedenceClass = 'ordinary-weekday';
  }

  return {
    id: temporaleIdentity(dateISO, context),
    dateISO,
    origin: 'temporale',
    precedenceClass,
    isSolemnity: false,
    sourceIds: ['holy-see-universal-norms-liturgical-year', 'snl-portugal-precedence-table']
  };
}

function enumerateCivilYear(year: number): string[] {
  if (!Number.isInteger(year) || year < 1583 || year > 4099) throw new RangeError('Civil year must be between 1583 and 4099.');
  const result: string[] = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor.getUTCFullYear() === year) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

function validateSuppliedCandidates(year: number, candidates: RomanAnnualCalendarCandidate[]): void {
  const ids = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.origin === 'temporale') throw new RangeError(`Supplied candidate ${candidate.id} cannot claim temporale origin.`);
    if (Number(candidate.dateISO.slice(0, 4)) !== year) throw new RangeError(`Candidate ${candidate.id} is outside civil year ${year}.`);
    dateFromIso(candidate.dateISO);
    romanPrecedenceLevelForClass(candidate.precedenceClass);
    if (ids.has(candidate.id)) throw new RangeError(`Duplicate annual candidate ID: ${candidate.id}.`);
    ids.add(candidate.id);
  }
}

export function generateRomanAnnualCalendar(
  civilYear: number,
  policy: RomanJurisdictionPolicy,
  suppliedCandidates: RomanAnnualCalendarCandidate[] = []
): RomanAnnualCalendar {
  validateSuppliedCandidates(civilYear, suppliedCandidates);
  const suppliedByDate = new Map<string, RomanAnnualCalendarCandidate[]>();
  for (const candidate of suppliedCandidates) {
    const list = suppliedByDate.get(candidate.dateISO) ?? [];
    list.push(candidate);
    suppliedByDate.set(candidate.dateISO, list);
  }

  const days = enumerateCivilYear(civilYear).map(dateISO => {
    const context = romanDateContext(dateISO, policy);
    const candidates = [romanTemporaleCandidateForDate(dateISO, policy), ...(suppliedByDate.get(dateISO) ?? [])];
    const precedence = resolveRomanPrecedence(candidates);
    return {
      dateISO,
      context,
      candidates,
      precedence,
      celebratedCandidateId: precedence.winnerId,
      permittedCandidateIds: precedence.permittedOptionIds,
      transferRequiredCandidateIds: precedence.decisions.filter(item => item.action === 'transfer-required').map(item => item.id),
      omittedCandidateIds: precedence.decisions.filter(item => item.action === 'omit').map(item => item.id)
    } satisfies RomanAnnualCalendarDay;
  });

  const unresolvedDates = days.filter(day => day.precedence.status === 'tie-requires-policy').map(day => day.dateISO);
  const transferQueue = days.flatMap(day => day.transferRequiredCandidateIds.map(candidateId => ({ dateISO: day.dateISO, candidateId })));
  return {
    modelVersion: '0.2-shadow',
    civilYear,
    churchId: policy.churchId,
    jurisdictionId: policy.jurisdictionId,
    calendarSystem: policy.calendarSystem,
    days,
    unresolvedDates,
    transferQueue,
    counts: {
      days: days.length,
      leapYear: days.length === 366,
      suppliedCandidates: suppliedCandidates.length,
      unresolvedDates: unresolvedDates.length,
      transferRequired: transferQueue.length,
      datesWithOptions: days.filter(day => day.precedence.status === 'resolved-options').length
    },
    publicationAllowed: false
  };
}
