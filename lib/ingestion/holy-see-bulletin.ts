import type { EcclesiasticalChangeType, IngestionCandidate } from '../knowledge/change-model';

export type BulletinSection = {
  heading: string;
  body: string;
  sourceUrl: string;
  publishedAt?: `${number}-${number}-${number}`;
};

const OFFICE_WORDS = '(?:bishop|archbishop|metropolitan archbishop|auxiliary bishop|coadjutor bishop|apostolic administrator|apostolic nuncio|ordinary|patriarch|exarch|vicar apostolic|prefect apostolic)';
const JURISDICTION_WORDS = '(?:diocese|archdiocese|eparchy|exarchate|ordinariate|vicariate|prefecture|patriarchate|nunciature)';

function clean(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function classify(heading: string, body: string): EcclesiasticalChangeType[] {
  const text = `${heading} ${body}`.toLowerCase();
  const types: EcclesiasticalChangeType[] = [];

  if (/resignation|accepted the resignation|retirement/.test(text)) types.push('office-ended');
  if (/succession|will succeed|has succeeded/.test(text)) types.push('office-succeeded');
  if (/transferr(?:ed|ing)|transfer of/.test(text)) types.push('office-transferred');
  if (/apostolic administrator/.test(text)) types.push('administrator-appointed');
  if (/sede vacante|see vacant/.test(text)) types.push('see-vacant');
  if (/appointment|has appointed|has named|election of/.test(text)) types.push('office-appointed');
  if (/creation of cardinals|created cardinal|consistory/.test(text)) types.push('cardinal-created');
  if (/death of|deceased|has died/.test(text)) types.push('person-deceased');
  if (/erection of (?:the )?(?:diocese|eparchy|exarchate|ordinariate)|has erected/.test(text)) types.push('jurisdiction-created');
  if (/renaming of|has renamed/.test(text)) types.push('jurisdiction-renamed');
  if (/suppression of|has suppressed/.test(text)) types.push('jurisdiction-suppressed');

  return unique(types) as EcclesiasticalChangeType[];
}

function extractPersonNames(text: string): string[] {
  const names: string[] = [];
  const nameWord = "[\\p{Lu}][\\p{L}'’\\-]+";
  const initial = '[\\p{Lu}]\\.';
  const titledName = new RegExp(`\\b(?:H\\.E\\.\\s+Mons\\.|His Excellency(?:\\s+Mons\\.)?|Bishop|Archbishop|Cardinal|Mons\\.|Msgr\\.|The Reverend(?:\\s+Father|\\s+Sister)?|Reverend(?:\\s+Father|\\s+Sister)?|Father)\\s+(${nameWord}(?:\\s+(?:${nameWord}|${initial})){1,7})`, 'gu');
  for (const match of text.matchAll(titledName)) names.push(match[1]);

  const appointed = new RegExp(`(?:has appointed|has named)\\s+(?:the\\s+)?(?:Reverend\\s+Sister|Reverend\\s+Father|Reverend|Bishop|Archbishop|Cardinal|Dr\\.)?\\s*(${nameWord}(?:\\s+(?:${nameWord}|${initial})){1,7})\\s*,`, 'gu');
  for (const match of text.matchAll(appointed)) names.push(match[1]);

  return unique(names).filter(name => !/^(Holy Father|His Holiness|Roman Church)$/i.test(name));
}

function normalizeJurisdictionName(value: string): string {
  return clean(value)
    .replace(/\s+(?:submitted|presented|who|which|and has).*$/i, '')
    .replace(new RegExp(`^the\\s+${JURISDICTION_WORDS}\\s+of\\s+`, 'i'), '')
    .trim();
}

function extractJurisdictionNames(text: string): string[] {
  const names: string[] = [];
  const direct = new RegExp(`\\b${JURISDICTION_WORDS}\\s+of\\s+([^.;:]+)`, 'giu');
  for (const match of text.matchAll(direct)) names.push(match[1]);

  const office = new RegExp(`\\b${OFFICE_WORDS}\\s+of\\s+([^.;:]+)`, 'giu');
  for (const match of text.matchAll(office)) names.push(match[1]);

  return unique(names.map(normalizeJurisdictionName));
}

function confidenceFor(changeTypes: EcclesiasticalChangeType[], people: string[], jurisdictions: string[]): IngestionCandidate['confidence'] {
  if (changeTypes.length === 1 && people.length === 1 && jurisdictions.length === 1) return 'high';
  if (changeTypes.length && people.length) return 'medium';
  return 'low';
}

function slug(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export function parseHolySeeBulletinSection(section: BulletinSection, discoveredAt = new Date().toISOString()): IngestionCandidate {
  const heading = clean(section.heading);
  const sourceText = clean(section.body);
  const changeTypes = classify(heading, sourceText);
  const extractedPersonNames = extractPersonNames(sourceText);
  const extractedJurisdictionNames = extractJurisdictionNames(`${heading}. ${sourceText}`);
  const confidence = confidenceFor(changeTypes, extractedPersonNames, extractedJurisdictionNames);
  const reasons: string[] = [];

  if (!changeTypes.length) reasons.push('No supported ecclesiastical change type was identified.');
  if (!extractedPersonNames.length) reasons.push('No person name could be extracted conservatively.');
  if (!extractedJurisdictionNames.length) reasons.push('No jurisdiction could be extracted conservatively.');
  if (changeTypes.length > 1) reasons.push('Compound announcement requires event-level reconciliation.');
  if (extractedPersonNames.length > 1) reasons.push('Multiple people require role disambiguation.');

  const datePart = section.publishedAt ?? discoveredAt.slice(0, 10);
  const stablePart = slug(`${datePart}-${heading}`) || 'unclassified';

  return {
    id: `candidate:holy-see:${stablePart}`,
    sourceId: 'holy-see-bulletin',
    sourceUrl: section.sourceUrl,
    publishedAt: section.publishedAt,
    heading,
    sourceText,
    changeTypes,
    extractedPersonNames,
    extractedJurisdictionNames,
    confidence,
    status: confidence === 'low' ? 'quarantined' : 'candidate',
    reasons,
    discoveredAt
  };
}

export function parseHolySeeBulletinSections(sections: BulletinSection[], discoveredAt = new Date().toISOString()): IngestionCandidate[] {
  return sections.map(section => parseHolySeeBulletinSection(section, discoveredAt));
}
