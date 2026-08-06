#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const NORMALIZATION_VERSION = '1.0';
const LANGUAGE_PRIORITY = ['pt', 'en', 'es', 'it', 'fr', 'de', 'pl', 'ru', 'uk', 'el', 'la', ''];
const PAGE_FILE_PATTERN = /^\d{4}-[a-f0-9]{64}\.json$/u;
const QID_PATTERN = /^Q[1-9]\d*$/u;

export async function normalizeWikidataSaints(inputPath, outputDir) {
  const source = await loadSource(inputPath);
  const groups = new Map();
  const sourceDocuments = [];
  let inputRows = 0;

  for (const page of source.pages) {
    const bytes = await readFile(page.path);
    const sha256 = sha256Hex(bytes);
    const parsed = JSON.parse(bytes.toString('utf8'));
    const bindings = parsed?.results?.bindings;
    if (!Array.isArray(bindings)) {
      throw new Error(`Input page is not a Wikidata SPARQL JSON result: ${page.path}`);
    }

    sourceDocuments.push({
      filename: basename(page.path),
      sha256,
      bytes: bytes.length,
      bindingCount: bindings.length,
    });

    bindings.forEach((binding, rowIndex) => {
      inputRows += 1;
      const qid = extractQid(binding?.item?.value);
      if (!qid) {
        throw new Error(`Invalid or missing Wikidata item at ${page.path} row ${rowIndex}.`);
      }
      const rows = groups.get(qid) ?? [];
      rows.push({ binding, sourceSha256: sha256, rowIndex });
      groups.set(qid, rows);
    });
  }

  const entities = [];
  const conflicts = [];
  const warnings = [];
  const metrics = {
    inputRows,
    uniqueEntities: groups.size,
    duplicateRowsCollapsed: inputRows - groups.size,
    duplicatedQids: 0,
    entitiesNeedingReview: 0,
    entitiesWithDateConflicts: 0,
    entitiesWithInvalidDateNodes: 0,
    labelFallbackToQid: 0,
    labelLanguages: {},
    dateConflicts: { birth: 0, death: 0 },
    invalidDateNodes: { birth: 0, death: 0 },
    missing: {
      label: 0,
      description: 0,
      birth: 0,
      death: 0,
      image: 0,
      portugueseArticle: 0,
    },
    multipleImages: 0,
  };

  for (const qid of [...groups.keys()].sort(compareQids)) {
    const rows = groups.get(qid);
    if (rows.length > 1) metrics.duplicatedQids += 1;

    const labels = collectLocalizedValues(rows, 'itemLabel');
    for (const label of labels) {
      const language = label.language || 'und';
      metrics.labelLanguages[language] = (metrics.labelLanguages[language] ?? 0) + 1;
    }
    const descriptions = collectLocalizedValues(rows, 'itemDescription');
    const birth = collectDates(rows, 'birth');
    const death = collectDates(rows, 'death');
    const images = collectUris(rows, 'image');
    const portugueseArticles = collectUris(rows, 'article').filter((value) => value.startsWith('https://pt.wikipedia.org/'));

    if (labels.length === 0) metrics.missing.label += 1;
    if (descriptions.length === 0) metrics.missing.description += 1;
    if (birth.candidates.length === 0) metrics.missing.birth += 1;
    if (death.candidates.length === 0) metrics.missing.death += 1;
    if (images.length === 0) metrics.missing.image += 1;
    if (portugueseArticles.length === 0) metrics.missing.portugueseArticle += 1;
    if (images.length > 1) metrics.multipleImages += 1;

    metrics.invalidDateNodes.birth += birth.invalidNodes.length;
    metrics.invalidDateNodes.death += death.invalidNodes.length;

    const entityWarnings = [];
    const hasInvalidDateNodes = birth.invalidNodes.length > 0 || death.invalidNodes.length > 0;
    if (hasInvalidDateNodes) metrics.entitiesWithInvalidDateNodes += 1;
    if (birth.invalidNodes.length) entityWarnings.push('birth_contains_non_literal_or_unsupported_value');
    if (death.invalidNodes.length) entityWarnings.push('death_contains_non_literal_or_unsupported_value');

    const entityConflicts = [];
    for (const [predicate, dateSet] of [['birth', birth], ['death', death]]) {
      if (dateSet.candidates.length > 1) {
        metrics.dateConflicts[predicate] += 1;
        const conflict = {
          conflictVersion: NORMALIZATION_VERSION,
          id: `wikidata:${qid}:${predicate}`,
          qid,
          predicate,
          severity: 'high',
          status: 'open',
          reason: 'multiple_distinct_values_in_source',
          candidates: dateSet.candidates,
          sourceRowCount: rows.length,
        };
        conflicts.push(conflict);
        entityConflicts.push(conflict.id);
      }
    }

    if (entityConflicts.length > 0) metrics.entitiesWithDateConflicts += 1;

    const canonicalName = selectCanonicalName(labels, qid);
    if (canonicalName === qid) {
      metrics.labelFallbackToQid += 1;
      entityWarnings.push('canonical_name_falls_back_to_qid');
    }
    const needsReview = entityConflicts.length > 0 || entityWarnings.length > 0;
    if (needsReview) metrics.entitiesNeedingReview += 1;

    entities.push({
      stagingVersion: NORMALIZATION_VERSION,
      id: `wikidata:${qid}`,
      entityType: 'saint',
      qid,
      canonicalName,
      canonicalSlug: `${slugify(canonicalName) || qid.toLowerCase()}-${qid.toLowerCase()}`,
      status: needsReview ? 'needs_review' : 'candidate',
      names: labels.map((entry) => ({
        language: entry.language || 'und',
        name: entry.value,
        nameType: entry.value === canonicalName ? 'canonical' : 'label',
        normalizedName: normalizeName(entry.value),
      })),
      descriptions: descriptions.map((entry) => ({ language: entry.language || 'und', value: entry.value })),
      dates: {
        birth: dateProjection(birth),
        death: dateProjection(death),
      },
      media: {
        images,
        portugueseArticles,
      },
      provenance: {
        sourceId: 'wikidata',
        licence: 'CC0-1.0',
        sourceDocuments: [...new Set(rows.map((row) => row.sourceSha256))].sort(),
        rawRowCount: rows.length,
      },
      scope: {
        wikidataClass: 'Q43115',
        liturgicalCalendarEligibility: 'unverified',
      },
      quality: {
        conflictIds: entityConflicts,
        warnings: entityWarnings.sort(),
      },
      publish: false,
    });
  }

  if (metrics.duplicateRowsCollapsed !== metrics.inputRows - metrics.uniqueEntities) {
    throw new Error('Deduplication invariant failed.');
  }

  if (metrics.entitiesNeedingReview > 0) {
    warnings.push('Some entities require editorial review before any publication.');
  }
  if (conflicts.length > 0) {
    warnings.push('Conflicting dates were preserved as candidates; no conflicting value was selected as canonical.');
  }
  warnings.push('Wikidata saint classification does not establish inclusion in a specific Christian tradition or liturgical calendar.');

  const sourceFingerprint = sha256Hex(Buffer.from(sourceDocuments.map((document) => document.sha256).join('\n')));
  const manifest = {
    stagingVersion: NORMALIZATION_VERSION,
    sourceId: 'wikidata',
    sourceRunId: source.summary?.runId ?? null,
    sourceFingerprint,
    mode: 'staging',
    publish: false,
    entityCount: entities.length,
    conflictCount: conflicts.length,
    files: {
      entities: 'entities.jsonl',
      conflicts: 'conflicts.jsonl',
      qualityReport: 'quality-report.json',
    },
  };

  const qualityReport = {
    reportVersion: NORMALIZATION_VERSION,
    sourceId: 'wikidata',
    sourceRunId: source.summary?.runId ?? null,
    sourceDocuments,
    metrics,
    warnings,
    publicationGate: {
      allowed: false,
      reason: 'staging_only_requires_scope_validation_editorial_review_and_explicit_publication_approval',
    },
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'entities.jsonl'), jsonLines(entities), 'utf8');
  await writeFile(join(outputDir, 'conflicts.jsonl'), jsonLines(conflicts), 'utf8');
  await writeFile(join(outputDir, 'quality-report.json'), `${JSON.stringify(qualityReport, null, 2)}\n`, 'utf8');
  await writeFile(join(outputDir, 'staging-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  return { manifest, qualityReport, entities, conflicts };
}

async function loadSource(inputPath) {
  const absolute = resolve(inputPath);
  const inputStat = await stat(absolute);
  if (inputStat.isFile()) {
    return { pages: [{ path: absolute }], summary: null };
  }
  if (!inputStat.isDirectory()) {
    throw new Error(`Unsupported input: ${inputPath}`);
  }

  const entries = await readdir(absolute, { withFileTypes: true });
  const pages = entries
    .filter((entry) => entry.isFile() && PAGE_FILE_PATTERN.test(entry.name))
    .map((entry) => ({ path: join(absolute, entry.name) }))
    .sort((a, b) => a.path.localeCompare(b.path));
  if (pages.length === 0) {
    throw new Error(`No Wikidata page archives found in ${inputPath}.`);
  }

  let summary = null;
  try {
    summary = JSON.parse(await readFile(join(absolute, 'summary.json'), 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  return { pages, summary };
}

function extractQid(value) {
  if (typeof value !== 'string') return null;
  const qid = value.split('/').at(-1);
  return QID_PATTERN.test(qid) ? qid : null;
}

function collectLocalizedValues(rows, field) {
  const map = new Map();
  for (const { binding } of rows) {
    const node = binding[field];
    if (!node || typeof node.value !== 'string' || node.value.trim() === '') continue;
    const language = typeof node['xml:lang'] === 'string' ? node['xml:lang'].toLowerCase() : '';
    const value = node.value.trim();
    map.set(`${language}\u0000${value}`, { language, value });
  }
  return [...map.values()].sort((a, b) => languageRank(a.language) - languageRank(b.language) || a.value.localeCompare(b.value));
}

function collectUris(rows, field) {
  return [...new Set(rows
    .map(({ binding }) => binding[field]?.value)
    .filter((value) => typeof value === 'string' && /^https?:\/\//u.test(value)))]
    .sort((a, b) => a.localeCompare(b));
}

function collectDates(rows, field) {
  const candidateMap = new Map();
  const invalidMap = new Map();
  for (const { binding } of rows) {
    const node = binding[field];
    if (!node) continue;
    const normalized = normalizeDateNode(node);
    if (normalized) {
      candidateMap.set(normalized.date, normalized);
    } else {
      const raw = typeof node.value === 'string' ? node.value : JSON.stringify(node);
      invalidMap.set(`${node.type ?? 'unknown'}\u0000${raw}`, { nodeType: node.type ?? 'unknown', raw });
    }
  }
  return {
    candidates: [...candidateMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    invalidNodes: [...invalidMap.values()].sort((a, b) => a.raw.localeCompare(b.raw)),
  };
}

function normalizeDateNode(node) {
  if (node?.type !== 'literal' || typeof node.value !== 'string') return null;
  const match = node.value.match(/^([+-]?\d{4,})-(\d{2})-(\d{2})T/u);
  if (!match) return null;
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { date: `${match[1]}-${match[2]}-${match[3]}`, raw: node.value };
}

function dateProjection(dateSet) {
  return {
    canonical: dateSet.candidates.length === 1 ? dateSet.candidates[0].date : null,
    candidates: dateSet.candidates,
    invalidNodes: dateSet.invalidNodes,
    resolutionStatus: dateSet.candidates.length > 1 ? 'conflict' : dateSet.candidates.length === 1 ? 'single_source_value' : 'missing',
  };
}

function selectCanonicalName(labels, qid) {
  const usable = labels.filter((entry) => entry.value !== qid);
  return usable[0]?.value ?? labels[0]?.value ?? qid;
}

function languageRank(language) {
  const rank = LANGUAGE_PRIORITY.indexOf(language);
  return rank === -1 ? LANGUAGE_PRIORITY.length : rank;
}

function normalizeName(value) {
  return value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('und');
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/\p{Mark}+/gu, '')
    .toLocaleLowerCase('und')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .replace(/-+/gu, '-');
}

function compareQids(a, b) {
  const left = BigInt(a.slice(1));
  const right = BigInt(b.slice(1));
  return left < right ? -1 : left > right ? 1 : 0;
}

function jsonLines(values) {
  return values.length === 0 ? '' : `${values.map((value) => JSON.stringify(value)).join('\n')}\n`;
}

function sha256Hex(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function main() {
  const [inputPath, outputDir = 'data/osint/staging/wikidata'] = process.argv.slice(2);
  if (!inputPath) {
    throw new Error('Usage: node scripts/osint/normalize-wikidata-saints.mjs <page-json-or-run-directory> [output-directory]');
  }
  const result = await normalizeWikidataSaints(inputPath, outputDir);
  console.log(JSON.stringify({
    outputDir,
    publish: result.manifest.publish,
    entityCount: result.manifest.entityCount,
    conflictCount: result.manifest.conflictCount,
    metrics: result.qualityReport.metrics,
  }, null, 2));
}

const invokedAsScript = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (invokedAsScript) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
