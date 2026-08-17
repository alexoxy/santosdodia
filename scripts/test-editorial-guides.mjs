import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const moduleUrl = relative => pathToFileURL(path.resolve(relative)).href;
const { EDITORIAL_GUIDES } = await import(moduleUrl('data/editorial-guides.ts'));
const { DATE_EDITORIAL_BATCH_3 } = await import(moduleUrl('data/date-editorial-batch-3.ts'));

const failures = [];
const locales = ['en','es','pt','it'];
const expectedDates = ['05-21','07-26','08-11','11-24','12-26'];
const guideSlugs = new Set(EDITORIAL_GUIDES.map(guide => guide.slug));

const dataFiles = await readdir(path.join(root, 'data'));
const biographyFiles = dataFiles.filter(name => /^saint-biograph.*\.ts$/.test(name));
const biographyCorpus = (await Promise.all(biographyFiles.map(name => readFile(path.join(root, 'data', name), 'utf8')))).join('\n');
const dateCorpus = (await Promise.all(['date-editorial.ts','date-editorial-batch-2.ts','date-editorial-batch-3.ts'].map(name => readFile(path.join(root, 'data', name), 'utf8')))).join('\n');
const observanceCorpus = await readFile(path.join(root, 'data', 'observances.ts'), 'utf8');
const priorityObservanceCorpus = await readFile(path.join(root, 'data', 'priority-observances.ts'), 'utf8');

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasFieldValue(source, field, value) {
  return new RegExp(`${field}\\s*:\\s*['\"]${escaped(value)}['\"]`).test(source);
}

function hasReviewedCoreObservance(value) {
  const token = escaped(value);
  // Core curated observances are evidence-gated through EDITORIAL_REVIEWS.
  // Keys may be quoted (hyphenated IDs) or bare identifiers (e.g. fatima).
  return new RegExp(`(?:^|\\n)\\s*(?:['\"]${token}['\"]|${token})\\s*:\\s*\\{summaries:`, 'm').test(observanceCorpus);
}

function hasVerifiedPriorityObservance(value) {
  const token = escaped(value);
  // Priority observances are a deliberately small second curated layer merged
  // by getPublicAllObservances(). Require the exact ID plus explicit verified
  // status and a source binding inside the same definition block.
  const definition = new RegExp(`id\\s*:\\s*['\"]${token}['\"][\\s\\S]{0,2600}?sourceIds\\s*:\\s*\\[[^\\]]+\\][\\s\\S]{0,1000}?validationStatus\\s*:\\s*['\"]verified['\"]`);
  return definition.test(priorityObservanceCorpus);
}

function hasPublishedObservanceEvidence(value) {
  return hasReviewedCoreObservance(value) || hasVerifiedPriorityObservance(value);
}

if (EDITORIAL_GUIDES.length !== 6) failures.push(`expected 6 editorial guides, found ${EDITORIAL_GUIDES.length}`);
if (guideSlugs.size !== EDITORIAL_GUIDES.length) failures.push('editorial guide slugs must be unique');

for (const guide of EDITORIAL_GUIDES) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug)) failures.push(`${guide.slug}: invalid canonical slug`);
  if (guide.profileIds.length === 0) failures.push(`${guide.slug}: no substantive profiles`);
  if (guide.monthDays.length === 0) failures.push(`${guide.slug}: no annual dates`);
  if (guide.observanceIds.length === 0) failures.push(`${guide.slug}: no source observances`);

  for (const locale of locales) {
    const copy = guide.copy[locale];
    if (!copy) {
      failures.push(`${guide.slug}: missing ${locale} editorial copy`);
      continue;
    }
    if (copy.title.trim().length < 20) failures.push(`${guide.slug}/${locale}: title is too thin`);
    if (copy.lead.trim().length < 80) failures.push(`${guide.slug}/${locale}: lead is too thin`);
    if (copy.paragraphs.length < 2 || copy.paragraphs.some(paragraph => paragraph.trim().length < 120)) {
      failures.push(`${guide.slug}/${locale}: requires two substantive editorial paragraphs`);
    }
  }

  for (const profileId of guide.profileIds) {
    if (!hasFieldValue(biographyCorpus, 'id', profileId)) failures.push(`${guide.slug}: missing substantive biography record ${profileId}`);
  }

  for (const monthDay of guide.monthDays) {
    if (!/^\d{2}-\d{2}$/.test(monthDay)) failures.push(`${guide.slug}: invalid annual date ${monthDay}`);
    if (!hasFieldValue(dateCorpus, 'monthDay', monthDay)) failures.push(`${guide.slug}: annual date ${monthDay} has no reviewed editorial record`);
  }

  for (const observanceId of guide.observanceIds) {
    if (!hasPublishedObservanceEvidence(observanceId)) failures.push(`${guide.slug}: observance ${observanceId} has no reviewed/verified public evidence`);
  }

  for (const relatedSlug of guide.relatedSlugs) {
    if (!guideSlugs.has(relatedSlug)) failures.push(`${guide.slug}: unresolved related guide ${relatedSlug}`);
  }
}

const batchDates = DATE_EDITORIAL_BATCH_3.map(item => item.monthDay).sort();
if (batchDates.join('|') !== expectedDates.sort().join('|')) failures.push(`unexpected Editorial Scale 6 date batch: ${batchDates.join(', ')}`);
for (const item of DATE_EDITORIAL_BATCH_3) {
  for (const locale of locales) {
    const copy = item.copy[locale];
    if (!copy) failures.push(`${item.monthDay}: missing ${locale} date copy`);
    else if (copy.lead.trim().length < 100 || copy.context.trim().length < 150) failures.push(`${item.monthDay}/${locale}: date editorial context is too thin`);
  }
}

if (failures.length) {
  console.error(`Editorial guide integrity failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Editorial guide integrity passed: ${EDITORIAL_GUIDES.length} guides, ${DATE_EDITORIAL_BATCH_3.length} new flagship dates, all launched locales source-linked.`);
