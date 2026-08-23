export type RomanPrecedenceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type RomanPrecedenceSection = 'I' | 'II' | 'III';

export type RomanPrecedenceClassCode =
  | 'paschal-triduum'
  | 'principal-temporale'
  | 'general-calendar-solemnity'
  | 'proper-solemnity'
  | 'general-lord-feast'
  | 'christmas-or-ordinary-sunday'
  | 'general-marian-or-saint-feast'
  | 'proper-feast'
  | 'privileged-weekday'
  | 'general-obligatory-memorial'
  | 'proper-obligatory-memorial'
  | 'optional-memorial'
  | 'ordinary-weekday';

export type RomanPrecedenceTableEntry = {
  level: RomanPrecedenceLevel;
  section: RomanPrecedenceSection;
  code: RomanPrecedenceClassCode;
  description: string;
};

export const ROMAN_PRECEDENCE_SOURCE_ID = 'snl-portugal-precedence-table' as const;

export const ROMAN_PRECEDENCE_TABLE: RomanPrecedenceTableEntry[] = [
  { level: 1, section: 'I', code: 'paschal-triduum', description: 'Paschal Triduum of the Passion and Resurrection of the Lord.' },
  { level: 2, section: 'I', code: 'principal-temporale', description: 'Christmas, Epiphany, Ascension, Pentecost; Sundays of Advent, Lent and Easter; Ash Wednesday; Holy Week weekdays Monday-Thursday; days within the Easter Octave.' },
  { level: 3, section: 'I', code: 'general-calendar-solemnity', description: 'Solemnities of the Lord, Blessed Virgin Mary and Saints in the General Calendar; Commemoration of All the Faithful Departed.' },
  { level: 4, section: 'I', code: 'proper-solemnity', description: 'Proper solemnities: principal patron, dedication/title of own church, founder/title/principal patron of an order or congregation.' },
  { level: 5, section: 'II', code: 'general-lord-feast', description: 'Feasts of the Lord in the General Calendar.' },
  { level: 6, section: 'II', code: 'christmas-or-ordinary-sunday', description: 'Sundays of Christmas Time and Sundays in Ordinary Time.' },
  { level: 7, section: 'II', code: 'general-marian-or-saint-feast', description: 'Feasts of the Blessed Virgin Mary and Saints in the General Calendar.' },
  { level: 8, section: 'II', code: 'proper-feast', description: 'Proper feasts of dioceses, regions, nations, churches, orders or congregations.' },
  { level: 9, section: 'II', code: 'privileged-weekday', description: 'Advent weekdays 17-24 December; days within the Christmas Octave; weekdays of Lent.' },
  { level: 10, section: 'III', code: 'general-obligatory-memorial', description: 'Obligatory memorials of the General Calendar.' },
  { level: 11, section: 'III', code: 'proper-obligatory-memorial', description: 'Proper obligatory memorials.' },
  { level: 12, section: 'III', code: 'optional-memorial', description: 'Optional memorials and obligatory memorials observed as optional memorials when the norms permit.' },
  { level: 13, section: 'III', code: 'ordinary-weekday', description: 'Other weekdays of Advent, Christmas Time, Easter Time and Ordinary Time.' }
];

const levelByCode = new Map<RomanPrecedenceClassCode, RomanPrecedenceLevel>(
  ROMAN_PRECEDENCE_TABLE.map(entry => [entry.code, entry.level])
);

export type RomanPrecedenceCandidate = {
  id: string;
  precedenceClass: RomanPrecedenceClassCode;
  isSolemnity: boolean;
};

export type RomanPrecedenceDecision = {
  id: string;
  precedenceLevel: RomanPrecedenceLevel;
  action: 'celebrate' | 'permitted-option' | 'transfer-required' | 'omit' | 'unresolved-tie';
  reasonCode:
    | 'highest-precedence'
    | 'optional-memorial-choice'
    | 'ferial-alternative-to-optional-memorial'
    | 'solemnity-impeded-by-higher-precedence'
    | 'lower-precedence-omitted'
    | 'equal-highest-precedence-requires-policy';
};

export type RomanPrecedenceResolution = {
  modelVersion: '1.1';
  status: 'empty' | 'resolved' | 'resolved-options' | 'tie-requires-policy';
  winnerId: string | null;
  permittedOptionIds: string[];
  winningPrecedenceLevel: RomanPrecedenceLevel | null;
  decisions: RomanPrecedenceDecision[];
  transferRule: {
    appliesToImpededSolemnities: true;
    destinationMustBeFreeOfLevels: readonly [1, 2, 3, 4, 5, 6, 7, 8];
    targetDateResolvedByThisFunction: false;
  };
  sourceIds: string[];
};

export function romanPrecedenceLevelForClass(code: RomanPrecedenceClassCode): RomanPrecedenceLevel {
  const level = levelByCode.get(code);
  if (!level) throw new RangeError(`Unsupported Roman precedence class: ${code}.`);
  return level;
}

