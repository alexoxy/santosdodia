#!/usr/bin/env node

import fs from 'node:fs';
import ts from 'typescript';

const biographyFiles = [
  'data/saint-biographies.ts',
  'data/saint-biographies-batch-1.ts',
  'data/saint-biographies-batch-2.ts',
  'data/saint-biographies-batch-3.ts',
  'data/saint-biographies-batch-4.ts',
  'data/saint-biographies-batch-5.ts',
];
const editorialDepthFiles = [
  'data/saint-biography-editorial-depth-wave-1.ts',
  'data/saint-biography-editorial-depth-wave-2.ts',
  'data/saint-biography-editorial-depth-wave-3.ts',
];

const publicLocales = ['en', 'es', 'pt', 'it'];
const baseline = { summaryCharacters: 120, paragraphs: 2, bodyWords: 90, sources: 2 };
const deepTarget = { summaryCharacters: 160, paragraphs: 3, bodyWords: 150, sources: 2, facts: 3 };

function property(object, name) {
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
  return object.properties.find(item => {
    if (!ts.isPropertyAssignment(item)) return false;
    if (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name)) return item.name.text === name;
    return false;
  });
}

function stringValue(node) {
  if (!node) return '';
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return '';
}

function localizedString(object, locale) {
  const item = property(object, locale);
  return item && ts.isPropertyAssignment(item) ? stringValue(item.initializer) : '';
}

function localizedParagraphs(object, locale) {
  const item = property(object, locale);
  if (!item || !ts.isPropertyAssignment(item) || !ts.isArrayLiteralExpression(item.initializer)) return [];
  return item.initializer.elements.map(stringValue).filter(Boolean);
}

function words(value) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function numberOfArrayItems(object, name) {
  const item = property(object, name);
  if (!item || !ts.isPropertyAssignment(item) || !ts.isArrayLiteralExpression(item.initializer)) return 0;
  return item.initializer.elements.length;
}

