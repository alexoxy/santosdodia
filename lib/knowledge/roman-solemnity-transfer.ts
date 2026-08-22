import type { RomanAnnualCalendar, RomanAnnualCalendarCandidate, RomanAnnualCalendarDay } from './roman-annual-calendar';
import { calculateRomanLiturgicalYear, type RomanJurisdictionPolicy } from './roman-liturgical-year';
import { romanPrecedenceLevelForClass } from './roman-precedence';

export type RomanTransferMethod =
  | 'annunciation-after-second-sunday-of-easter'
  | 'following-monday-after-privileged-sunday'
  | 'nearest-free-day';

export type RomanTransferProposalStatus =
  | 'resolved'
  | 'unresolved-target-not-free'
  | 'unresolved-equidistant'
  | 'unresolved-target-collision'
  | 'unresolved-outside-civil-year';

export type RomanTransferProposal = {
  candidateId: string;
  observanceId: string | null;
  originalDateISO: string;
  targetDateISO: string | null;
  method: RomanTransferMethod;
  status: RomanTransferProposalStatus;
  sourceIds: string[];
};

export type RomanTransferSchedule = {
  modelVersion: '0.1-shadow';
  civilYear: number;
  proposals: RomanTransferProposal[];
  resolved: number;
  unresolved: number;
  publicationAllowed: false;
};

const GENERAL_TRANSFER_SOURCE = 'snl-portugal-liturgical-year-transfer-rules';
const ANNUNCIATION_TRANSFER_SOURCE = 'snl-portugal-annunciation-transfer';

