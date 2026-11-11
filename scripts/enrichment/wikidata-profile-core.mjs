import { createHash } from 'node:crypto';

const QID = /^Q[1-9]\d*$/u;
const MAX_QIDS = 40;

function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function qidFromUri(value) { return typeof value === 'string' ? value.match(/\/entity\/(Q[1-9]\d*)$/u)?.[1] ?? null : null; }
function value(binding, key) { return binding?.[key]?.value ?? null; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }

export function buildProfileQuery(qids) {
  if (!Array.isArray(qids) || qids.length < 1 || qids.length > MAX_QIDS) throw new RangeError(`qids must contain 1-${MAX_QIDS} items.`);
  const selected = [...new Set(qids)];
  if (selected.length !== qids.length || selected.some((qid) => !QID.test(qid))) throw new Error('Profile enrichment requires unique exact Wikidata QIDs.');
  const values = selected.map((qid) => `wd:${qid}`).join(' ');
  return `SELECT ?item ?birth ?death ?relationType ?place ?placeLabel ?coord ?country ?countryLabel WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item wdt:P569 ?birth. }
  OPTIONAL { ?item wdt:P570 ?death. }
  OPTIONAL {
    { ?item wdt:P19 ?place. BIND("birth" AS ?relationType) }
    UNION { ?item wdt:P20 ?place. BIND("death" AS ?relationType) }
    UNION { ?item wdt:P119 ?place. BIND("burial" AS ?relationType) }
    UNION { ?item wdt:P937 ?place. BIND("activity" AS ?relationType) }
    OPTIONAL { ?place wdt:P625 ?coord. }
    OPTIONAL { ?place wdt:P17 ?country. }
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en". }
}`;
}

export function parsePoint(valueText) {
  if (typeof valueText !== 'string') return null;
  const match = /^Point\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)$/u.exec(valueText.trim());
  if (!match) return null;
  const lon = Number(match[1]);
  const lat = Number(match[2]);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function normalizeDateValues(values) {
  const sorted = unique(values).sort();
  return {
    values: sorted,
    canonical: sorted.length === 1 ? sorted[0] : null,
    resolutionStatus: sorted.length === 0 ? 'missing' : sorted.length === 1 ? 'single-source-value' : 'conflict-review-required'
  };
}

export function normalizeProfileBindings(response, requestedQids) {
  if (!Array.isArray(requestedQids) || requestedQids.some((qid) => !QID.test(qid))) throw new Error('requestedQids must contain exact Wikidata QIDs.');
  const bindings = response?.results?.bindings;
  if (!Array.isArray(bindings)) throw new Error('Wikidata profile response is missing results.bindings.');
  const requested = new Set(requestedQids);
  const state = new Map(requestedQids.map((qid) => [qid, { birth: [], death: [], places: new Map() }]));

  for (const binding of bindings) {
    const qid = qidFromUri(value(binding, 'item'));
    if (!qid || !requested.has(qid)) throw new Error(`Profile response contains an unexpected entity: ${value(binding, 'item') ?? '<missing>'}.`);
    const current = state.get(qid);
    if (value(binding, 'birth')) current.birth.push(value(binding, 'birth'));
    if (value(binding, 'death')) current.death.push(value(binding, 'death'));
    const relationType = value(binding, 'relationType');
    const placeQid = qidFromUri(value(binding, 'place'));
    if (relationType && placeQid) {
      if (!['birth', 'death', 'burial', 'activity'].includes(relationType)) throw new Error(`Unsupported place relation ${relationType}.`);
      const key = `${relationType}|${placeQid}`;
      const coordinates = parsePoint(value(binding, 'coord'));
      const countryQid = qidFromUri(value(binding, 'country'));
      const existing = current.places.get(key) ?? {
        placeId: `wikidata:${placeQid}`,
        placeQid,
        relationType,
        currentName: value(binding, 'placeLabel') ?? null,
        historicalName: null,
        countryId: countryQid ? `wikidata:${countryQid}` : null,
        countryQid,
        countryName: value(binding, 'countryLabel') ?? null,
        lat: coordinates?.lat ?? null,
        lon: coordinates?.lon ?? null,
        confidence: 0.68,
        sourceIds: ['wikidata']
      };
      if (!existing.currentName && value(binding, 'placeLabel')) existing.currentName = value(binding, 'placeLabel');
      if (existing.lat === null && coordinates) { existing.lat = coordinates.lat; existing.lon = coordinates.lon; }
      current.places.set(key, existing);
    }
  }

  const entities = requestedQids.map((qid) => {
    const current = state.get(qid);
    return {
      schemaVersion: 1,
      entityId: `wikidata:${qid}`,
      qid,
      identityBasis: 'exact-wikidata-identifier',
      dates: {
        birth: normalizeDateValues(current.birth),
        death: normalizeDateValues(current.death)
      },
      places: [...current.places.values()].sort((a, b) => a.relationType.localeCompare(b.relationType) || a.placeId.localeCompare(b.placeId)),
      historicalGeographyStatus: 'not-inferred',
      publish: false
    };
  });

  return {
    schemaVersion: 1,
    enrichmentId: 'saints-profile-v1',
    sourceId: 'wikidata',
    requestedQids: [...requestedQids],
    entityCount: entities.length,
    queryResultRowCount: bindings.length,
    queryResultSha256: sha256(JSON.stringify(bindings)),
    productionMutation: false,
    entities
  };
}
