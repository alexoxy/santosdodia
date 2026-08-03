import type { Locale, LocalizedText } from '../i18n';
import type { Tradition } from '../../data/observances';

export type EntityId = string;
export type ISODate = `${number}-${number}-${number}`;
export type MonthDay = `${number}-${number}`;

export type TranslationQuality =
  | 'official'
  | 'editorial'
  | 'verified-machine-assisted'
  | 'transliterated'
  | 'source-only'
  | 'unavailable';

export type LocalizedField = {
  values: LocalizedText;
  quality: Partial<Record<Locale, TranslationQuality>>;
  sourceIds?: EntityId[];
};

export type ChurchFamily =
  | 'catholic'
  | 'eastern-orthodox'
  | 'oriental-orthodox'
  | 'anglican'
  | 'other-christian';

export type JurisdictionLevel =
  | 'global-church'
  | 'patriarchate'
  | 'autocephalous-church'
  | 'autonomous-church'
  | 'episcopal-conference'
  | 'province'
  | 'archdiocese'
  | 'diocese'
  | 'eparchy'
  | 'exarchate'
  | 'ordinariate'
  | 'vicariate'
  | 'prefecture'
  | 'territorial-prelature'
  | 'territorial-abbey'
  | 'religious-institute'
  | 'shrine'
  | 'parish';

export type GeographicLevel =
  | 'global'
  | 'continent'
  | 'country'
  | 'subdivision'
  | 'city'
  | 'site';

export type GeographicScope = {
  level: GeographicLevel;
  code: string;
  parentCode?: string;
};

export type CelebrationScope = {
  kind: 'universal-in-church' | 'jurisdictional' | 'geographic' | 'religious-institute' | 'local-site';
  jurisdictionIds?: EntityId[];
  geography?: GeographicScope[];
};

export type CalendarSystem =
  | 'gregorian'
  | 'julian'
  | 'revised-julian'
  | 'coptic'
  | 'ethiopian'
  | 'armenian'
  | 'mixed';

export type CalendarVariant =
  | 'default'
  | 'armenian-mother-see'
  | 'armenian-jerusalem'
  | 'coptic-alexandrian'
  | 'ethiopian-bahire-hasab'
  | 'syriac-west';

export type FixedDateRule = {
  type: 'fixed';
  calendar: CalendarSystem;
  variant?: CalendarVariant;
  month: number;
  day: number;
};

export type RelativeDateAnchor =
  | 'gregorian-easter'
  | 'orthodox-easter'
  | 'coptic-easter'
  | 'ethiopian-easter'
  | 'armenian-easter'
  | 'syriac-easter'
  | 'pentecost'
  | 'advent-start'
  | 'christmas';

export type RelativeDateRule = {
  type: 'relative';
  calendar: CalendarSystem;
  variant?: CalendarVariant;
  anchor: RelativeDateAnchor;
  offsetDays: number;
  weekdayAdjustment?: {
    direction: 'previous' | 'next' | 'nearest';
    weekday: number;
  };
};

export type AnnualPublishedDateRule = {
  type: 'annual-published';
  calendar: CalendarSystem;
  variant?: CalendarVariant;
  sourceId: EntityId;
  fallbackRule?: FixedDateRule | RelativeDateRule;
};

export type DateRule = FixedDateRule | RelativeDateRule | AnnualPublishedDateRule;

export type Church = {
  id: EntityId;
  family: ChurchFamily;
  tradition?: Tradition;
  name: LocalizedField;
  canonicalUrl?: string;
  calendarSystems: CalendarSystem[];
  parentChurchId?: EntityId;
  sourceIds: EntityId[];
};

export type Jurisdiction = {
  id: EntityId;
  churchId: EntityId;
  level: JurisdictionLevel;
  name: LocalizedField;
  geography: GeographicScope[];
  parentJurisdictionId?: EntityId;
  officialUrl?: string;
  activeFrom?: ISODate;
  activeUntil?: ISODate;
  sourceIds: EntityId[];
};

export type Person = {
  id: EntityId;
  entityType: 'saint' | 'blessed' | 'venerable' | 'servant-of-god' | 'cleric' | 'historical-person';
  name: LocalizedField;
  aliases?: LocalizedField;
  birthDate?: ISODate;
  deathDate?: ISODate;
  churchIds: EntityId[];
  externalIds?: Record<string, string>;
  sourceIds: EntityId[];
};

export type Observance = {
  id: EntityId;
  subjectIds: EntityId[];
  churchId: EntityId;
  calendarId: EntityId;
  name: LocalizedField;
  dateRule: DateRule;
  scope: CelebrationScope;
  rank?: string;
  colour?: string;
  validFrom?: ISODate;
  validUntil?: ISODate;
  sourceIds: EntityId[];
};

export type EcclesiasticalOffice = {
  id: EntityId;
  personId: EntityId;
  jurisdictionId: EntityId;
  officeType: string;
  appointedAt?: ISODate;
  installedAt?: ISODate;
  endedAt?: ISODate;
  status: 'announced' | 'appointed' | 'installed' | 'active' | 'emeritus' | 'ended';
  sourceIds: EntityId[];
};

export type SourceAssertion<T = unknown> = {
  id: EntityId;
  subjectId: EntityId;
  field: string;
  value: T;
  sourceId: EntityId;
  sourceUrl: string;
  observedAt: string;
  effectiveFrom?: ISODate;
  effectiveUntil?: ISODate;
  contentHash?: string;
  confidence: 'authoritative' | 'corroborated' | 'provisional';
};
