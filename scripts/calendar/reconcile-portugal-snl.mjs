#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RANKS = {
  solemnity: 5,
  feast: 4,
  memorial: 3,
  'optional-memorial': 2,
  weekday: 1,
};

const PORTUGUESE_EQUIVALENTS = new Map(Object.entries({
  antonio: 'anthony', francisco: 'francis', jose: 'joseph', joao: 'john',
  pedro: 'peter', paulo: 'paul', marcos: 'mark', tiago: 'james', lucas: 'luke',
  andre: 'andrew', estevao: 'stephen', clara: 'clare', maria: 'mary',
  tome: 'thomas', mateus: 'matthew', bartolomeu: 'bartholomew', judas: 'jude',
  filipe: 'philip', catarina: 'catherine', agostinho: 'augustine', bento: 'benedict',
  domingos: 'dominic', inaciod: 'ignatius', inacio: 'ignatius', patricio: 'patrick',
  nascimento: 'nativity', natividade: 'nativity', apresentacao: 'presentation',
  anunciacao: 'annunciation', assuncao: 'assumption', epifania: 'epiphany',
  transfiguracao: 'transfiguration', conversao: 'conversion', exaltacao: 'exaltation',
  cruz: 'cross', imaculada: 'immaculate', conceicao: 'conception',
  senhor: 'lord', jesus: 'jesus', cristo: 'christ', apostolo: 'apostle',
  apostolos: 'apostles', evangelista: 'evangelist', martir: 'martyr', martires: 'martyrs',
  virgem: 'virgin', doutor: 'doctor', igreja: 'church', todos: 'all', santos: 'saints',
}));

const NOISE = new Set([
  's', 'ss', 'sao', 'santo', 'santa', 'santos', 'santas', 'beato', 'beata',
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'the', 'of', 'and',
  'saint', 'saints', 'st', 'sts', 'holy', 'blessed', 'bem', 'aventurado', 'aventurada',
  'presbitero', 'bispo', 'papa', 'abade', 'religioso', 'religiosa', 'virgem',
  'doutor', 'igreja', 'memoria', 'facultativa', 'obrigatoria', 'festa', 'solenidade',
]);

