import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(new URL('..', import.meta.url).pathname);
const observancesPath = resolve(root, 'data/observances.ts');
const i18nPath = resolve(root, 'lib/i18n.ts');
const snapshotPath = resolve(root, 'data/generated/source-snapshot.json');

function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isParenthesizedExpression(current) ||
      ts.isSatisfiesExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function evaluator(environment) {
  function evaluate(rawNode) {
    const node = unwrap(rawNode);
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isIdentifier(node)) return environment.get(node.text);
    if (ts.isArrayLiteralExpression(node)) {
      const output = [];
      for (const element of node.elements) {
        if (ts.isSpreadElement(element)) {
          const spread = evaluate(element.expression);
          if (Array.isArray(spread)) output.push(...spread);
          else return undefined;
        } else {
          const value = evaluate(element);
          if (value === undefined) return undefined;
          output.push(value);
        }
      }
      return output;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const output = {};
      for (const property of node.properties) {
        if (ts.isSpreadAssignment(property)) {
          const spread = evaluate(property.expression);
          if (!spread || typeof spread !== 'object' || Array.isArray(spread)) return undefined;
          Object.assign(output, spread);
          continue;
        }
        if (!ts.isPropertyAssignment(property)) return undefined;
        const key = propertyName(property.name);
        if (!key) return undefined;
        const value = evaluate(property.initializer);
        if (value === undefined) return undefined;
        output[key] = value;
      }
      return output;
    }
    return undefined;
  }
  return evaluate;
}

function parseSource(path, text) {
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function variableInitializers(sourceFile) {
  const output = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        output.set(declaration.name.text, declaration.initializer);
      }
    }
  }
  return output;
}

function buildEnvironment(initializers) {
  const environment = new Map();
  const evaluate = evaluator(environment);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [name, initializer] of initializers) {
      if (environment.has(name)) continue;
      const value = evaluate(initializer);
      if (value !== undefined) {
        environment.set(name, value);
        changed = true;
      }
    }
  }
  return { environment, evaluate };
}

