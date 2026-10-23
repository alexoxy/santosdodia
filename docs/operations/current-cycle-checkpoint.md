# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 22:32 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v32.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 295/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#410](https://github.com/alexoxy/santosdodia/pull/410) delivered E07.05 batch 26:

- represented Saint Paul VI as an independent canonical Person, Roman Catholic Recognition and Observance;
- added a perennial General Roman rule for the optional memorial on 29 May;
- bound the Portugal 2026 occurrence and MF rank to the exact SNL source row;
- used the Holy See decree of 25 January 2019 for General Roman identity, date and rank;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `d146a8fd3101468b992ac52c99d5fa10a561cfcc`.

Squash merge: `0685cb4993e58d8d30f39a0aeb7c2e6a49d65706`.

PR [#411](https://github.com/alexoxy/santosdodia/pull/411) corrected the post-merge dependency audit:

- GHSA-27r3-jxmh-p828 affected transitive `body-parser` 2.3.0;
- the lockfile now resolves `body-parser` 2.4.0 and `qs` 6.16.1;
- `npm audit --audit-level=high` reports zero vulnerabilities;
- Quality #1501 passed on the exact PR head and Quality #1502 passed on `main`.

Correction head: `8750454c530e110b07a611a52499df0ee1ebc95a`.

Correction merge: `37ce26ddda47b1275650336691bede7859b987e5`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **97** across **92 civil days**.
- Total source-bound coverage: **295/389 (75.835%)**.
- Remaining: **94 occurrences** and **76 civil days**.
- Source-bound days: **289/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 47 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **94** |

## CI, email and external proof

PR #410 workflows on the exact validated head:

- Quality #1499, run `40032965727`: success, 64 steps;
- Sanctorale review #69, run `40032965721`: success;
- Product BUILD #130, run `40032965818`: success;
- Product staging #126, run `40032965736`: success;
- Wikidata retry #647, run `40032965720`: success.

Local proof passed the full `npm run check`, focused canonical and Sanctorale tests, Cloudflare Free guards, local-only D1 tests and the AdSense fail-closed checker. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

The PR staging run produced GitHub artifact `12535682948`, digest `sha256:1348c19ac3968a9e45ddaab7eca36b5ae5db0af23fa4502f99658cb0f4cd29c9`. Dropbox stored `manifest.json`, `validation.json`, `localization-review.json` and `release.json` under the validated head folder; validation reports 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`. Its internal `sourceSha` remains the base `63ac4738...`; this discrepancy is recorded and is not presented as head provenance.

The first `main` Quality run and its retry failed after npm published a new high-severity advisory. The dependency-only PR #411 supplied the positive replacement runs. Both GitHub failure emails were read and moved to Trash only after Quality #1502 succeeded on `main`. A final search found no Cloudflare/D1 limit or error alert.

Dropbox proof:

- v32 JSON: `id:oANWCGUyYBwAAAAAAAAZLw`, SHA-256 `e58eaed163373d3937c636b0361ec165531b803cddfda60d66550416b882d6ee`, 327,507 bytes;
- v32 MD: `id:oANWCGUyYBwAAAAAAAAZMA`, SHA-256 `33eaf91915aef3c0cfdd95a6ade53dbb9b73f1cfbfb1ec1c1c71f06abc351797`, 170,435 bytes;
- batch-26 receipt: `id:oANWCGUyYBwAAAAAAAAZMQ`, SHA-256 `14bf687cb7a859eeacc48cfaeb96aef93a4b9a5120fbf2585741929fdb8199d0`, 3,638 bytes;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAZIQ`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAZIg`;
- staging release: `id:oANWCGUyYBwAAAAAAAAZIw`;
- staging localization review: `id:oANWCGUyYBwAAAAAAAAZJA`.

Issue #355 points to v32 and the batch-26 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PRs #410 and #411 were integrated only after checks passed on exact heads and expected bases.
- PR #410 is confined to the Saint Paul VI chain, reviewed evidence and exact coverage vectors; generated translation drift and lateral artifacts were excluded.
- PR #411 is confined to two transitive lockfile resolutions required by the advisory.
- After this checkpoint, no development PR remains open. Issue #355 is the single live execution record.
- Merged development branches were automatically deleted; no stale batch branch remains remotely.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, zero high audit findings, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 295/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 295-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A General Roman fixed date and rank may become a perennial rule only from competent universal evidence; Portugal 2026 remains a separate jurisdictional materialization.
- Optional memorials remain alternatives subject to precedence; a Saturday Marian optional memorial must not be silently discarded or merged.
- Names, translated labels and shared civil dates never create identity automatically.
- The staging receipt's internal base `sourceSha` must not be mistaken for the validated PR head even when the Dropbox path is head-scoped.
- The v1 daily-primary release and v2 occurrence reconciliation are different contracts and their counts must never be presented as equivalent.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StNorbert` on 6 June and prove identity, recognition, exact SNL occurrence, rank and scope from official sources.
2. Preserve any optional Saturday Marian commemoration as a distinct alternative and apply precedence only from competent canonical rules.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v32; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 26.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
