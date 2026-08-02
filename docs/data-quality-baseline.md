# Data quality baseline

_Date: 2026-08-02_

## Scope

This baseline covers the curated observance dataset in `data/observances.ts`, the source catalogue used by those records, the supported interface locales and the persisted dynamic-source snapshot.

It does not treat a successful machine import as editorial verification.

## Inventory

- Curated observances: **46**
- Catalogued sources: **12**
- Christian traditions represented: **8**
- Interface locales supported: **10**
- Categories represented: **6**
- Calendar systems used by curated records: **6**
- Persisted dynamic snapshot years: **0**
- Persisted dynamic snapshot generation date: **none**

## Validation status

- `verified`: **5**
- `cross-checked`: **40**
- `review-required`: **1**
- `imported`: **0**

These labels describe the current data, not compliance with the new minimum verified-profile standard.

## Field coverage

- English canonical names: **46/46 — 100%**
- Portuguese names: **46/46 — 100%**
- Geographic scope: **46/46 — 100%**
- Patronages: **18/46 — 39.1%**
- Editorial summaries: **0/46 — 0%**
- Curated records with `lastVerified`: **0/46 — 0%**

Other supported languages are partial and uneven. They must be measured field by field before the service describes a record or language as fully localised.

## Publication assessment under the new standard

- Structurally publishable records: **45**
- Strictly verified records: **5**, subject to adding a recorded editorial review date
- Adequately cross-checked records: **35**, subject to confirming source independence and adding a review date
- Review-gated records: **1**
- Records marked `cross-checked` but supported by only one source: **5**

The five single-source records currently marked `cross-checked` are:

1. `our-lady-lourdes`
2. `fatima`
3. `anthony-lisbon`
4. `our-lady-carmel`
5. `teresa-avila`

Their factual content may be correct, but the status label is not consistent with the meaning of cross-checking. They require either a second independent source or an explicit reclassification after editorial review.

## Principal findings

### 1. Validation status was previously too permissive

The record helper assigns `cross-checked` by default. This permits a one-source record to receive a label that implies independent corroboration.

The automatic audit now reports this mismatch. New records must satisfy the status-specific criteria in `docs/verified-profile-standard.md`.

### 2. Verification dates are absent

No curated record currently contains `lastVerified`. The project therefore cannot show when a published claim was last reviewed or distinguish current editorial review from inherited data.

This is the highest-priority metadata gap after correcting status semantics.

### 3. The dataset contains names and dates, but no editorial summaries

The curated records provide strong multilingual naming coverage for English and Portuguese, but no record currently includes an editorial summary. The product should not generate or publish biographies automatically to fill this gap.

Summaries should be introduced only when they have claim-level sources and an editorial translation status.

### 4. Patronage coverage is limited and lacks claim-level provenance

Only 18 curated records contain patronages. Patronages are currently stored as strings attached to the observance, with no separate source reference or jurisdictional scope for the individual claim.

The data model should evolve toward structured patronage assertions before patronage-led discovery is expanded substantially.

### 5. The dynamic fallback snapshot was invalid

`data/generated/source-snapshot.json` was empty while being imported as JSON by the application. It has been replaced with a valid empty snapshot containing:

- `generatedAt: null`
- an empty `years` object
- an empty `sourceHealth` array

This restores a schema-valid fallback without inventing source data. The next controlled source synchronisation must populate it and record source-health results.

### 6. Dynamic imports and curated data require different trust treatment

The live LitCal integration creates records marked `verified`, while the Orthodox aggregator creates `review-required` records. This distinction is directionally correct, but imported source status must not bypass the minimum verified-profile standard.

A central publication policy now evaluates dynamically imported records before they reach public API, page and calendar consumers. The default public path accepts:

- `verified` records backed by an official or scholarly source;
- `cross-checked` records with at least two source references and at least one official or scholarly source.

It withholds `review-required`, `imported`, single-source `cross-checked` and records without an authoritative source. Curated records remain subject to their separate editorial remediation queue rather than being silently removed.

Dynamic records still require:

- source-health visibility;
- schema and duplication checks;
- explicit source and retrieval dates;
- editorial confirmation that nominally distinct sources are genuinely independent.

## Automatic enforcement introduced

The repository now contains `scripts/audit-data-quality.mjs` and these commands:

```bash
npm run data:audit
npm run data:report
```

The audit checks:

- duplicate and missing identifiers;
- invalid fixed dates;
- unknown traditions, categories and sources;
- missing English names and sources;
- validation status versus source count;
- verification-date coverage;
- summary, patronage and geographic coverage;
- validity of the persisted source snapshot.

Hard structural failures stop the quality pipeline. Editorial debt remains visible as warnings rather than being silently relabelled.

## Immediate remediation queue

1. Add a verified editorial review date to the five currently `verified` records after reviewing their source support.
2. Review the five single-source `cross-checked` records and either add an independent source or reclassify them.
3. Confirm source independence for the 35 multi-source `cross-checked` records.
4. Populate a controlled dynamic snapshot for the current and following year.
5. Confirm the publication gate on public API, page and ICS paths through the quality pipeline.
6. Introduce structured, source-specific patronage assertions before expanding patronage discovery.
7. Add sourced editorial summaries incrementally, beginning with the highest-demand records.

## Baseline conclusion

The product has a coherent technical model and broad tradition coverage for a curated beta, but the editorial confidence model is not yet mature enough to support claims of comprehensive verification. The immediate product priority is therefore not mass ingestion; it is enforcing source semantics, review dates and publication gates.