function loadEditorialExtensions() {
  const extensions = new Map();
  const extensionFiles = new Map();

  for (const editorialDepthFile of editorialDepthFiles) {
    const source = fs.readFileSync(editorialDepthFile, 'utf8');
    const ast = ts.createSourceFile(editorialDepthFile, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    function visit(node) {
      if (ts.isObjectLiteralExpression(node)) {
        const idProp = property(node, 'id');
        const paragraphsProp = property(node, 'paragraphs');
        if (
          idProp && paragraphsProp &&
          ts.isPropertyAssignment(idProp) && ts.isPropertyAssignment(paragraphsProp) &&
          ts.isObjectLiteralExpression(paragraphsProp.initializer)
        ) {
          const id = stringValue(idProp.initializer);
          if (id) {
            if (extensions.has(id)) {
              console.error(`Editorial corpus audit found duplicate depth extension ID ${id} in ${extensionFiles.get(id)} and ${editorialDepthFile}.`);
              process.exit(1);
            }
            extensions.set(id, Object.fromEntries(
              publicLocales.map(locale => [locale, localizedParagraphs(paragraphsProp.initializer, locale)]),
            ));
            extensionFiles.set(id, editorialDepthFile);
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(ast);
  }

  return { extensions, extensionFiles };
}

const { extensions: editorialExtensions, extensionFiles } = loadEditorialExtensions();

function biographyFromObject(node, file) {
  if (!ts.isObjectLiteralExpression(node)) return undefined;
  const idProp = property(node, 'id');
  const summaryProp = property(node, 'summary');
  const paragraphsProp = property(node, 'paragraphs');
  const sourcesProp = property(node, 'sources');
  const verifiedProp = property(node, 'verifiedAt');
  if (![idProp, summaryProp, paragraphsProp, sourcesProp, verifiedProp].every(Boolean)) return undefined;
  if (![idProp, summaryProp, paragraphsProp, sourcesProp, verifiedProp].every(item => ts.isPropertyAssignment(item))) return undefined;

  const id = stringValue(idProp.initializer);
  if (!id || !ts.isObjectLiteralExpression(summaryProp.initializer) || !ts.isObjectLiteralExpression(paragraphsProp.initializer)) return undefined;
  const sourceCount = ts.isArrayLiteralExpression(sourcesProp.initializer) ? sourcesProp.initializer.elements.length : 0;
  const factCount = numberOfArrayItems(node, 'facts');
  const locales = {};
  let baselineReady = true;
  let deepReady = true;

  for (const locale of publicLocales) {
    const summary = localizedString(summaryProp.initializer, locale);
    const paragraphs = [
      ...localizedParagraphs(paragraphsProp.initializer, locale),
      ...(editorialExtensions.get(id)?.[locale] ?? []),
    ];
    const bodyWords = paragraphs.reduce((total, paragraph) => total + words(paragraph), 0);
    const baseReasons = [];
    const deepReasons = [];
    if (summary.length < baseline.summaryCharacters) baseReasons.push('summary');
    if (paragraphs.length < baseline.paragraphs) baseReasons.push('paragraphs');
    if (bodyWords < baseline.bodyWords) baseReasons.push('body-words');
    if (sourceCount < baseline.sources) baseReasons.push('sources');
    if (summary.length < deepTarget.summaryCharacters) deepReasons.push('summary');
    if (paragraphs.length < deepTarget.paragraphs) deepReasons.push('paragraphs');
    if (bodyWords < deepTarget.bodyWords) deepReasons.push('body-words');
    if (sourceCount < deepTarget.sources) deepReasons.push('sources');
    if (factCount < deepTarget.facts) deepReasons.push('facts');
    if (baseReasons.length) baselineReady = false;
    if (deepReasons.length) deepReady = false;
    locales[locale] = { summaryCharacters: summary.length, paragraphs: paragraphs.length, bodyWords, baseReasons, deepReasons };
  }

  return {
    id,
    file,
    sourceCount,
    factCount,
    verifiedAt: stringValue(verifiedProp.initializer),
    extended: editorialExtensions.has(id),
    extensionFile: extensionFiles.get(id) ?? null,
    baselineReady,
    deepReady,
    locales,
  };
}

const biographies = [];
const seen = new Set();
for (const file of biographyFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  function visit(node) {
    const biography = biographyFromObject(node, file);
    if (biography && !seen.has(biography.id)) {
      seen.add(biography.id);
      biographies.push(biography);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}

const unknownExtensionIds = [...editorialExtensions.keys()].filter(id => !seen.has(id));
if (unknownExtensionIds.length) {
  console.error(`Editorial corpus audit found depth extensions for unknown biography IDs: ${unknownExtensionIds.join(', ')}`);
  process.exit(1);
}

biographies.sort((a, b) => a.id.localeCompare(b.id));
const baselineReady = biographies.filter(item => item.baselineReady);
const deepReady = biographies.filter(item => item.deepReady);
const deepGaps = biographies.filter(item => !item.deepReady).map(item => ({
  id: item.id,
  sources: item.sourceCount,
  facts: item.factCount,
  extended: item.extended,
  extensionFile: item.extensionFile,
  gaps: Object.fromEntries(publicLocales.map(locale => [locale, item.locales[locale].deepReasons])),
}));

const report = {
  generatedAt: new Date().toISOString(),
  publicLocales,
  editorialDepthFiles,
  thresholds: { baseline, deepTarget },
  totals: {
    biographies: biographies.length,
    baselineReady: baselineReady.length,
    deepReady: deepReady.length,
    needsDeepening: biographies.length - deepReady.length,
    depthExtensions: editorialExtensions.size,
    depthWaves: editorialDepthFiles.length,
  },
  deepReadyIds: deepReady.map(item => item.id),
  deepGaps,
};

console.log(JSON.stringify(report, null, 2));

if (!biographies.length) {
  console.error('Editorial corpus audit found no biographies.');
  process.exit(1);
}
if (baselineReady.length !== biographies.length) {
  console.error(`Editorial corpus audit: ${biographies.length - baselineReady.length} biography record(s) fail the existing indexability baseline.`);
  process.exit(1);
}
