import type { EntityId, EcclesiasticalOffice, ISODate, Person, SourceAssertion } from './model';

export type EcclesiasticalChangeType =
  | 'office-appointed'
  | 'office-ended'
  | 'office-succeeded'
  | 'office-transferred'
  | 'administrator-appointed'
  | 'see-vacant'
  | 'jurisdiction-created'
  | 'jurisdiction-renamed'
  | 'jurisdiction-suppressed'
  | 'cardinal-created'
  | 'person-deceased'
  | 'other-official-change';

export type SourceSnapshot = {
  id: EntityId;
  sourceId: EntityId;
  url: string;
  fetchedAt: string;
  publishedAt?: string;
  mediaType: string;
  contentHash: string;
  etag?: string;
  lastModified?: string;
  byteLength: number;
  storagePath?: string;
  status: 'current' | 'superseded' | 'failed';
};

export type IngestionCandidate = {
  id: EntityId;
  sourceId: EntityId;
  sourceUrl: string;
  snapshotId?: EntityId;
  publishedAt?: ISODate;
  heading: string;
  sourceText: string;
  changeTypes: EcclesiasticalChangeType[];
  extractedPersonNames: string[];
  extractedJurisdictionNames: string[];
  confidence: 'high' | 'medium' | 'low';
  status: 'candidate' | 'reconciled' | 'quarantined' | 'rejected' | 'applied';
  reasons: string[];
  discoveredAt: string;
};

export type EntityMatch = {
  entityId: EntityId;
  score: number;
  signals: string[];
};

export type ReconciliationResult = {
  candidateId: EntityId;
  personMatches: EntityMatch[];
  jurisdictionMatches: EntityMatch[];
  decision: 'auto-apply' | 'quarantine' | 'reject';
  reasons: string[];
};

export type EcclesiasticalChangeEvent = {
  id: EntityId;
  type: EcclesiasticalChangeType;
  effectiveAt?: ISODate;
  announcedAt?: ISODate;
  personId?: EntityId;
  jurisdictionId?: EntityId;
  previousOfficeId?: EntityId;
  resultingOffice?: EcclesiasticalOffice;
  sourceAssertions: SourceAssertion[];
  status: 'provisional' | 'active' | 'superseded' | 'retracted';
  createdAt: string;
};

export type KnowledgeMutation = {
  people?: Person[];
  offices?: EcclesiasticalOffice[];
  events?: EcclesiasticalChangeEvent[];
};

export type IngestionRun = {
  id: EntityId;
  sourceId: EntityId;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'succeeded' | 'partial' | 'failed';
  snapshotsCreated: number;
  candidatesCreated: number;
  candidatesAutoApplied: number;
  candidatesQuarantined: number;
  error?: string;
};
