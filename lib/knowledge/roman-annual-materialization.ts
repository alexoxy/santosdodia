import {
  generateRomanAnnualCalendar,
  type RomanAnnualCalendar,
  type RomanAnnualCalendarCandidate
} from './roman-annual-calendar';
import { type RomanJurisdictionPolicy } from './roman-liturgical-year';
import {
  scheduleRomanSolemnityTransfers,
  type RomanTransferMethod,
  type RomanTransferSchedule
} from './roman-solemnity-transfer';

export type AppliedRomanSolemnityTransfer = {
  candidateId: string;
  observanceId: string | null;
  originalDateISO: string;
  targetDateISO: string;
  method: RomanTransferMethod;
  sourceIds: string[];
};

export type RomanAnnualMaterializationStatus =
  | 'resolved'
  | 'unresolved-first-pass'
  | 'unresolved-transfer-schedule'
  | 'unresolved-second-pass';

export type RomanAnnualMaterialization = {
  modelVersion: '0.1-shadow';
  civilYear: number;
  status: RomanAnnualMaterializationStatus;
  firstPass: RomanAnnualCalendar;
  transferSchedule: RomanTransferSchedule;
  finalCalendar: RomanAnnualCalendar | null;
  appliedTransfers: AppliedRomanSolemnityTransfer[];
  unresolvedDates: string[];
  publicationAllowed: false;
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function candidateIndex(candidates: RomanAnnualCalendarCandidate[]): Map<string, RomanAnnualCalendarCandidate> {
  return new Map(candidates.map(candidate => [candidate.id, candidate]));
}

function unresolvedResult(
  civilYear: number,
  status: Exclude<RomanAnnualMaterializationStatus, 'resolved'>,
  firstPass: RomanAnnualCalendar,
  transferSchedule: RomanTransferSchedule,
  unresolvedDates: string[]
): RomanAnnualMaterialization {
  return {
    modelVersion: '0.1-shadow',
    civilYear,
    status,
    firstPass,
    transferSchedule,
    finalCalendar: null,
    appliedTransfers: [],
    unresolvedDates: unique(unresolvedDates).sort(),
    publicationAllowed: false
  };
}

export function materializeRomanAnnualCalendarWithTransfers(
  civilYear: number,
  policy: RomanJurisdictionPolicy,
  suppliedCandidates: RomanAnnualCalendarCandidate[] = []
): RomanAnnualMaterialization {
  const firstPass = generateRomanAnnualCalendar(civilYear, policy, suppliedCandidates);
  const transferSchedule = scheduleRomanSolemnityTransfers(firstPass, policy);

  if (firstPass.unresolvedDates.length > 0) {
    return unresolvedResult(
      civilYear,
      'unresolved-first-pass',
      firstPass,
      transferSchedule,
      firstPass.unresolvedDates
    );
  }

  const unresolvedTransfers = transferSchedule.proposals.filter(proposal => proposal.status !== 'resolved');
  if (unresolvedTransfers.length > 0) {
    return unresolvedResult(
      civilYear,
      'unresolved-transfer-schedule',
      firstPass,
      transferSchedule,
      unresolvedTransfers.map(proposal => proposal.originalDateISO)
    );
  }

  const byId = candidateIndex(suppliedCandidates);
  const moveById = new Map(
    transferSchedule.proposals.map(proposal => {
      if (!proposal.targetDateISO) throw new Error(`Resolved transfer ${proposal.candidateId} has no target date.`);
      return [proposal.candidateId, proposal] as const;
    })
  );

  for (const candidateId of moveById.keys()) {
    if (!byId.has(candidateId)) {
      throw new RangeError(`Transfer candidate ${candidateId} is not part of the supplied annual candidates.`);
    }
  }

  const transferredCandidates = suppliedCandidates.map(candidate => {
    const proposal = moveById.get(candidate.id);
    if (!proposal) return { ...candidate, sourceIds: candidate.sourceIds ? [...candidate.sourceIds] : undefined };
    return {
      ...candidate,
      dateISO: proposal.targetDateISO!,
      sourceIds: unique([...(candidate.sourceIds ?? []), ...proposal.sourceIds])
    };
  });

  const finalCalendar = generateRomanAnnualCalendar(civilYear, policy, transferredCandidates);
  const secondPassUnresolved = unique([
    ...finalCalendar.unresolvedDates,
    ...finalCalendar.transferQueue.map(item => item.dateISO)
  ]);
  if (secondPassUnresolved.length > 0) {
    return unresolvedResult(
      civilYear,
      'unresolved-second-pass',
      firstPass,
      transferSchedule,
      secondPassUnresolved
    );
  }

  const appliedTransfers: AppliedRomanSolemnityTransfer[] = transferSchedule.proposals.map(proposal => ({
    candidateId: proposal.candidateId,
    observanceId: proposal.observanceId,
    originalDateISO: proposal.originalDateISO,
    targetDateISO: proposal.targetDateISO!,
    method: proposal.method,
    sourceIds: [...proposal.sourceIds]
  }));

  return {
    modelVersion: '0.1-shadow',
    civilYear,
    status: 'resolved',
    firstPass,
    transferSchedule,
    finalCalendar,
    appliedTransfers,
    unresolvedDates: [],
    publicationAllowed: false
  };
}