function argument(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}
function text(value) { return String(value ?? '').normalize('NFC').trim(); }
function ascii(value) {
  return text(value).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
}
function cleanLabel(value) {
  return text(value)
    .replace(/\s+[–—-]\s+(SOLENIDADE|FESTA|MO|MF|MEMÓRIA OBRIGATÓRIA|MEMÓRIA FACULTATIVA)\s*$/iu, '')
    .replace(/^(?:S\.|SS\.|Santo|Santa|Santos|Santas|São)\s+/iu, '')
    .trim();
}
function tokens(value) {
  return ascii(cleanLabel(value))
    .replace(/[^a-z0-9]+/gu, ' ')
    .split(/\s+/u)
    .filter(Boolean)
    .map((token) => PORTUGUESE_EQUIVALENTS.get(token) ?? token)
    .filter((token) => !NOISE.has(token));
}
function tokenScore(left, right) {
  const a = new Set(tokens(left));
  const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
}
function trigrams(value) {
  const normalized = tokens(value).join(' ');
  if (normalized.length < 3) return new Set(normalized ? [normalized] : []);
  const result = new Set();
  for (let index = 0; index <= normalized.length - 3; index += 1) result.add(normalized.slice(index, index + 3));
  return result;
}
function trigramScore(left, right) {
  const a = trigrams(left), b = trigrams(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
}
function lexicalScore(left, right) {
  return Number((tokenScore(left, right) * 0.7 + trigramScore(left, right) * 0.3).toFixed(4));
}
function dateDistance(left, right) {
  const a = Date.parse(`${left}T00:00:00Z`), b = Date.parse(`${right}T00:00:00Z`);
  return Math.round(Math.abs(a - b) / 86_400_000);
}
function snlRank(event) {
  const joined = `${text(event?.names?.pt?.value)}\n${text(event?.sourceFacts?.description)}`.toUpperCase();
  if (/SOLENIDADE/u.test(joined)) return 'solemnity';
  if (/\bFESTA\b/u.test(joined)) return 'feast';
  if (/MEMÓRIA OBRIGATÓRIA|\bMO\b/u.test(joined)) return 'memorial';
  if (/MEMÓRIA FACULTATIVA|\bMF\b/u.test(joined)) return 'optional-memorial';
  return null;
}
function canonicalRank(value) {
  const raw = ascii(value);
  if (/solemn|solenn/.test(raw)) return 'solemnity';
  if (/feast|festa|fete/.test(raw)) return 'feast';
  if (/memorial|memoria|memoire/.test(raw) && !/optional|facolt|facult/.test(raw)) return 'memorial';
  if (/optional|facolt|facult/.test(raw)) return 'optional-memorial';
  if (/weekday|feria|ferie/.test(raw)) return 'weekday';
  return null;
}
function rankDelta(left, right) {
  if (!left || !right || left === right) return null;
  return { snl: left, generalRoman: right, direction: (RANKS[left] ?? 0) > (RANKS[right] ?? 0) ? 'higher-in-portugal' : 'lower-in-portugal' };
}
function normalizeLitcal(payload, locale) {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  return events
    .map((event) => ({
      id: text(event.id),
      canonicalEventId: `rc:${text(event.id)}`,
      dateISO: text(event.dateISO).slice(0, 10),
      name: text(event.name),
      grade: event.grade == null ? null : text(event.grade),
      locale,
    }))
    .filter((event) => event.id && /^\d{4}-\d{2}-\d{2}$/u.test(event.dateISO) && event.name && !/_vigil$/iu.test(event.id));
}

export function loadGeneralRomanReference(mirrorRoot, years) {
  const byId = new Map();
  const locales = ['en_US', 'fr_FR', 'it_IT'];
  for (const year of years) {
    for (const locale of locales) {
      const file = path.join(mirrorRoot, String(year), `${locale}.json`);
      if (!fs.existsSync(file)) continue;
      const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const event of normalizeLitcal(payload, locale)) {
        const key = `${event.id}|${event.dateISO}`;
        const current = byId.get(key) ?? {
          id: event.id,
          canonicalEventId: event.canonicalEventId,
          dateISO: event.dateISO,
          grade: event.grade,
          rank: canonicalRank(event.grade),
          names: {},
        };
        current.names[locale] = event.name;
        if (!current.grade && event.grade) {
          current.grade = event.grade;
          current.rank = canonicalRank(event.grade);
        }
        byId.set(key, current);
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.id.localeCompare(b.id));
}

function candidateScore(snlEvent, candidate) {
  const sourceLabel = snlEvent.names?.pt?.value ?? '';
  const comparisons = [candidate.id, candidate.canonicalEventId, ...Object.values(candidate.names ?? {})]
    .map((name) => ({ name, lexical: lexicalScore(sourceLabel, name) }))
    .sort((a, b) => b.lexical - a.lexical);
  const best = comparisons[0] ?? { name: '', lexical: 0 };
  const distance = dateDistance(snlEvent.dateISO, candidate.dateISO);
  const sameDate = distance === 0;
  const sourceRank = snlRank(snlEvent);
  const ranksAgree = Boolean(sourceRank && candidate.rank && sourceRank === candidate.rank);
  const score = Math.min(1, best.lexical * 0.78 + (sameDate ? 0.18 : Math.max(0, 0.12 - distance * 0.015)) + (ranksAgree ? 0.04 : 0));
  return {
    canonicalEventId: candidate.canonicalEventId,
    generalRomanId: candidate.id,
    generalRomanDateISO: candidate.dateISO,
    generalRomanGrade: candidate.grade,
    generalRomanRank: candidate.rank,
    names: candidate.names,
    lexicalScore: best.lexical,
    bestComparedName: best.name,
    dateDistanceDays: distance,
    sameDate,
    ranksAgree,
    score: Number(score.toFixed(4)),
  };
}

export function reconcilePortugalSnl({ snlPackage, generalRoman }) {
  if (snlPackage?.run?.publicationAllowed !== false || snlPackage?.run?.promotionAllowed !== false) {
    throw new Error('Portugal reconciliation requires a staging-only SNL package.');
  }
  const sourceEvents = Array.isArray(snlPackage?.events) ? snlPackage.events : [];
  const output = [];

  for (const event of sourceEvents) {
    const sameYear = generalRoman.filter((candidate) => candidate.dateISO.slice(0, 4) === event.dateISO.slice(0, 4));
    const sameDate = sameYear.filter((candidate) => candidate.dateISO === event.dateISO);
    const nearby = sameYear.filter((candidate) => dateDistance(candidate.dateISO, event.dateISO) <= 14);
    const sameDateScores = sameDate.map((candidate) => candidateScore(event, candidate)).sort((a, b) => b.score - a.score);
    const nearbyScores = nearby.map((candidate) => candidateScore(event, candidate)).sort((a, b) => b.lexicalScore - a.lexicalScore || a.dateDistanceDays - b.dateDistanceDays);
    const best = sameDateScores[0] ?? null;
    const second = sameDateScores[1] ?? null;
    const sourceRank = snlRank(event);
    const rankDifference = best ? rankDelta(sourceRank, best.generalRomanRank) : null;
    let disposition = 'portugal-proper-or-unmatched';
    let reason = 'no-safe-general-roman-candidate';
    let candidate = best;

    if (best && best.lexicalScore >= 0.72 && (!second || best.score - second.score >= 0.1)) {
      disposition = rankDifference ? 'rank-delta-review' : 'canonical-link-proposal';
      reason = rankDifference ? 'same-date-lexical-match-with-rank-delta' : 'same-date-lexical-and-structural-match';
    } else if (best && best.lexicalScore >= 0.56) {
      disposition = 'ambiguous-review';
      reason = second && best.score - second.score < 0.1 ? 'multiple-same-date-candidates' : 'same-date-match-below-safe-threshold';
    } else {
      const transfer = nearbyScores.find((item) => !item.sameDate && item.lexicalScore >= 0.78 && item.dateDistanceDays <= 7);
      if (transfer) {
        disposition = 'transfer-candidate-review';
        reason = 'strong-label-match-on-nearby-general-roman-date';
        candidate = transfer;
      } else if (sameDate.length === 1) {
        disposition = 'structural-review';
        reason = 'single-general-roman-event-on-date-without-semantic-proof';
        candidate = sameDateScores[0];
      }
    }

    output.push({
      sourceOccurrenceId: event.id,
      sourceCanonicalEventId: event.canonicalEventId,
      dateISO: event.dateISO,
      sourceLabel: event.names?.pt?.value ?? null,
      sourceRank,
      sourceUid: event.sourceFacts?.uid ?? null,
      disposition,
      reason,
      reviewRequired: true,
      automaticLinkAllowed: false,
      candidate,
      alternatives: sameDateScores.slice(0, 5),
    });
  }

  const buckets = {};
  for (const item of output) buckets[item.disposition] = (buckets[item.disposition] ?? 0) + 1;
  return {
    schemaVersion: 1,
    mode: 'proposal-only',
    churchId: 'roman-catholic',
    jurisdictionId: 'PT',
    productionWriteAllowed: false,
    automaticLinkAllowed: false,
    generatedAt: new Date().toISOString(),
    summary: {
      inputOccurrences: sourceEvents.length,
      generalRomanReferenceEvents: generalRoman.length,
      ...buckets,
    },
    policy: {
      identityRule: 'No canonical identity is created or changed from a name match. All outputs are review proposals.',
      dateRule: 'Same civil date is evidence of calendar alignment, not proof of semantic identity.',
      transferRule: 'Strong lexical similarity on a nearby date is a transfer candidate, never an automatic link.',
      rankRule: 'Rank differences remain explicit Portugal deltas and require review.',
    },
    items: output,
  };
}

function main() {
  const snlPath = path.resolve(argument('--snl', 'staging/portugal-snl/normalized-package.json'));
  const mirrorRoot = path.resolve(argument('--mirror-root', 'data/litcal-mirror/calendars/general'));
  const outputPath = path.resolve(argument('--output', 'staging/portugal-snl/reconciliation.json'));
  const snlPackage = JSON.parse(fs.readFileSync(snlPath, 'utf8'));
  const years = [...new Set((snlPackage.events ?? []).map((event) => Number(String(event.dateISO).slice(0, 4))).filter(Number.isInteger))];
  const generalRoman = loadGeneralRomanReference(mirrorRoot, years);
  if (!generalRoman.length) throw new Error(`No General Roman reference events found for SNL years: ${years.join(', ') || 'none'}.`);
  const result = reconcilePortugalSnl({ snlPackage, generalRoman });
  if (result.summary.inputOccurrences !== result.items.length) throw new Error('Reconciliation output does not partition the SNL input.');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result.summary, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}
