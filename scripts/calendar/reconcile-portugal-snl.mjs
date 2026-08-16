#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyGeneralRomanAuthorityCorrections } from './general-roman-authority-corrections.mjs';

const RANKS = { solemnity: 5, feast: 4, memorial: 3, 'optional-memorial': 2, weekday: 1 };

// Matching-only lexicon. These equivalences reduce translation distance; they never create
// or approve a canonical identity and they never override Church/jurisdiction semantics.
const TOKEN_EQUIVALENTS = new Map(Object.entries({
  antonio:'anthony', francisco:'francis', jose:'joseph', joao:'john', juan:'john', giovanni:'john',
  pedro:'peter', pietro:'peter', paulo:'paul', marcos:'mark', tiago:'james', lucas:'luke', andre:'andrew',
  estevao:'stephen', clara:'clare', maria:'mary', tome:'thomas', mateus:'matthew', bartolomeu:'bartholomew',
  judas:'jude', filipe:'philip', catarina:'catherine', agostinho:'augustine', bento:'benedict', domingos:'dominic',
  inaciod:'ignatius', inacio:'ignatius', patricio:'patrick', jeronimo:'jerome', hilario:'hilary', norberto:'norbert', martinho:'martin',
  hildegarda:'hildegard', jorge:'george', barnabe:'barnabas', anselmo:'anselm', ambrosio:'ambrose', bernardo:'bernard',
  cirilo:'cyril', metodio:'methodius', agueda:'agatha', boaventura:'bonaventure', maximiliano:'maximilian', escolastica:'scholastica',
  pancracio:'pancras', atanasio:'athanasius', justino:'justin', timoteo:'timothy', tito:'titus', marcelino:'marcellinus',
  sebastiao:'sebastian', venceslau:'wenceslaus', venceslas:'wenceslaus', diogo:'diego', isabel:'elizabeth',
  camilo:'camillus', lelis:'lellis', margarida:'margaret', escocia:'scotland', gertrudes:'gertrude', romualdo:'romuald',
  roberto:'robert', belarmino:'bellarmine', adalberto:'adalbert', brigida:'bridget', sisto:'sixtus', caetano:'cajetan',
  joana:'jane', francisca:'frances', francesca:'frances', vicente:'vincent', januario:'januarius', columbano:'columban',
  bras:'blase', oscar:'ansgar', fiel:'fidelis', paulino:'paulinus', calisto:'callistus', raimundo:'raymond',
  penaforte:'penyafort', lourenco:'lawrence', brindes:'brindisi', henrique:'henry', sarbelio:'sharbel', charbel:'sharbel',
  efrem:'ephrem', bernardino:'bernardine', lurdes:'lourdes', hedwiges:'hedwig', dinis:'denis', leonardo:'leonardi',
  ponciano:'pontian', ponziano:'pontian', hipolito:'hippolytus', ippolito:'hippolytus', cosme:'cosmas', damiao:'damian',
  apolinario:'apollinaris', sete:'seven', sette:'seven', fundadores:'founders', fondatori:'founders',
  primeiros:'first', primi:'first', dedicacao:'dedication', maior:'major', nereu:'nereus', aquileu:'achilleus',
  fabiao:'fabian', luis:'louis', simao:'simon', inocentes:'innocents', maddalena:'magdalene', madalena:'magdalene',
  cristovao:'christopher', nome:'name', rainha:'queenship', franca:'france', antioquia:'antioch', roma:'rome', romano:'rome', romana:'rome',
  nascimento:'nativity', natividade:'nativity', apresentacao:'presentation', anunciacao:'annunciation', assuncao:'assumption',
  epifania:'epiphany', ascensao:'ascension', transfiguracao:'transfiguration', conversao:'conversion', exaltacao:'exaltation', cruz:'cross',
  imaculada:'immaculate', conceicao:'conception', coracao:'heart', fieis:'faithful', defuntos:'departed', senhor:'lord', jesus:'jesus', cristo:'christ', familia:'family',
  operario:'worker', apostolo:'apostle', apostolos:'apostles', evangelista:'evangelist', martir:'martyr', martires:'martyrs',
  companheiro:'companion', companheiros:'companions', todos:'all',
  sigmaringa:'sigmaringen', sena:'siena', cassia:'cascia', cantuaria:'canterbury', batista:'baptist',
  latrao:'lateran', hungria:'hungary', carmelo:'carmel', calcuta:'calcutta', loiola:'loyola',
}));

