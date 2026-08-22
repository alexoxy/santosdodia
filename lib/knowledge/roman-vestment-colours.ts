import type { RomanDateContext, RomanPrincipalDay, RomanSeason } from './roman-liturgical-year';

export type RomanVestmentColourCode = 'white' | 'red' | 'green' | 'violet' | 'black' | 'rose';

export type RomanVestmentColourResolution = {
  modelVersion: '1.0';
  defaultColour: RomanVestmentColourCode | null;
  permittedAlternativeColours: RomanVestmentColourCode[];
  resolvedColour: RomanVestmentColourCode | null;
  resolutionScope: 'principal-temporale' | 'seasonal-default' | 'optional-colour' | 'holy-saturday';
  finalOccurrenceResolutionRequired: boolean;
  festiveVestmentsMayReplaceDayColour: boolean;
  specialCase: 'holy-saturday-no-mass-before-easter-vigil' | null;
  sourceIds: string[];
};

export const ROMAN_VESTMENT_COLOUR_CODES: RomanVestmentColourCode[] = [
  'white',
  'red',
  'green',
  'violet',
  'black',
  'rose'
];

export const ROMAN_VESTMENT_COLOUR_SOURCE_IDS = [
  'snl-portugal-vestment-colours'
] as const;

const principalColours: Partial<Record<RomanPrincipalDay, RomanVestmentColourCode>> = {
  christmas: 'white',
  epiphany: 'white',
  'baptism-of-the-lord': 'white',
  'ash-wednesday': 'violet',
  'first-sunday-of-lent': 'violet',
  'palm-sunday': 'red',
  'holy-thursday': 'white',
  'good-friday': 'red',
  'easter-sunday': 'white',
  ascension: 'white',
  pentecost: 'red',
  'trinity-sunday': 'white',
  'corpus-christi': 'white',
  'sacred-heart': 'white',
  'christ-the-king': 'white',
  'first-sunday-of-advent': 'violet'
};

const seasonalDefaults: Record<RomanSeason, RomanVestmentColourCode> = {
  advent: 'violet',
  christmas: 'white',
  'ordinary-time': 'green',
  lent: 'violet',
  easter: 'white'
};

function isSunday(dateISO: string): boolean {
  return new Date(`${dateISO}T00:00:00Z`).getUTCDay() === 0;
}

function isGaudeteOrLaetare(context: RomanDateContext): boolean {
  if (!isSunday(context.date)) return false;
  return (context.season === 'advent' && context.seasonWeek === 3)
    || (context.season === 'lent' && context.seasonWeek === 4);
}

export function romanVestmentColoursForDateContext(context: RomanDateContext): RomanVestmentColourResolution {
  if (context.principalDay === 'holy-saturday') {
    return {
      modelVersion: '1.0',
      defaultColour: null,
      permittedAlternativeColours: [],
      resolvedColour: null,
      resolutionScope: 'holy-saturday',
      finalOccurrenceResolutionRequired: false,
      festiveVestmentsMayReplaceDayColour: false,
      specialCase: 'holy-saturday-no-mass-before-easter-vigil',
      sourceIds: [...ROMAN_VESTMENT_COLOUR_SOURCE_IDS]
    };
  }

  const principalColour = context.principalDay ? principalColours[context.principalDay] : undefined;
  if (principalColour) {
    return {
      modelVersion: '1.0',
      defaultColour: principalColour,
      permittedAlternativeColours: [],
      resolvedColour: principalColour,
      resolutionScope: 'principal-temporale',
      finalOccurrenceResolutionRequired: false,
      festiveVestmentsMayReplaceDayColour: true,
      specialCase: null,
      sourceIds: [...ROMAN_VESTMENT_COLOUR_SOURCE_IDS]
    };
  }

  const defaultColour = seasonalDefaults[context.season];
  if (isGaudeteOrLaetare(context)) {
    return {
      modelVersion: '1.0',
      defaultColour,
      permittedAlternativeColours: ['rose'],
      resolvedColour: null,
      resolutionScope: 'optional-colour',
      finalOccurrenceResolutionRequired: false,
      festiveVestmentsMayReplaceDayColour: false,
      specialCase: null,
      sourceIds: [...ROMAN_VESTMENT_COLOUR_SOURCE_IDS]
    };
  }

  return {
    modelVersion: '1.0',
    defaultColour,
    permittedAlternativeColours: [],
    resolvedColour: null,
    resolutionScope: 'seasonal-default',
    finalOccurrenceResolutionRequired: true,
    festiveVestmentsMayReplaceDayColour: false,
    specialCase: null,
    sourceIds: [...ROMAN_VESTMENT_COLOUR_SOURCE_IDS]
  };
}

export function romanMassForTheDeadColourOptions(): {
  defaultColour: 'violet';
  permittedAlternativeColours: ['black'];
  sourceIds: string[];
} {
  return {
    defaultColour: 'violet',
    permittedAlternativeColours: ['black'],
    sourceIds: [...ROMAN_VESTMENT_COLOUR_SOURCE_IDS]
  };
}