function addIsoDays(dateISO: string, amount: number): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateISO) throw new RangeError(`Invalid transfer date ${dateISO}.`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function dayByDate(calendar: RomanAnnualCalendar): Map<string, RomanAnnualCalendarDay> {
  return new Map(calendar.days.map(day => [day.dateISO, day]));
}

function candidateForTransfer(day: RomanAnnualCalendarDay, candidateId: string): RomanAnnualCalendarCandidate {
  const candidate = day.candidates.find(item => item.id === candidateId);
  if (!candidate || !candidate.isSolemnity) throw new RangeError(`Transfer queue candidate ${candidateId} is missing or is not a solemnity.`);
  return candidate;
}

function dayIsFreeOfLevelsOneToEight(day: RomanAnnualCalendarDay | undefined): boolean {
  if (!day) return false;
  return day.candidates.every(candidate => romanPrecedenceLevelForClass(candidate.precedenceClass) > 8);
}

function isPrivilegedSunday(day: RomanAnnualCalendarDay): boolean {
  const isSunday = new Date(`${day.dateISO}T00:00:00Z`).getUTCDay() === 0;
  return isSunday && (day.context.season === 'advent' || day.context.season === 'lent' || day.context.season === 'easter');
}

function isAnnunciation(candidate: RomanAnnualCalendarCandidate): boolean {
  return candidate.observanceId === 'observance:annunciation:roman-catholic';
}

function annunciationSpecialTarget(
  originalDateISO: string,
  candidate: RomanAnnualCalendarCandidate,
  policy: RomanJurisdictionPolicy
): string | null {
  if (!isAnnunciation(candidate)) return null;
  const liturgicalYear = calculateRomanLiturgicalYear(Number(originalDateISO.slice(0, 4)), policy);
  const palmSunday = liturgicalYear.keyDates['palm-sunday'];
  const easterSunday = liturgicalYear.keyDates['easter-sunday'];
  const easterOctaveEnd = addIsoDays(easterSunday, 7);
  if (originalDateISO < palmSunday || originalDateISO > easterOctaveEnd) return null;
  return addIsoDays(easterSunday, 8);
}

function nearestFreeDay(
  originalDateISO: string,
  calendar: RomanAnnualCalendar,
  byDate: Map<string, RomanAnnualCalendarDay>
): { targetDateISO: string | null; status: RomanTransferProposalStatus } {
  for (let distance = 1; distance <= 370; distance += 1) {
    const before = addIsoDays(originalDateISO, -distance);
    const after = addIsoDays(originalDateISO, distance);
    const beforeInside = before.startsWith(`${calendar.civilYear}-`);
    const afterInside = after.startsWith(`${calendar.civilYear}-`);
    const beforeFree = beforeInside && dayIsFreeOfLevelsOneToEight(byDate.get(before));
    const afterFree = afterInside && dayIsFreeOfLevelsOneToEight(byDate.get(after));
    if (beforeFree && afterFree) return { targetDateISO: null, status: 'unresolved-equidistant' };
    if (beforeFree) return { targetDateISO: before, status: 'resolved' };
    if (afterFree) return { targetDateISO: after, status: 'resolved' };
    if (!beforeInside && !afterInside) break;
  }
  return { targetDateISO: null, status: 'unresolved-outside-civil-year' };
}

function proposeOne(
  calendar: RomanAnnualCalendar,
  policy: RomanJurisdictionPolicy,
  originalDay: RomanAnnualCalendarDay,
  candidate: RomanAnnualCalendarCandidate,
  byDate: Map<string, RomanAnnualCalendarDay>
): RomanTransferProposal {
  const specialTarget = annunciationSpecialTarget(originalDay.dateISO, candidate, policy);
  if (specialTarget) {
    const inside = specialTarget.startsWith(`${calendar.civilYear}-`);
    return {
      candidateId: candidate.id,
      observanceId: candidate.observanceId ?? null,
      originalDateISO: originalDay.dateISO,
      targetDateISO: inside ? specialTarget : null,
      method: 'annunciation-after-second-sunday-of-easter',
      status: !inside
        ? 'unresolved-outside-civil-year'
        : dayIsFreeOfLevelsOneToEight(byDate.get(specialTarget))
          ? 'resolved'
          : 'unresolved-target-not-free',
      sourceIds: [GENERAL_TRANSFER_SOURCE, ANNUNCIATION_TRANSFER_SOURCE]
    };
  }

  if (isPrivilegedSunday(originalDay)
      && originalDay.context.principalDay !== 'palm-sunday'
      && originalDay.context.principalDay !== 'easter-sunday') {
    const target = addIsoDays(originalDay.dateISO, 1);
    const inside = target.startsWith(`${calendar.civilYear}-`);
    return {
      candidateId: candidate.id,
      observanceId: candidate.observanceId ?? null,
      originalDateISO: originalDay.dateISO,
      targetDateISO: inside ? target : null,
      method: 'following-monday-after-privileged-sunday',
      status: !inside
        ? 'unresolved-outside-civil-year'
        : dayIsFreeOfLevelsOneToEight(byDate.get(target))
          ? 'resolved'
          : 'unresolved-target-not-free',
      sourceIds: [GENERAL_TRANSFER_SOURCE]
    };
  }

  const nearest = nearestFreeDay(originalDay.dateISO, calendar, byDate);
  return {
    candidateId: candidate.id,
    observanceId: candidate.observanceId ?? null,
    originalDateISO: originalDay.dateISO,
    targetDateISO: nearest.targetDateISO,
    method: 'nearest-free-day',
    status: nearest.status,
    sourceIds: [GENERAL_TRANSFER_SOURCE]
  };
}

export function scheduleRomanSolemnityTransfers(
  calendar: RomanAnnualCalendar,
  policy: RomanJurisdictionPolicy
): RomanTransferSchedule {
  if (calendar.jurisdictionId !== policy.jurisdictionId || calendar.churchId !== policy.churchId) {
    throw new RangeError('Transfer scheduler policy does not match the annual calendar context.');
  }
  const byDate = dayByDate(calendar);
  const proposals = calendar.transferQueue.map(item => {
    const originalDay = byDate.get(item.dateISO);
    if (!originalDay) throw new RangeError(`Transfer queue date ${item.dateISO} is outside the annual calendar.`);
    return proposeOne(calendar, policy, originalDay, candidateForTransfer(originalDay, item.candidateId), byDate);
  });

  const targets = new Map<string, RomanTransferProposal[]>();
  for (const proposal of proposals) {
    if (proposal.status !== 'resolved' || !proposal.targetDateISO) continue;
    const list = targets.get(proposal.targetDateISO) ?? [];
    list.push(proposal);
    targets.set(proposal.targetDateISO, list);
  }
  for (const colliding of targets.values()) {
    if (colliding.length < 2) continue;
    for (const proposal of colliding) proposal.status = 'unresolved-target-collision';
  }

  return {
    modelVersion: '0.1-shadow',
    civilYear: calendar.civilYear,
    proposals,
    resolved: proposals.filter(item => item.status === 'resolved').length,
    unresolved: proposals.filter(item => item.status !== 'resolved').length,
    publicationAllowed: false
  };
}
