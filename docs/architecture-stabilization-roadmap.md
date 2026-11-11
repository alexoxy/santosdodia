# SantosDia architecture stabilization roadmap

## Decision sequence

The project expands content only after operational stability, repository hygiene and canonical data contracts are verified. The mandatory sequence is:

1. resolve active CI, deployment and monitoring failures;
2. remove unnecessary code, generated data and external mirrors;
3. establish storage, provenance, validation and rollback contracts;
4. validate Church-specific calendar engines;
5. provision and test database promotion;
6. add bounded, verified content packages;
7. expand coverage incrementally.

## Storage responsibilities

| Layer | Responsibility | Retention |
|---|---|---|
| External sources | Evidence acquisition only | Not a runtime dependency |
| Dropbox staging | Raw snapshots, checksums, normalization, validation reports and reconstructable packages | Historical, policy-controlled |
| Git repository | Application code, schemas, tests, compact manifests and minimal runtime fallbacks | Small and reviewable |
| GitHub Actions artifacts | Short-lived transfer and diagnostics | 7 days by default |
| D1 database | Canonical validated facts and publication state | Transactional with rollback metadata |
| Public site/API | Read-only presentation of approved canonical data | No direct source scraping |

## Repository budgets

Initial enforced limits:

- maximum 1,500 tracked files;
- maximum 50 MiB in the checked-out tracked tree;
- maximum 5 MiB per tracked file;
- maximum 250 generated data files;
- no raw HTML, PDFs, archives, database files or SQL dumps in generated-data paths;
- no vendored external source trees;
- no permanent one-time workflows.

Limits may only be raised through a documented architecture decision explaining runtime value, alternatives and retention cost.

## Canonical data principles

- Source assertions are immutable and separate from canonical resolutions.
- Every assertion records source, URL, retrieval time, checksum, authority level and validation state.
- Conflicts remain represented; they are not overwritten by the latest scrape.
- Promotion packages are idempotent and transactional.
- Publication requires explicit validation thresholds.
- A source outage cannot remove previously validated public records.
- Parser drift fails closed.

## Calendar architecture

Separate engines are required for:

- Western Gregorian traditions;
- Byzantine paschalion and calendar variants;
- Armenian Apostolic rules;
- Coptic calendar conversion and movable cycles;
- Ethiopian calendar conversion and movable cycles;
- Syriac Orthodox rules.

Non-Byzantine Churches must never inherit a generic Orthodox date engine. Each engine requires multi-year reference vectors and official or high-authority confirmation.

## Delivery gates

### Gate A — Operational stability

Dependency audit, repository audit, data audits, TypeScript, lint, Next.js build, Cloudflare/OpenNext build and local smoke test all pass.

### Gate B — Staging integrity

Dropbox snapshot, checksum, source manifest, normalized package and validation report exist and agree on record counts.

### Gate C — Database promotion

Migration is reviewed; package is idempotent; transaction and rollback are tested; no provisional assertion is published.

### Gate D — Product publication

Language quality, Church/date-engine correctness, jurisdiction filters, source links and last-verification metadata are confirmed.

## Current implementation status

Completed in the stabilization branch:

1. The full LitCal upstream source mirror was removed from the active tree.
2. Runtime and LitCal fallback data were compacted and bounded by repository budgets.
3. Dependency, repository, data, calendar, API, TypeScript, lint, Next.js and Cloudflare gates were validated.
4. D1 migrations were separated into a canonical directory core and a multi-Church calendar layer.
5. Database tests now exercise migration application, idempotent promotion, foreign keys, global uniqueness and rollback.
6. Scheduled source updates now produce provisional staging artifacts rather than publishing directly.

Next controlled phase:

1. provision an isolated D1 test database and apply migrations;
2. archive the first validated calendar package in Dropbox;
3. promote a bounded non-production package and verify rollback;
4. add multi-year official reference vectors for each Church-specific date engine;
5. publish content only after the staging and product gates pass.

## History cleanup

Deleting files from the current tree does not remove their bytes from Git history. A history rewrite is a separate high-impact operation requiring:

- a verified Dropbox backup;
- a repository maintenance window;
- explicit identification of protected refs and open branches;
- collaborator notification;
- force-push and local clone recovery instructions.

It will not be performed as part of ordinary cleanup without a separate decision.
