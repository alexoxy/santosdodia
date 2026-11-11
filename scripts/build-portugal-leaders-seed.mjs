import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const JURISDICTIONS = {
  dlisb: ['jurisdiction:roman-catholic:pt-lisbon', 'Patriarcado de Lisboa', 'patriarchate', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.patriarcado-lisboa.pt/'],
  dangr: ['jurisdiction:roman-catholic:pt-angra', 'Diocese de Angra', 'diocese', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.diocesedeangra.pt/'],
  dfunc: ['jurisdiction:roman-catholic:pt-funchal', 'Diocese do Funchal', 'diocese', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.diocesedofunchal.com/'],
  dgrdp: ['jurisdiction:roman-catholic:pt-guarda', 'Diocese da Guarda', 'diocese', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.diocesedaguarda.pt/'],
  dleir: ['jurisdiction:roman-catholic:pt-leiria-fatima', 'Diocese de Leiria-Fátima', 'diocese', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.leiria-fatima.pt/diocese/'],
  dpacb: ['jurisdiction:roman-catholic:pt-portalegre-castelo-branco', 'Diocese de Portalegre-Castelo Branco', 'diocese', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.portalegre-castelobranco.pt/'],
  dsntp: ['jurisdiction:roman-catholic:pt-santarem', 'Diocese de Santarém', 'diocese', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.diocese-santarem.pt/'],
  dsetu: ['jurisdiction:roman-catholic:pt-setubal', 'Diocese de Setúbal', 'diocese', 'jurisdiction:roman-catholic:pt-province-lisbon', 'https://www.diocese-setubal.pt/'],
  dbrgp: ['jurisdiction:roman-catholic:pt-braga', 'Arquidiocese de Braga', 'archdiocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocese-braga.pt/'],
  davei: ['jurisdiction:roman-catholic:pt-aveiro', 'Diocese de Aveiro', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocese-aveiro.pt/'],
  dbrmi: ['jurisdiction:roman-catholic:pt-braganca-miranda', 'Diocese de Bragança-Miranda', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocesebm.pt/'],
  dcoim: ['jurisdiction:roman-catholic:pt-coimbra', 'Diocese de Coimbra', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocesedecoimbra.pt/'],
  dlame: ['jurisdiction:roman-catholic:pt-lamego', 'Diocese de Lamego', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocese-lamego.pt/'],
  dprtp: ['jurisdiction:roman-catholic:pt-porto', 'Diocese do Porto', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocese-porto.pt/'],
  dvdcp: ['jurisdiction:roman-catholic:pt-viana-castelo', 'Diocese de Viana do Castelo', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocesedeviana.pt/'],
  dvlrp: ['jurisdiction:roman-catholic:pt-vila-real', 'Diocese de Vila Real', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocese-vilareal.pt/'],
  dvise: ['jurisdiction:roman-catholic:pt-viseu', 'Diocese de Viseu', 'diocese', 'jurisdiction:roman-catholic:pt-province-braga', 'https://www.diocesedeviseu.pt/'],
  devor: ['jurisdiction:roman-catholic:pt-evora', 'Arquidiocese de Évora', 'archdiocese', 'jurisdiction:roman-catholic:pt-province-evora', 'https://www.dioceseevora.pt/'],
  dbeja: ['jurisdiction:roman-catholic:pt-beja', 'Diocese de Beja', 'diocese', 'jurisdiction:roman-catholic:pt-province-evora', 'https://www.diocesedebeja.pt/'],
  dfaro: ['jurisdiction:roman-catholic:pt-algarve', 'Diocese do Algarve', 'diocese', 'jurisdiction:roman-catholic:pt-province-evora', 'https://diocese-algarve.pt/'],
  dmlpt: ['jurisdiction:roman-catholic:pt-military-ordinariate', 'Ordinariato Castrense de Portugal', 'ordinariate', 'jurisdiction:roman-catholic:pt-cep', 'https://www.conferenciaepiscopal.pt/v1/dioceses/'],
  dxxpt: ['jurisdiction:roman-catholic:pt-nunciature', 'Nunciatura Apostólica em Portugal', 'nunciature', 'jurisdiction:roman-catholic:universal', 'https://nunciaturaapostolica.pt/']
};

const SOURCES = {
  'catholic-hierarchy': ['Catholic-Hierarchy', 'https://www.catholic-hierarchy.org/', 'www.catholic-hierarchy.org', 'specialist-reference-directory', 'catholic-hierarchy', 168, 0.25],
  'portuguese-episcopal-conference-directory': ['Conferência Episcopal Portuguesa — diretório de dioceses', 'https://www.conferenciaepiscopal.pt/v1/dioceses/', 'www.conferenciaepiscopal.pt', 'official-church-or-jurisdiction', 'official-html', 168, 0.2],
  'holy-see-bulletin': ['Holy See Press Office bulletins', 'https://press.vatican.va/', 'press.vatican.va', 'official-appointment-bulletin', 'holy-see-bulletin', 24, 0.2],
  'patriarchate-lisbon': ['Patriarcado de Lisboa', 'https://www.patriarcado-lisboa.pt/', 'www.patriarcado-lisboa.pt', 'official-church-or-jurisdiction', 'official-html', 168, 0.2],
  'archdiocese-braga': ['Arquidiocese de Braga', 'https://www.diocese-braga.pt/', 'www.diocese-braga.pt', 'official-church-or-jurisdiction', 'official-html', 168, 0.2],
  'diocese-porto': ['Diocese do Porto', 'https://www.diocese-porto.pt/', 'www.diocese-porto.pt', 'official-church-or-jurisdiction', 'official-html', 168, 0.2]
};

const ROOT_JURISDICTIONS = [
  ['jurisdiction:roman-catholic:universal', 'global-church', 'Igreja Católica Romana universal', null, null, null, 'https://www.vatican.va/'],
  ['jurisdiction:roman-catholic:pt-cep', 'episcopal-conference', 'Conferência Episcopal Portuguesa', 'jurisdiction:roman-catholic:universal', 'PT', null, 'https://www.conferenciaepiscopal.pt/'],
  ['jurisdiction:roman-catholic:pt-province-braga', 'province', 'Província Eclesiástica de Braga', 'jurisdiction:roman-catholic:pt-cep', 'PT', 'PT-PROVINCE-BRAGA', 'https://www.conferenciaepiscopal.pt/v1/dioceses/'],
  ['jurisdiction:roman-catholic:pt-province-evora', 'province', 'Província Eclesiástica de Évora', 'jurisdiction:roman-catholic:pt-cep', 'PT', 'PT-PROVINCE-EVORA', 'https://www.conferenciaepiscopal.pt/v1/dioceses/'],
  ['jurisdiction:roman-catholic:pt-province-lisbon', 'province', 'Província Eclesiástica de Lisboa', 'jurisdiction:roman-catholic:pt-cep', 'PT', 'PT-PROVINCE-LISBON', 'https://www.conferenciaepiscopal.pt/v1/dioceses/']
];

function parseArgs() {
  const output = { input: '', output: '', expected: 29, verifiedAt: '2026-08-03' };
  for (const token of process.argv.slice(2)) {
    if (token.startsWith('--input=')) output.input = token.slice(8);
    else if (token.startsWith('--output=')) output.output = token.slice(9);
    else if (token.startsWith('--expected=')) output.expected = Number(token.slice(11));
    else if (token.startsWith('--verified-at=')) output.verifiedAt = token.slice(14);
  }
  if (!output.input || !output.output) throw new Error('Usage: --input=<approved.csv> --output=<seed.sql> [--expected=29]');
  if (!Number.isInteger(output.expected) || output.expected < 1) throw new Error('Invalid --expected value.');
  return output;
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (quoted) throw new Error('Unterminated quoted CSV field.');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  const nonEmpty = rows.filter(values => values.some(value => value.trim()));
  const headers = nonEmpty.shift();
  if (!headers?.length) throw new Error('CSV has no header.');
  return nonEmpty.map(values => Object.fromEntries(headers.map((header, column) => [header, values[column] ?? '']))).map((item, index) => ({ ...item, _row: index + 2 }));
}

function slug(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sql(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function tuple(row) { return `(${row.map(sql).join(',')})`; }
function valueList(rows) { return rows.map(tuple).join(',\n'); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }

function officialSourceId(urlValue) {
  const host = new URL(urlValue).hostname;
  if (host === 'www.conferenciaepiscopal.pt') return 'portuguese-episcopal-conference-directory';
  if (host === 'press.vatican.va') return 'holy-see-bulletin';
  if (host === 'www.patriarcado-lisboa.pt') return 'patriarchate-lisbon';
  if (host === 'diocese-braga.pt' || host === 'www.diocese-braga.pt') return 'archdiocese-braga';
  if (host === 'www.diocese-porto.pt') return 'diocese-porto';
  throw new Error(`Official source host is not registered: ${host}`);
}

function personId(name) {
  return name === 'José Ornelas Carvalho' ? 'person:jose-ornelas-carvalho' : `person:${slug(name)}`;
}

function officeType(title) {
  const value = title.toLowerCase();
  if (value.includes('núncio')) return 'apostolic-nuncio';
  if (value.includes('auxiliar')) return 'auxiliary-bishop';
  if (value.includes('patriarca')) return 'patriarch';
  if (value.includes('arcebispo')) return 'metropolitan-archbishop';
  if (value.includes('forças armadas')) return 'military-ordinary';
  if (value.includes('cardeal')) return 'diocesan-bishop-cardinal';
  return 'diocesan-bishop';
}

function validate(rows, expected) {
  const required = ['person_id', 'name', 'jurisdiction_id', 'office_title', 'country', 'reference_source_url', 'official_source_url', 'verification_status'];
  const errors = [];
  if (rows.length !== expected) errors.push(`Expected ${expected} approved rows, received ${rows.length}.`);
  const people = new Set(), externalIds = new Set(), offices = new Set();
  for (const row of rows) {
    for (const field of required) if (!row[field]?.trim()) errors.push(`Row ${row._row}: missing ${field}.`);
    if (row.country !== 'PT') errors.push(`Row ${row._row}: unexpected country ${row.country}.`);
    if (!row.verification_status.startsWith('officially-')) errors.push(`Row ${row._row}: record is not officially approved.`);
    if (!JURISDICTIONS[row.jurisdiction_id]) errors.push(`Row ${row._row}: unknown jurisdiction ${row.jurisdiction_id}.`);
    if (!/^https:\/\//.test(row.reference_source_url) || !/^https:\/\//.test(row.official_source_url)) errors.push(`Row ${row._row}: source URLs must use HTTPS.`);
    const externalId = row.person_id.split(':').at(-1);
    const canonicalPerson = personId(row.name);
    const officeKey = `${canonicalPerson}:${row.jurisdiction_id}:${officeType(row.office_title)}`;
    if (people.has(canonicalPerson)) errors.push(`Row ${row._row}: duplicate canonical person ${canonicalPerson}.`); else people.add(canonicalPerson);
    if (externalIds.has(externalId)) errors.push(`Row ${row._row}: duplicate Catholic-Hierarchy identifier ${externalId}.`); else externalIds.add(externalId);
    if (offices.has(officeKey)) errors.push(`Row ${row._row}: duplicate office ${officeKey}.`); else offices.add(officeKey);
    try { officialSourceId(row.official_source_url); } catch (error) { errors.push(`Row ${row._row}: ${error.message}`); }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

function buildSeed(rows, verifiedAt) {
  const sourceRows = Object.entries(SOURCES).map(([id, [name, baseUrl, host, authority, adapter, refreshHours, requestsPerSecond]]) => [id, name, baseUrl, host, authority, adapter, refreshHours, requestsPerSecond, 1]);
  const jurisdictionRows = ROOT_JURISDICTIONS.map(([id, level, name, parentId, countryCode, regionCode, officialUrl]) => [id, 'church:roman-catholic', parentId, level, name, countryCode, regionCode, null, officialUrl, null, null, verifiedAt, verifiedAt]);
  for (const [externalId, [id, name, level, parentId, officialUrl]] of Object.entries(JURISDICTIONS)) {
    jurisdictionRows.push([id, 'church:roman-catholic', parentId, level, name, 'PT', `PT-${externalId.toUpperCase()}`, null, officialUrl, null, null, verifiedAt, verifiedAt]);
  }

  const people = [], names = [], externalIdentifiers = [], offices = [], assertions = [];
  for (const row of rows) {
    const canonicalPerson = personId(row.name);
    const externalId = row.person_id.split(':').at(-1);
    const jurisdictionId = JURISDICTIONS[row.jurisdiction_id][0];
    const type = officeType(row.office_title);
    const officeId = `office:${jurisdictionId.split(':').at(-1)}:${type}:${slug(row.name)}`;
    const officialSource = officialSourceId(row.official_source_url);
    const status = row.name === 'Vitorino José Pereira Soares' ? 'appointed' : 'active';
    const appointedAt = row.effective_date || null;
    people.push([canonicalPerson, row.name, null, null, 1, verifiedAt, verifiedAt]);
    names.push([canonicalPerson, 'pt', row.name, 'official', officialSource]);
    externalIdentifiers.push(['person', canonicalPerson, 'catholic-hierarchy', externalId, row.reference_source_url]);
    offices.push([officeId, canonicalPerson, jurisdictionId, type, row.office_title.trim(), appointedAt, null, null, status, verifiedAt, verifiedAt]);
    const assertionValue = JSON.stringify({ title: row.office_title.trim(), verificationStatus: row.verification_status, referenceUrl: row.reference_source_url, note: row.notes });
    const contentHash = sha256(`${officeId}${row.official_source_url}${assertionValue}`);
    assertions.push([`assertion:${contentHash.slice(0, 24)}`, 'office', officeId, 'active-office', assertionValue, officialSource, null, row.official_source_url, `${verifiedAt}T00:00:00Z`, appointedAt, null, contentHash, 'authoritative']);
  }

  return `-- Santos do Dia — Portugal ecclesiastical leaders approved ${verifiedAt}\n-- Generated from the approved Dropbox CSV. Idempotent Cloudflare D1 / SQLite seed.\nPRAGMA foreign_keys = ON;\nBEGIN IMMEDIATE;\n\nINSERT INTO source_registry\n(id,name,base_url,host,authority,adapter,refresh_hours,requests_per_second,active)\nVALUES\n${valueList(sourceRows)}\nON CONFLICT(id) DO UPDATE SET name=excluded.name,base_url=excluded.base_url,host=excluded.host,authority=excluded.authority,adapter=excluded.adapter,refresh_hours=excluded.refresh_hours,requests_per_second=excluded.requests_per_second,active=excluded.active,updated_at=CURRENT_TIMESTAMP;\n\nINSERT INTO churches\n(id,family,tradition,canonical_name,canonical_url,parent_church_id,active,first_seen_at,last_verified_at)\nVALUES\n('church:roman-catholic','catholic','roman-catholic','Igreja Católica Romana','https://www.vatican.va/',NULL,1,'${verifiedAt}','${verifiedAt}')\nON CONFLICT(id) DO UPDATE SET canonical_name=excluded.canonical_name,canonical_url=excluded.canonical_url,active=1,last_verified_at=excluded.last_verified_at;\n\nINSERT INTO jurisdictions\n(id,church_id,parent_jurisdiction_id,level,canonical_name,country_code,region_code,city,official_url,active_from,active_until,first_seen_at,last_verified_at)\nVALUES\n${valueList(jurisdictionRows)}\nON CONFLICT(id) DO UPDATE SET church_id=excluded.church_id,parent_jurisdiction_id=excluded.parent_jurisdiction_id,level=excluded.level,canonical_name=excluded.canonical_name,country_code=excluded.country_code,region_code=excluded.region_code,city=excluded.city,official_url=excluded.official_url,active_from=COALESCE(excluded.active_from,jurisdictions.active_from),active_until=NULL,last_verified_at=excluded.last_verified_at;\n\nINSERT INTO people\n(id,canonical_name,birth_date,death_date,active,first_seen_at,last_verified_at)\nVALUES\n${valueList(people)}\nON CONFLICT(id) DO UPDATE SET canonical_name=excluded.canonical_name,active=excluded.active,last_verified_at=excluded.last_verified_at;\n\nINSERT INTO person_names\n(person_id,locale,value,quality,source_id)\nVALUES\n${valueList(names)}\nON CONFLICT(person_id,locale,value) DO UPDATE SET quality=excluded.quality,source_id=excluded.source_id;\n\nINSERT INTO external_identifiers\n(entity_type,entity_id,source_id,external_id,external_url)\nVALUES\n${valueList(externalIdentifiers)}\nON CONFLICT(source_id,external_id) DO UPDATE SET entity_type=excluded.entity_type,entity_id=excluded.entity_id,external_url=excluded.external_url;\n\nINSERT INTO ecclesiastical_offices\n(id,person_id,jurisdiction_id,office_type,title,appointed_at,installed_at,ended_at,status,first_seen_at,last_verified_at)\nVALUES\n${valueList(offices)}\nON CONFLICT(id) DO UPDATE SET person_id=excluded.person_id,jurisdiction_id=excluded.jurisdiction_id,office_type=excluded.office_type,title=excluded.title,appointed_at=COALESCE(excluded.appointed_at,ecclesiastical_offices.appointed_at),installed_at=COALESCE(excluded.installed_at,ecclesiastical_offices.installed_at),ended_at=NULL,status=excluded.status,last_verified_at=excluded.last_verified_at;\n\nINSERT INTO source_assertions\n(id,subject_type,subject_id,field,value_json,source_id,snapshot_id,source_url,observed_at,effective_from,effective_until,content_hash,confidence)\nVALUES\n${valueList(assertions)}\nON CONFLICT(id) DO UPDATE SET value_json=excluded.value_json,source_id=excluded.source_id,source_url=excluded.source_url,observed_at=excluded.observed_at,effective_from=excluded.effective_from,effective_until=NULL,content_hash=excluded.content_hash,confidence=excluded.confidence;\n\nCOMMIT;\n`;
}

async function main() {
  const options = parseArgs();
  const inputText = await readFile(path.resolve(options.input), 'utf8');
  const rows = parseCsv(inputText);
  validate(rows, options.expected);
  const seed = buildSeed(rows, options.verifiedAt);
  const outputPath = path.resolve(options.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, seed, 'utf8');
  console.log(JSON.stringify({
    input: path.resolve(options.input),
    output: outputPath,
    records: rows.length,
    bytes: Buffer.byteLength(seed),
    sha256: sha256(seed),
    statuses: Object.fromEntries([...new Set(rows.map(row => row.verification_status))].map(status => [status, rows.filter(row => row.verification_status === status).length]))
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
