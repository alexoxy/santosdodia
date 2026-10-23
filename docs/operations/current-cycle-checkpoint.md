# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 19:12 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v28.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 291/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#402](https://github.com/alexoxy/santosdodia/pull/402) delivered E07.05 batch 22:

- represented the First Martyrs of the Church of Rome as one canonical subjectless collective Observance;
- introduced Observance model v1.2 and the dedicated `collective-commemoration` type;
- allows an empty subject list only for an officially attested unenumerated collective and rejects synthetic Person/Recognition records;
- retained the normal subject requirement for personal and finite multi-person commemorations;
- bound the Portugal 2026 occurrence on 30 June and optional-memorial rank to the exact SNL source row;
- used direct SNL and Holy See evidence for the collective identity;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `87caacdd3ef7c5b3927b6bb7967eb4ddfe1112c8`.

Squash merge: `ef34c1b0549a40ae111119fba1261b9502648159`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Fixed Sanctorale bindings: **93** across **88 civil days**.
- Total source-bound coverage: **291/389 (74.807%)**.
- Remaining: **98 occurrences** and **80 civil days**.
- Source-bound days: **285/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Fixed collective observances | 1 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| **Total** | **98** |

## CI, email and external proof

PR #402 workflows on the exact validated head:

- Quality #1483, run `40008623312`: success;
- Sanctorale review #61, run `40008623271`: success;
- Product BUILD #122, run `40008623216`: success;
- Product staging #118, run `40008623923`: success;
- Wikidata retry #639, run `40008623231`: success.

Local proof passed the focused Observance/Occurrence/Sanctorale tests, semantic inventory 291+98=389, 365/365 reconciliation, full `npm run check`, the AdSense fail-closed checker and `npm run cloudflare:build`. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

Dropbox staging for the exact head contains `manifest.json`, `validation.json`, `release.json` and `localization-review.json`. Validation confirms 389 occurrences, 365 days, 1,945 labels and `productionApproved: false`.

The initial non-Trash Gmail search found no new SantosDia/GitHub/Cloudflare failure or quota alert. No mail was moved or deleted.

Dropbox proof:

- v28 JSON: `id:oANWCGUyYBwAAAAAAAAY5w`, SHA-256 `e3479e1cf6076ff81b2f793fdd8c59f0be518a7e6eac6752fa5f9c8a147133b4`, 319,056 bytes;
- v28 MD: `id:oANWCGUyYBwAAAAAAAAY6A`, SHA-256 `196dd5ed71213b95d2cc2c5c1542b85334267f08afe4ef4656e5945450f1d778`, 160,470 bytes;
- batch receipt: `id:oANWCGUyYBwAAAAAAAAY6Q`, 2,661 bytes;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAY2Q`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAY2g`;
- staging release: `id:oANWCGUyYBwAAAAAAAAY2w`.

Issue #355 points to v28 and the batch-22 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #402 was integrated only after five workflows passed on the exact head and expected base.
- Its 18 files are confined to the collective model and batch; generated translation drift and lateral artifacts were excluded.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Issue #355 remains the single live execution record; no duplicate batch issue was created.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.
- The development branch was created from an explicit main SHA and the merge used the exact expected head.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 291/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 291-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A finite, officially enumerated group remains independent Person/Recognition subjects of a multi-person Observance.
- An officially attested but unenumerated collective may be Observance-only; it cannot manufacture anonymous people.
- Optional memorials remain subject to precedence. Green shadow CI never authorizes production.
- The remaining Archangels row must not be forced into a human Person model.
- Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Resolve Archangels only with an explicit non-human subject model or justified Observance-only representation.
2. If that model needs further evidence, continue the next independent fixed person or Marian-title row without blocking E07.05.
3. Continue 50 fixed persons, 16 fixed/non-person observances and eight Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v28; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 22.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