const NOISE = new Set([
  's','ss','sao','santo','santa','santos','santas','beato','beata','de','da','do','das','dos','e','a','o','as','os',
  'the','of','and','saint','saints','st','sts','holy','blessed','bem','aventurado','aventurada','san','santi','sainte','saintes',
  'presbitero','bispo','papa','abade','religioso','religiosa','virgem','doutor','igreja','diacono','memoria','facultativa','obrigatoria','festa','solenidade',
  'priest','bishop','pope','abbot','religious','virgin','doctor','church','deacon','martyr','martyrs','apostle','apostles',
  'spouse','husband','queen','king','companion','companions','patron','patroness','mission','missions',
  'pretre','eveque','pape','abbe','religieuse','vierge','docteur','eglise','martyrs',
  'sacerdote','vescovo','abate','religiosa','vergine','dottore','chiesa','martire','martiri',
  'padroeiro','padroeira','padroeiros','padroeiras','europa','principal','missoes','ordem','order','servos','servi',
]);

function argument(name, fallback = null) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : fallback; }
function text(value) { return String(value ?? '').normalize('NFC').trim(); }
function ascii(value) { return text(value).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase(); }
function cleanLabel(value) {
  return text(value)
    .replace(/\s+[–—-]\s+(SOLENIDADE|FESTA|MO|MF|MEMÓRIA OBRIGATÓRIA|MEMÓRIA FACULTATIVA)\s*$/iu, '')
    .replace(/^(?:S\.|SS\.|Santo|Santa|Santos|Santas|São)\s+/iu, '')
    .trim();
}
function splitIdentifierWords(value) {
  return String(value ?? '')
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1 $2')
    .replace(/[_:]/gu, ' ');
}
function tokens(value) {
  return ascii(cleanLabel(splitIdentifierWords(value)))
    .replace(/[^a-z0-9]+/gu, ' ')
    .split(/\s+/u)
    .filter(Boolean)
    .map((token) => TOKEN_EQUIVALENTS.get(token) ?? token)
    .filter((token) => !NOISE.has(token) && !/^\d+$/u.test(token));
}
function tokenScore(left, right) {
  const a = new Set(tokens(left)); const b = new Set(tokens(right));
  if (!a.size || !b.size) return 0;
  let intersection = 0; for (const item of a) if (b.has(item)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
}
function trigrams(value) {
  const normalized = tokens(value).join(' ');
  if (normalized.length < 3) return new Set(normalized ? [normalized] : []);
  const result = new Set(); for (let index = 0; index <= normalized.length - 3; index += 1) result.add(normalized.slice(index, index + 3));
  return result;
}
function trigramScore(left, right) {
  const a = trigrams(left), b = trigrams(right); if (!a.size || !b.size) return 0;
  let intersection = 0; for (const item of a) if (b.has(item)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
}
function lexicalScore(left, right) { return Number((tokenScore(left, right) * 0.7 + trigramScore(left, right) * 0.3).toFixed(4)); }
function romanNumeralToInt(value) {
  const chars = { i:1, v:5, x:10, l:50, c:100, d:500, m:1000 };
  const input = String(value ?? '').toLowerCase();
  let total = 0; let previous = 0;
  for (let index = input.length - 1; index >= 0; index -= 1) {
    const current = chars[input[index]] ?? 0;
    total += current < previous ? -current : current;
    previous = current;
  }
  return total || null;
}
function reviewedSemanticAliasScore(sourceLabel, candidateId) {
  const source = ascii(sourceLabel);
  if (/santa maria no sabado/u.test(source) && /^SatMemBVM/u.test(candidateId)) return 1;
  if (/antonio de lisboa/u.test(source) && candidateId === 'StAnthonyPadua') return 1;
  if (/fatima/u.test(source) && candidateId === 'OurLadyOfFatima') return 0.98;
  if (/nascimento.*joao.*batista/u.test(source) && candidateId === 'NativityJohnBaptist') return 1;
  if (/martirio.*joao.*batista/u.test(source) && candidateId === 'BeheadingJohnBaptist') return 1;
  if (/luis de franca/u.test(source) && candidateId === 'StLouis') return 0.98;
  if (/^epifania(?: do senhor)?$/u.test(source) && candidateId === 'Epiphany') return 1;
  if (/^ascensao(?: do senhor)?$/u.test(source) && candidateId === 'Ascension') return 1;
  if (/imaculado.*coracao/u.test(source) && candidateId === 'ImmaculateHeart') return 1;
  if (/cirilo.*metodio/u.test(source) && candidateId === 'StsCyrilMethodius') return 1;
  if (/fieis.*defuntos/u.test(source) && candidateId === 'AllSouls') return 1;
  if (/catarina.*sena/u.test(source) && candidateId === 'StCatherineSiena') return 1;
  if (/\bbento\b/u.test(source) && candidateId === 'StBenedict') return 0.98;
  if (/brigida/u.test(source) && candidateId === 'StBridget') return 0.98;
  if (/maria.*mae de deus/u.test(source) && candidateId === 'MaryMotherOfGod') return 1;
  if (/batismo.*senhor/u.test(source) && candidateId === 'BaptismLord') return 1;
  if (/pentecostes/u.test(source) && candidateId === 'Pentecost') return 1;
  if (/santissima trindade/u.test(source) && candidateId === 'Trinity') return 1;
  if (/sagrado coracao.*jesus/u.test(source) && candidateId === 'SacredHeart') return 1;
  if (/miguel.*gabriel.*rafael/u.test(source) && candidateId === 'StsArchangels') return 1;
  if (/cristo.*rei.*universo/u.test(source) && candidateId === 'ChristKing') return 1;
  if (/imaculada conceicao/u.test(source) && candidateId === 'ImmaculateConception') return 1;
  if (/natal do senhor/u.test(source) && candidateId === 'Christmas') return 1;
  if (/estevao.*primeiro.*martir/u.test(source) && candidateId === 'StStephenProtomartyr') return 1;
  return 0;
}
function reviewedCalendarStructureScore(sourceLabel, candidateId) {
  const source = ascii(sourceLabel);
  let match = /domingo\s+([ivxlcdm]+)\s+do tempo comum/u.exec(source);
  if (match && candidateId === `OrdSunday${romanNumeralToInt(match[1])}`) return 1;
  match = /domingo\s+([ivxlcdm]+)\s+da quaresma/u.exec(source);
  if (match && candidateId === `Lent${romanNumeralToInt(match[1])}`) return 1;
  match = /domingo\s+([ivxlcdm]+)\s+da pascoa/u.exec(source);
  if (match && candidateId === `Easter${romanNumeralToInt(match[1])}`) return 1;
  match = /domingo\s+([ivxlcdm]+)\s+do advento/u.exec(source);
  if (match && candidateId === `Advent${romanNumeralToInt(match[1])}`) return 1;
  if (/domingo de ramos/u.test(source) && candidateId === 'PalmSun') return 1;
  if (/quarta-feira.*cinzas/u.test(source) && candidateId === 'AshWednesday') return 1;
  if (/domingo de pascoa.*ressurreicao/u.test(source) && candidateId === 'Easter') return 1;
  const holyWeek = [
    [/^segunda-feira.*semana santa/u, 'MonHolyWeek'],
    [/^terca-feira.*semana santa/u, 'TueHolyWeek'],
    [/^quarta-feira.*semana santa/u, 'WedHolyWeek'],
    [/^quinta-feira.*semana santa/u, 'HolyThurs'],
    [/^sexta-feira.*paixao do senhor/u, 'GoodFri'],
    [/^sabado santo/u, 'EasterVigil'],
  ];
  for (const [pattern, id] of holyWeek) if (pattern.test(source) && candidateId === id) return 1;
  const octave = [
    [/^segunda-feira.*oitava da pascoa/u, 'MonOctaveEaster'],
    [/^terca-feira.*oitava da pascoa/u, 'TueOctaveEaster'],
    [/^quarta-feira.*oitava da pascoa/u, 'WedOctaveEaster'],
    [/^quinta-feira.*oitava da pascoa/u, 'ThuOctaveEaster'],
    [/^sexta-feira.*oitava da pascoa/u, 'FriOctaveEaster'],
    [/^sabado.*oitava da pascoa/u, 'SatOctaveEaster'],
  ];
  for (const [pattern, id] of octave) if (pattern.test(source) && candidateId === id) return 1;
  return 0;
}
function isStructuralDayLabel(value) {
  const source = ascii(value);
  return /^(segunda-feira|terca-feira|quarta-feira|quinta-feira|sexta-feira|sabado)\b.*\b(semana|depois das cinzas|dia dentro da oitava do natal|depois da epifania)\b/u.test(source);
}
function structuralDayScore(snlEvent, candidate) {
  if (candidate.rank !== 'weekday' || candidate.dateISO !== snlEvent.dateISO) return 0;
  return isStructuralDayLabel(snlEvent.names?.pt?.value ?? '') ? 1 : 0;
}
function eventSourceLabels(event) {
  return [...new Set([event.names?.pt?.value, event.sourceFacts?.dayLabel].map(text).filter(Boolean))];
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
function isHighPrecedence(rank) { return (RANKS[rank] ?? 0) >= RANKS.feast; }
function normalizeLitcal(payload, locale) {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  return events.map((event) => ({
    id: text(event.id), canonicalEventId: `rc:${text(event.id)}`, dateISO: text(event.dateISO).slice(0, 10),
    name: text(event.name), grade: event.grade == null ? null : text(event.grade), locale,
  })).filter((event) => event.id && /^\d{4}-\d{2}-\d{2}$/u.test(event.dateISO) && event.name && !/_vigil$/iu.test(event.id));
}

export function loadGeneralRomanReference(mirrorRoot, years) {
  const byId = new Map(); const locales = ['en_US', 'fr_FR', 'it_IT'];
  for (const year of years) for (const locale of locales) {
    const file = path.join(mirrorRoot, String(year), `${locale}.json`); if (!fs.existsSync(file)) continue;
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const corrected = applyGeneralRomanAuthorityCorrections(normalizeLitcal(payload, locale), { year, locale });
    for (const event of corrected) {
      const key = `${event.id}|${event.dateISO}`;
      const current = byId.get(key) ?? {
        id:event.id, canonicalEventId:event.canonicalEventId ?? `rc:${event.id}`, dateISO:event.dateISO,
        grade:event.grade, rank:canonicalRank(event.grade), names:{}, authorityCorrection:event.authorityCorrection ?? null,
      };
      if (event.name) current.names[locale] = event.name;
      if (event.grade && (event.authorityCorrection || !current.grade)) {
        current.grade = event.grade;
        current.rank = canonicalRank(event.grade);
      }
      if (event.authorityCorrection) current.authorityCorrection = event.authorityCorrection;
      byId.set(key, current);
    }
  }
  return [...byId.values()].sort((a,b)=>a.dateISO.localeCompare(b.dateISO)||a.id.localeCompare(b.id));
}

function candidateScore(snlEvent, candidate) {
  const sourceLabels = eventSourceLabels(snlEvent);
  const comparisons = sourceLabels.flatMap((sourceLabel) => [candidate.id, candidate.canonicalEventId, ...Object.values(candidate.names ?? {})]
    .map((name) => ({ sourceLabel, name, lexical: lexicalScore(sourceLabel, name), basis: 'multilingual-token-normalization' })))
    .sort((a,b)=>b.lexical-a.lexical);
  const semanticAlias = Math.max(0, ...sourceLabels.map((sourceLabel)=>reviewedSemanticAliasScore(sourceLabel, candidate.id)));
  const calendarStructureAlias = Math.max(0, ...sourceLabels.map((sourceLabel)=>reviewedCalendarStructureScore(sourceLabel, candidate.id)));
  const structuralAlias = structuralDayScore(snlEvent, candidate);
  let best = comparisons[0] ?? { sourceLabel:'', name:'', lexical:0, basis:'none' };
  if (semanticAlias > best.lexical) best = { sourceLabel:sourceLabels[0] ?? '', name:candidate.id, lexical:semanticAlias, basis:'reviewed-semantic-alias' };
  if (calendarStructureAlias > best.lexical) best = { sourceLabel:sourceLabels[0] ?? '', name:candidate.id, lexical:calendarStructureAlias, basis:'reviewed-calendar-structure' };
  if (structuralAlias > best.lexical) best = { sourceLabel:sourceLabels[0] ?? '', name:candidate.id, lexical:structuralAlias, basis:'same-date-structural-day-inheritance' };
  const distance = dateDistance(snlEvent.dateISO, candidate.dateISO); const sameDate = distance === 0;
  const sourceRank = snlRank(snlEvent); const ranksAgree = Boolean(sourceRank && candidate.rank && sourceRank === candidate.rank);
  const score = Math.min(1, best.lexical * 0.78 + (sameDate ? 0.18 : Math.max(0, 0.12 - distance * 0.015)) + (ranksAgree ? 0.04 : 0));
  return {
    canonicalEventId:candidate.canonicalEventId, generalRomanId:candidate.id, generalRomanDateISO:candidate.dateISO,
    generalRomanGrade:candidate.grade, generalRomanRank:candidate.rank, names:candidate.names,
    lexicalScore:best.lexical, matchingBasis:best.basis, bestComparedName:best.name, matchedSourceLabel:best.sourceLabel,
    dateDistanceDays:distance, sameDate, ranksAgree, score:Number(score.toFixed(4)),
    authorityCorrection:candidate.authorityCorrection ?? null,
  };
}

export function reconcilePortugalSnl({ snlPackage, generalRoman }) {
  if (snlPackage?.run?.publicationAllowed !== false || snlPackage?.run?.promotionAllowed !== false) throw new Error('Portugal reconciliation requires a staging-only SNL package.');
  const sourceEvents = Array.isArray(snlPackage?.events) ? snlPackage.events : []; const output = [];
  for (const event of sourceEvents) {
    const sameYear = generalRoman.filter((candidate)=>candidate.dateISO.slice(0,4)===event.dateISO.slice(0,4));
    const sameDate = sameYear.filter((candidate)=>candidate.dateISO===event.dateISO);
    const nearby = sameYear.filter((candidate)=>dateDistance(candidate.dateISO,event.dateISO)<=14);
    const sameDateScores = sameDate.map((candidate)=>candidateScore(event,candidate)).sort((a,b)=>b.score-a.score);
    const nearbyScores = nearby.map((candidate)=>candidateScore(event,candidate)).sort((a,b)=>b.lexicalScore-a.lexicalScore||a.dateDistanceDays-b.dateDistanceDays);
    const best=sameDateScores[0]??null, second=sameDateScores[1]??null;
    const sourceRank=snlRank(event);
    const structuralSource=isStructuralDayLabel(event.names?.pt?.value ?? '');
    const transfer=nearbyScores.find((item)=>!item.sameDate&&item.lexicalScore>=0.78&&item.dateDistanceDays<=7);
    const strongSameDate=best && best.lexicalScore>=0.72 && (!second || best.score-second.score>=0.1);
    const highSameDate=sameDateScores.filter((item)=>isHighPrecedence(item.generalRomanRank));
    const conflictingHighSameDate=strongSameDate
      ? highSameDate.find((item)=>item.generalRomanId!==best.generalRomanId && item.lexicalScore<0.56)
      : highSameDate[0] ?? null;
    let disposition='portugal-proper-or-unmatched', reason='no-safe-general-roman-candidate', candidate=best;

    // A strong reviewed semantic match on a nearby date is more informative than an unrelated
    // same-date Sunday/weekday. It signals a jurisdictional transfer, never an automatic link.
    if (transfer && (!strongSameDate || transfer.lexicalScore>best.lexicalScore)) {
      disposition='transfer-candidate-review';
      reason='strong-label-match-on-nearby-general-roman-date';
      candidate=transfer;
    } else if (structuralSource && highSameDate.length && !strongSameDate) {
      disposition='precedence-delta-review';
      reason='general-high-precedence-event-is-absent-from-portugal-date';
      candidate=highSameDate[0];
    } else if (strongSameDate && isHighPrecedence(sourceRank) && conflictingHighSameDate) {
      disposition='precedence-delta-review';
      reason='official-high-precedence-portugal-observance-conflicts-with-general-high-precedence-same-date-event';
      candidate=conflictingHighSameDate;
    } else if (strongSameDate) {
      const rankDifference=rankDelta(sourceRank,best.generalRomanRank);
      disposition=rankDifference?'rank-delta-review':'canonical-link-proposal';
      reason=rankDifference?'same-date-lexical-match-with-rank-delta':'same-date-lexical-and-structural-match';
    } else if (best && best.lexicalScore>=0.56) {
      disposition='ambiguous-review';
      reason=second && best.score-second.score<0.1?'multiple-same-date-candidates':'same-date-match-below-safe-threshold';
    } else if (isHighPrecedence(sourceRank) || highSameDate.length) {
      disposition='precedence-delta-review';
      reason=isHighPrecedence(sourceRank)
        ? 'official-high-precedence-portugal-observance-differs-from-general-same-date-event'
        : 'general-high-precedence-event-is-absent-from-portugal-date';
      candidate=highSameDate[0] ?? best;
    } else if (sameDate.length===1) {
      disposition='structural-review';
      reason='single-general-roman-event-on-date-without-semantic-proof';
      candidate=sameDateScores[0];
    }
    output.push({ sourceOccurrenceId:event.id, sourceCanonicalEventId:event.canonicalEventId, dateISO:event.dateISO,
      sourceLabel:event.names?.pt?.value??null, sourceRank, sourceUid:event.sourceFacts?.uid??null, disposition, reason,
      reviewRequired:true, automaticLinkAllowed:false, candidate, alternatives:sameDateScores.slice(0,5) });
  }
  const buckets={}; for (const item of output) buckets[item.disposition]=(buckets[item.disposition]??0)+1;
  return { schemaVersion:1, mode:'proposal-only', churchId:'roman-catholic', jurisdictionId:'PT', productionWriteAllowed:false, automaticLinkAllowed:false,
    generatedAt:new Date().toISOString(), summary:{ inputOccurrences:sourceEvents.length, generalRomanReferenceEvents:generalRoman.length, ...buckets },
    policy:{
      identityRule:'No canonical identity is created or changed from a name match. All outputs are review proposals.',
      semanticRule:'Multilingual token equivalence, identifier splitting, reviewed calendar-structure keys and narrowly reviewed aliases may improve proposal ranking but never approve a link.',
      authorityRule:'Normative General Roman corrections are applied above the operational mirror; they are not Portugal deltas.',
      dateRule:'Same civil date is evidence of calendar alignment, not proof of semantic identity.',
      transferRule:'Strong lexical or reviewed-semantic similarity on a nearby date is a transfer candidate, never an automatic link.',
      precedenceRule:'An official Portugal feast/solemnity that differs from the General Roman event, or a General Roman high-precedence event absent from a Portuguese structural day, can never be silently inherited.',
      rankRule:'Rank differences remain explicit Portugal deltas and require review unless the General Roman reference itself is corrected by higher normative authority.',
    }, items:output };
}

function main() {
  const snlPath=path.resolve(argument('--snl','staging/portugal-snl/normalized-package.json'));
  const mirrorRoot=path.resolve(argument('--mirror-root','data/litcal-mirror/calendars/general'));
  const outputPath=path.resolve(argument('--output','staging/portugal-snl/reconciliation.json'));
  const snlPackage=JSON.parse(fs.readFileSync(snlPath,'utf8'));
  const years=[...new Set((snlPackage.events??[]).map((event)=>Number(String(event.dateISO).slice(0,4))).filter(Number.isInteger))];
  const generalRoman=loadGeneralRomanReference(mirrorRoot,years);
  if (!generalRoman.length) throw new Error(`No General Roman reference events found for SNL years: ${years.join(', ')||'none'}.`);
  const result=reconcilePortugalSnl({snlPackage,generalRoman});
  if (result.summary.inputOccurrences!==result.items.length) throw new Error('Reconciliation output does not partition the SNL input.');
  fs.mkdirSync(path.dirname(outputPath),{recursive:true}); fs.writeFileSync(outputPath,`${JSON.stringify(result,null,2)}\n`,'utf8');
  console.log(JSON.stringify(result.summary,null,2));
}

const invokedPath=process.argv[1]?path.resolve(process.argv[1]):'';
if (invokedPath===fileURLToPath(import.meta.url)) { try { main(); } catch(error) { console.error(error); process.exit(1); } }
