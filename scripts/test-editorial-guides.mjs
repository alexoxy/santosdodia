import path from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleUrl = relative => pathToFileURL(path.resolve(relative)).href;
const { EDITORIAL_GUIDES } = await import(moduleUrl('data/editorial-guides.ts'));
const { DATE_EDITORIAL_BATCH_3 } = await import(moduleUrl('data/date-editorial-batch-3.ts'));
const { getAnnualDateEditorial } = await import(moduleUrl('data/date-editorial-registry.ts'));
const { getSaintBiographyRecord } = await import(moduleUrl('data/saint-biography-registry.ts'));
const { isSaintBiographyReadyForLaunchedLocales } = await import(moduleUrl('lib/editorial-profile-quality.ts'));
const { getPublicAllObservances } = await import(moduleUrl('lib/public-observances.ts'));

const failures = [];
const locales = ['en','es','pt','it'];
const expectedDates = ['05-21','07-26','08-11','11-24','12-26'];
const guideSlugs = new Set(EDITORIAL_GUIDES.map(guide => guide.slug));
const publicIds = new Set(getPublicAllObservances(2026, 'en').map(item => item.id));

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
    const biography = getSaintBiographyRecord(profileId);
    if (!biography) failures.push(`${guide.slug}: missing biography ${profileId}`);
    else if (!isSaintBiographyReadyForLaunchedLocales(biography)) failures.push(`${guide.slug}: profile ${profileId} is below the launched-locale publication threshold`);
  }

  for (const monthDay of guide.monthDays) {
    if (!/^\d{2}-\d{2}$/.test(monthDay)) failures.push(`${guide.slug}: invalid annual date ${monthDay}`);
    for (const locale of locales) {
      if (!getAnnualDateEditorial(monthDay, locale)) failures.push(`${guide.slug}: date ${monthDay} lacks ${locale} editorial context`);
    }
  }

  for (const observanceId of guide.observanceIds) {
    if (!publicIds.has(observanceId)) failures.push(`${guide.slug}: observance ${observanceId} is not in the approved public fallback corpus`);
  }

  for (const relatedSlug of guide.relatedSlugs) {
    if (!guideSlugs.has(relatedSlug)) failures.push(`${guide.slug}: unresolved related guide ${relatedSlug}`);
  }
}

const batchDates = DATE_EDITORIAL_BATCH_3.map(item => item.monthDay).sort();
if (batchDates.join('|') !== expectedDates.sort().join('|')) failures.push(`unexpected Editorial Scale 6 date batch: ${batchDates.join(', ')}`);
for (const item of DATE_EDITORIAL_BATCH_3) {
  for (const locale of locales) {
    if (!item.copy[locale]) failures.push(`${item.monthDay}: missing ${locale} date copy`);
  }
}

if (failures.length) {
  console.error(`Editorial guide integrity failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Editorial guide integrity passed: ${EDITORIAL_GUIDES.length} guides, ${DATE_EDITORIAL_BATCH_3.length} new flagship dates, all launched locales source-linked.`);