function validFixedDate(month, day) {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  const date = new Date(Date.UTC(2024, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function percentage(value, total) {
  return total ? Number(((value / total) * 100).toFixed(1)) : 0;
}

function groupCount(values) {
  const output = {};
  for (const value of values) output[value] = (output[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(output).sort(([a], [b]) => a.localeCompare(b)));
}

function markdown(report) {
  const lines = [
    '# Data quality baseline',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Inventory',
    '',
    `- Curated observances: **${report.inventory.observances}**`,
    `- Catalogued sources: **${report.inventory.sources}**`,
    `- Christian traditions: **${report.inventory.traditions}**`,
    `- UI locales: **${report.inventory.locales}**`,
    `- Categories: **${report.inventory.categories}**`,
    `- Calendar systems: **${report.inventory.calendarSystems}**`,
    '',
    '## Validation status',
    '',
    ...Object.entries(report.validationStatus).map(([key, value]) => `- ${key}: **${value}**`),
    '',
    '## Coverage',
    '',
    `- English names: **${report.coverage.englishNames.count}/${report.inventory.observances} (${report.coverage.englishNames.percent}%)**`,
    `- Portuguese names: **${report.coverage.portugueseNames.count}/${report.inventory.observances} (${report.coverage.portugueseNames.percent}%)**`,
    `- Summaries: **${report.coverage.summaries.count}/${report.inventory.observances} (${report.coverage.summaries.percent}%)**`,
    `- Patronages: **${report.coverage.patronages.count}/${report.inventory.observances} (${report.coverage.patronages.percent}%)**`,
    `- Geographic scope: **${report.coverage.countries.count}/${report.inventory.observances} (${report.coverage.countries.percent}%)**`,
    `- Verification date: **${report.coverage.lastVerified.count}/${report.inventory.observances} (${report.coverage.lastVerified.percent}%)**`,
    '',
    '## Publication assessment',
    '',
    `- Structurally publishable: **${report.publication.structurallyPublishable}**`,
    `- Strictly verified: **${report.publication.strictlyVerified}**`,
    `- Adequately cross-checked: **${report.publication.adequatelyCrossChecked}**`,
    `- Review-gated: **${report.publication.reviewGated}**`,
    '',
    '## Findings',
    '',
    `- Hard errors: **${report.findings.hardErrors.length}**`,
    `- Quality warnings: **${report.findings.warnings.length}**`,
    ''
  ];
  if (report.findings.hardErrors.length) {
    lines.push('### Hard errors', '', ...report.findings.hardErrors.map(item => `- ${item}`), '');
  }
  if (report.findings.warnings.length) {
    lines.push('### Quality warnings', '', ...report.findings.warnings.map(item => `- ${item}`), '');
  }
  lines.push(
    '## Interpretation',
    '',
    'This report audits the curated in-repository dataset. Dynamic source snapshots are reported separately and must not be treated as editorially verified merely because they were imported.',
    ''
  );
  return `${lines.join('\n')}\n`;
}

const [observancesText, i18nText, snapshotText] = await Promise.all([
  readFile(observancesPath, 'utf8'),
  readFile(i18nPath, 'utf8'),
  readFile(snapshotPath, 'utf8')
]);

let snapshot;
try {
  snapshot = JSON.parse(snapshotText);
} catch (error) {
  console.error(`Invalid JSON in ${snapshotPath}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const observancesSource = parseSource(observancesPath, observancesText);
const i18nSource = parseSource(i18nPath, i18nText);
const observanceInitializers = variableInitializers(observancesSource);
const i18nInitializers = variableInitializers(i18nSource);
const { environment, evaluate } = buildEnvironment(observanceInitializers);
const { environment: i18nEnvironment } = buildEnvironment(i18nInitializers);

const traditions = environment.get('TRADITIONS') ?? [];
const categories = environment.get('CATEGORIES') ?? [];
const locales = i18nEnvironment.get('SUPPORTED_LOCALES') ?? [];
const sourceCatalog = environment.get('SOURCE_CATALOG') ?? [];
const sourceById = new Map(sourceCatalog.map(source => [source.id, source]));
const dNode = unwrap(observanceInitializers.get('D'));

if (!ts.isArrayLiteralExpression(dNode)) {
  console.error('Unable to locate the curated observance array D.');
  process.exit(1);
}

const records = [];
for (const element of dNode.elements) {
  const call = unwrap(element);
  if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression) || call.expression.text !== 'entry') continue;
  const args = call.arguments;
  const extra = evaluate(args[8]) ?? {};
  records.push({
    id: evaluate(args[0]),
    month: evaluate(args[1]),
    day: evaluate(args[2]),
    traditions: evaluate(args[3]) ?? [],
    category: evaluate(args[4]),
    calendarSystem: evaluate(args[5]),
    names: evaluate(args[6]) ?? {},
    sourceIds: evaluate(args[7]) ?? [],
    translationStatus: extra.translationStatus ?? 'official-name',
    validationStatus: extra.validationStatus ?? 'cross-checked',
    lastVerified: extra.lastVerified,
    summaries: extra.summaries,
    patronages: extra.patronages,
    countries: extra.countries,
    externalId: extra.externalId
  });
}

const hardErrors = [];
const warnings = [];
const seenIds = new Set();
const calendarSystems = new Set();
let structurallyPublishable = 0;
let strictlyVerified = 0;
let adequatelyCrossChecked = 0;
let reviewGated = 0;

for (const record of records) {
  const prefix = record.id || '<missing-id>';
  const recordErrors = [];
  if (typeof record.id !== 'string' || !record.id) recordErrors.push('missing stable id');
  else if (seenIds.has(record.id)) recordErrors.push('duplicate id');
  else seenIds.add(record.id);
  if (!validFixedDate(record.month, record.day)) recordErrors.push('invalid fixed date');
  if (!Array.isArray(record.traditions) || !record.traditions.length) recordErrors.push('missing tradition');
  if (record.traditions.some(value => !traditions.includes(value))) recordErrors.push('unknown tradition');
  if (!categories.includes(record.category)) recordErrors.push('unknown category');
  if (!record.calendarSystem) recordErrors.push('missing calendar system');
  else calendarSystems.add(record.calendarSystem);
  if (!record.names?.en) recordErrors.push('missing English canonical name');
  if (!Array.isArray(record.sourceIds) || !record.sourceIds.length) recordErrors.push('missing source reference');
  for (const sourceId of record.sourceIds ?? []) {
    if (!sourceById.has(sourceId)) recordErrors.push(`unknown source ${sourceId}`);
  }
  if (recordErrors.length) hardErrors.push(`${prefix}: ${recordErrors.join('; ')}`);

  const authoritativeSources = (record.sourceIds ?? [])
    .map(sourceId => sourceById.get(sourceId))
    .filter(source => source && ['official', 'scholarly'].includes(source.kind));

  if (record.validationStatus === 'review-required' || record.validationStatus === 'imported') {
    reviewGated += 1;
  } else if (!recordErrors.length) {
    structurallyPublishable += 1;
  }
  if (record.validationStatus === 'verified' && authoritativeSources.length) strictlyVerified += 1;
  if (record.validationStatus === 'cross-checked' && record.sourceIds.length >= 2 && authoritativeSources.length) {
    adequatelyCrossChecked += 1;
  }

  if (record.validationStatus === 'cross-checked' && record.sourceIds.length < 2) {
    warnings.push(`${prefix}: marked cross-checked but has only ${record.sourceIds.length} source`);
  }
  if (['verified', 'cross-checked'].includes(record.validationStatus) && !record.lastVerified) {
    warnings.push(`${prefix}: no lastVerified date`);
  }
  if (!record.summaries || !Object.keys(record.summaries).length) warnings.push(`${prefix}: no editorial summary`);
}

const coverage = key => {
  const count = records.filter(record => {
    const value = record[key];
    return value && (Array.isArray(value) ? value.length : Object.keys(value).length);
  }).length;
  return { count, percent: percentage(count, records.length) };
};

const englishNames = records.filter(record => Boolean(record.names?.en)).length;
const portugueseNames = records.filter(record => Boolean(record.names?.pt)).length;
const validationStatus = groupCount(records.map(record => record.validationStatus));

const report = {
  generatedAt: new Date().toISOString(),
  inventory: {
    observances: records.length,
    sources: sourceCatalog.length,
    traditions: traditions.length,
    locales: locales.length,
    categories: categories.length,
    calendarSystems: calendarSystems.size,
    dynamicSnapshotYears: Object.keys(snapshot?.years ?? {}).length,
    dynamicSnapshotGeneratedAt: snapshot?.generatedAt ?? null
  },
  validationStatus,
  coverage: {
    englishNames: { count: englishNames, percent: percentage(englishNames, records.length) },
    portugueseNames: { count: portugueseNames, percent: percentage(portugueseNames, records.length) },
    summaries: coverage('summaries'),
    patronages: coverage('patronages'),
    countries: coverage('countries'),
    lastVerified: coverage('lastVerified')
  },
  byTradition: groupCount(records.flatMap(record => record.traditions)),
  byCategory: groupCount(records.map(record => record.category)),
  publication: { structurallyPublishable, strictlyVerified, adequatelyCrossChecked, reviewGated },
  findings: { hardErrors, warnings }
};

const outputIndex = process.argv.indexOf('--markdown');
if (outputIndex !== -1) {
  const outputPath = process.argv[outputIndex + 1];
  if (!outputPath) throw new Error('--markdown requires an output path');
  await writeFile(resolve(root, outputPath), markdown(report), 'utf8');
}

console.log(JSON.stringify(report, null, 2));
if (hardErrors.length) process.exitCode = 1;
