import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();
const vectorsPath = path.join(root, 'data', 'calendar-reference-vectors.json');
const enginePath = path.join(root, 'lib', 'knowledge', 'calendar-engine.ts');
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'santosdia-calendar-vectors-'));
const compiledEnginePath = path.join(temporaryDirectory, 'calendar-engine.mjs');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const source = fs.readFileSync(enginePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: enginePath,
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true
    },
    reportDiagnostics: true
  });
  const diagnostics = compiled.diagnostics ?? [];
  if (diagnostics.some(item => item.category === ts.DiagnosticCategory.Error)) {
    throw new Error(`Calendar engine transpilation returned ${diagnostics.length} diagnostic(s).`);
  }
  fs.writeFileSync(compiledEnginePath, compiled.outputText, 'utf8');

  const engine = await import(`${pathToFileURL(compiledEnginePath).href}?v=${Date.now()}`);
  const catalog = JSON.parse(fs.readFileSync(vectorsPath, 'utf8'));
  assert(catalog.schemaVersion === 1, 'Unsupported calendar reference-vector schema.');
  assert(catalog.publicationAllowed === false, 'Reference vectors must never be marked publishable.');
  assert(Array.isArray(catalog.sources) && catalog.sources.length >= 5, 'Reference-vector source registry is incomplete.');
  assert(Array.isArray(catalog.vectors) && catalog.vectors.length >= 20, 'Reference-vector coverage is too small.');

  const sourceById = new Map();
  for (const sourceRecord of catalog.sources) {
    assert(typeof sourceRecord.id === 'string' && sourceRecord.id, 'Reference source is missing an id.');
    assert(!sourceById.has(sourceRecord.id), `Duplicate reference source id ${sourceRecord.id}.`);
    assert(/^https:\/\//.test(sourceRecord.url), `${sourceRecord.id} must use an HTTPS source URL.`);
    sourceById.set(sourceRecord.id, sourceRecord);
  }

  const vectorIds = new Set();
  const coverage = new Map();

  function easterForChurch(churchId, year) {
    if (churchId === 'eastern-orthodox') return engine.orthodoxEaster(year);
    if (churchId === 'coptic-orthodox') return engine.copticEaster(year);
    if (churchId === 'ethiopian-orthodox') return engine.ethiopianEaster(year);
    if (churchId === 'armenian-apostolic') return engine.gregorianEaster(year);
    if (churchId === 'syriac-orthodox') return engine.syriacEaster(year);
    throw new Error(`No tested Easter engine is registered for ${churchId}.`);
  }

  for (const vector of catalog.vectors) {
    assert(typeof vector.id === 'string' && vector.id, 'Reference vector is missing an id.');
    assert(!vectorIds.has(vector.id), `Duplicate reference vector id ${vector.id}.`);
    vectorIds.add(vector.id);
    const sourceRecord = sourceById.get(vector.sourceId);
    assert(sourceRecord, `${vector.id} references unknown source ${vector.sourceId}.`);
    assert(sourceRecord.churchId === vector.churchId, `${vector.id} uses a source from a different Church.`);
    if (vector.validationStatus === 'verified') {
      assert(
        /^official-(?:church|jurisdiction|church-department)$/.test(sourceRecord.authority),
        `${vector.id} is verified without an official source.`
      );
    }

    let actual;
    if (vector.kind === 'easter') {
      actual = engine.toISODate(easterForChurch(vector.churchId, vector.year));
    } else if (vector.kind === 'easter-offset') {
      actual = engine.toISODate(engine.addDays(easterForChurch(vector.churchId, vector.year), vector.offsetDays));
    } else if (vector.kind === 'native-fixed' && vector.churchId === 'coptic-orthodox') {
      actual = engine.toISODate(engine.copticToGregorian(vector.nativeYear, vector.nativeMonth, vector.nativeDay));
    } else if (vector.kind === 'native-fixed' && vector.churchId === 'ethiopian-orthodox') {
      actual = engine.toISODate(engine.ethiopianToGregorian(vector.nativeYear, vector.nativeMonth, vector.nativeDay));
    } else {
      throw new Error(`${vector.id} has an unsupported test-vector kind.`);
    }

    assert(actual === vector.expectedDateISO, `${vector.id} expected ${vector.expectedDateISO}, calculated ${actual}.`);
    const key = `${vector.churchId}:${vector.kind}`;
    coverage.set(key, (coverage.get(key) ?? 0) + 1);
  }

  for (const kind of ['easter', 'easter-offset']) {
    assert((coverage.get(`eastern-orthodox:${kind}`) ?? 0) >= 5, `Eastern Orthodox ${kind} needs at least five annual vectors.`);
  }
  for (const churchId of ['coptic-orthodox', 'ethiopian-orthodox', 'armenian-apostolic', 'syriac-orthodox']) {
    assert((coverage.get(`${churchId}:easter`) ?? 0) >= 1, `${churchId} needs at least one Easter reference vector.`);
  }
  assert((coverage.get('coptic-orthodox:native-fixed') ?? 0) >= 3, 'Coptic conversion needs at least three fixed-date vectors.');
  assert((coverage.get('ethiopian-orthodox:native-fixed') ?? 0) >= 2, 'Ethiopian conversion needs at least two fixed-date vectors.');

  console.log(`Calendar reference-vector tests passed: ${catalog.vectors.length} vectors from ${catalog.sources.length} sources.`);
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
