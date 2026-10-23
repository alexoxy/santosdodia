# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 19:42 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v29.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 292/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#404](https://github.com/alexoxy/santosdodia/pull/404) delivered E07.05 batch 23:

- represented Saints Michael, Gabriel and Raphael as one canonical `angelic-commemoration` Observance;
- introduced Observance model v1.3 and a stable `subjectlessKey` for officially attested non-human commemorations;
- created no Person or Recognition record for the Archangels and rejected hidden or synthetic human identities;
- preserved the normal subject requirement for personal and finite multi-person commemorations;
- bound the Portugal 2026 occurrence on 29 September and feast rank to the exact SNL source row;
- used direct SNL and Holy See evidence for the celebration and the three named Archangels;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `e76bbd718e9ac90c67799302e7577c84d748dd65`.

Squash merge: `c597be9adbbca5b3d963f621b6bd224d5922868c`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **94** across **89 civil days**.
- Total source-bound coverage: **292/389 (75.064%)**.
- Remaining: **97 occurrences** and **79 civil days**.
- Source-bound days: **286/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **97** |

## CI, email and external proof

PR #404 workflows on the exact validated head:

- Quality #1487, run `40012509153`: success, 64 steps;
- Sanctorale review #63, run `40012509272`: success;
- Product BUILD #124, run `40012509057`: success;
- Product staging #120, run `40012509182`: success;
- Wikidata retry #641, run `40012509075`: success.

Local proof passed focused Observance/Occurrence/Sanctorale tests, semantic inventory 292+97=389, 365/365 reconciliation, full `npm run check`, the AdSense fail-closed checker and `npm run cloudflare:build`. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

Main-push Quality #1488 and Product staging #121 also passed on merge commit `c597be9a`. Dropbox archive workflow run `40012774778` stored `manifest.json`, `validation.json`, `reconciliation-ledger.json` and `release.json`; validation is `productionApproved: false`.

The archived v1 release contains **365 primary daily rows** and **1,825 labels**. This is the legacy one-primary-row-per-civil-day projection and must not be confused with, replace or reduce the v2 reconciliation denominator of 389 occurrences.

The initial and final non-Trash Gmail searches found no new SantosDia/GitHub/Cloudflare failure or quota alert. No mail was moved or deleted.

Dropbox proof:

- v29 JSON: `id:oANWCGUyYBwAAAAAAAAY-g`, SHA-256 `f95b0995dbd1307b29b7f9bf082aad1d5c5def08e1fef118a0b1f0a0738285cc`, 321,232 bytes;
- v29 MD: `id:oANWCGUyYBwAAAAAAAAY-Q`, SHA-256 `158d491c4ef51646fc11ce01ed57f8beaf28d38ed224d0fb54c51a27f6839285`, 162,053 bytes;
- batch receipt: `id:oANWCGUyYBwAAAAAAAAY-w`, SHA-256 `347f2a5446a4da45f87e811b06e0e0d0e7638ba42daac6fc97a7b58a6be092fa`, 2,279 bytes;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAY8A`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAY8Q`;
- staging reconciliation ledger: `id:oANWCGUyYBwAAAAAAAAY8g`;
- staging release: `id:oANWCGUyYBwAAAAAAAAY8w`.

Issue #355 points to v29 and the batch-23 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #404 was integrated only after five workflows passed on the exact head and expected base.
- Its 18 files are confined to the non-human Observance model and batch; generated translation drift and lateral artifacts were excluded.
- Zero open PRs remain. Issue #355 is the single live execution record.
- The merged development branch was automatically deleted; no stale batch branch remains remotely.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 292/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 292-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A finite, officially enumerated human group remains independent Person/Recognition subjects of a multi-person Observance.
- An officially attested unenumerated collective may be Observance-only with a stable key; it cannot manufacture anonymous people.
- An officially attested commemoration of named non-human beings may be Observance-only; it cannot coerce angels into the human Person/Recognition model.
- The v1 daily-primary release and v2 occurrence reconciliation are different contracts and their counts must never be presented as equivalent.
- Optional memorials remain subject to precedence. Green shadow CI never authorizes production.
- Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Continue E07.05 with Saint Joseph the Worker on 1 May, reusing the existing canonical Person only after official recognition, rank and exact SNL occurrence are proved.
2. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
3. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
4. Reach 389/389, explain annual differences and run multi-year regeneration.
5. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v29; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 23.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