function validateCandidates(candidates: RomanPrecedenceCandidate[]): void {
  const ids = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate.id || candidate.id.trim() !== candidate.id) {
      throw new RangeError('Roman precedence candidate IDs must be non-empty and whitespace-normalized.');
    }
    if (ids.has(candidate.id)) throw new RangeError(`Duplicate Roman precedence candidate ID: ${candidate.id}.`);
    ids.add(candidate.id);

    const level = romanPrecedenceLevelForClass(candidate.precedenceClass);
    if (candidate.isSolemnity && (level < 2 || level > 4)) {
      throw new RangeError(`Candidate ${candidate.id} cannot be marked as a solemnity at precedence level ${level}.`);
    }
  }
}

export function resolveRomanPrecedence(candidates: RomanPrecedenceCandidate[]): RomanPrecedenceResolution {
  validateCandidates(candidates);
  const normalized = candidates.map(candidate => ({
    ...candidate,
    precedenceLevel: romanPrecedenceLevelForClass(candidate.precedenceClass)
  }));

  const transferRule = {
    appliesToImpededSolemnities: true as const,
    destinationMustBeFreeOfLevels: [1, 2, 3, 4, 5, 6, 7, 8] as const,
    targetDateResolvedByThisFunction: false as const
  };

  if (normalized.length === 0) {
    return {
      modelVersion: '1.1',
      status: 'empty',
      winnerId: null,
      permittedOptionIds: [],
      winningPrecedenceLevel: null,
      decisions: [],
      transferRule,
      sourceIds: [ROMAN_PRECEDENCE_SOURCE_ID]
    };
  }

  const winningPrecedenceLevel = Math.min(...normalized.map(candidate => candidate.precedenceLevel)) as RomanPrecedenceLevel;
  const top = normalized.filter(candidate => candidate.precedenceLevel === winningPrecedenceLevel);

  // Optional memorials are genuine choices rather than a forced winner. On an ordinary
  // weekday the feria remains a legitimate alternative even when one or more optional
  // memorials are available. This is represented explicitly instead of manufacturing a tie.
  if (winningPrecedenceLevel === 12 && top.every(candidate => candidate.precedenceClass === 'optional-memorial')) {
    const ordinaryFerialAlternatives = normalized.filter(candidate => candidate.precedenceClass === 'ordinary-weekday');
    const permittedOptionIds = [...top, ...ordinaryFerialAlternatives].map(candidate => candidate.id);
    return {
      modelVersion: '1.1',
      status: 'resolved-options',
      winnerId: null,
      permittedOptionIds,
      winningPrecedenceLevel,
      decisions: normalized.map(candidate => {
        if (candidate.precedenceClass === 'optional-memorial' && candidate.precedenceLevel === 12) {
          return {
            id: candidate.id,
            precedenceLevel: candidate.precedenceLevel,
            action: 'permitted-option' as const,
            reasonCode: 'optional-memorial-choice' as const
          };
        }
        if (candidate.precedenceClass === 'ordinary-weekday') {
          return {
            id: candidate.id,
            precedenceLevel: candidate.precedenceLevel,
            action: 'permitted-option' as const,
            reasonCode: 'ferial-alternative-to-optional-memorial' as const
          };
        }
        return {
          id: candidate.id,
          precedenceLevel: candidate.precedenceLevel,
          action: 'omit' as const,
          reasonCode: 'lower-precedence-omitted' as const
        };
      }),
      transferRule,
      sourceIds: [ROMAN_PRECEDENCE_SOURCE_ID]
    };
  }

  if (top.length !== 1) {
    return {
      modelVersion: '1.1',
      status: 'tie-requires-policy',
      winnerId: null,
      permittedOptionIds: [],
      winningPrecedenceLevel,
      decisions: normalized.map(candidate => ({
        id: candidate.id,
        precedenceLevel: candidate.precedenceLevel,
        action: candidate.precedenceLevel === winningPrecedenceLevel ? 'unresolved-tie' : 'omit',
        reasonCode: candidate.precedenceLevel === winningPrecedenceLevel
          ? 'equal-highest-precedence-requires-policy'
          : 'lower-precedence-omitted'
      })),
      transferRule,
      sourceIds: [ROMAN_PRECEDENCE_SOURCE_ID]
    };
  }

  const winner = top[0];
  return {
    modelVersion: '1.1',
    status: 'resolved',
    winnerId: winner.id,
    permittedOptionIds: [winner.id],
    winningPrecedenceLevel,
    decisions: normalized.map(candidate => {
      if (candidate.id === winner.id) {
        return {
          id: candidate.id,
          precedenceLevel: candidate.precedenceLevel,
          action: 'celebrate' as const,
          reasonCode: 'highest-precedence' as const
        };
      }
      if (candidate.isSolemnity) {
        return {
          id: candidate.id,
          precedenceLevel: candidate.precedenceLevel,
          action: 'transfer-required' as const,
          reasonCode: 'solemnity-impeded-by-higher-precedence' as const
        };
      }
      return {
        id: candidate.id,
        precedenceLevel: candidate.precedenceLevel,
        action: 'omit' as const,
        reasonCode: 'lower-precedence-omitted' as const
      };
    }),
    transferRule,
    sourceIds: [ROMAN_PRECEDENCE_SOURCE_ID]
  };
}
