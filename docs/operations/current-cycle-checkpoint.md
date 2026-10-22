# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-22 20:40 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-22-v21.{md,json}`

Status: active implementation; E07.05 is in progress; Portugal 2026 semantic reconciliation is 282/389; perennial cutover and every production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#388](https://github.com/alexoxy/santosdodia/pull/388) advanced E07.05 with collective Sanctorale batch 15:

- added separate Person and Recognition chains for Timothy of Ephesus, Titus of Crete, Cornelius Pope and Cyprian of Carthage;
- modelled 26 January and 16 September as two multi-person Observances instead of inventing collective Person identities;
- linked the collective Observances, perennial rules and Portugal 2026 occurrences to exact SNL rows and Vatican News identity evidence;
- distinguished liturgical rank `obligatory-memorial` from precedence class `general-obligatory-memorial`;
- extended the review-pack validator to accept singular and collective candidates without weakening identity checks;
- exercised manifest, review-pack, Sanctorale, coverage, semantic-inventory and reconciliation safeguards;
- advanced the shadow by two exact occurrence bindings and four canonical persons without inferring identity or universal applicability from names or dates;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `dbee19f444edc7f4e164c0a7bcbdc7b6d325d1ad`.

Squash merge on `main`: `0fba3c0095fc37e6379791bba24abf3e86342145`.

E07.05 remains `EM_CURSO`; the next actionable unit is another source-coherent fixed/collective/Marian classification batch.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Explicit family suppressions/replacements: **180**; five rows remain withheld for jurisdiction review.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **84** across 80 civil days.
- Total canonical migration coverage: **282/389 (72.494%)**.
- Approved-source occurrences outside the canonical shadow: **107**.
- Source-bound civil days: **278/365**; unresolved civil days: **87**.
- Full semantic equivalence: `false`; perennial cutover and production promotion: `false`.

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 3 |
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed collective observances | 10 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **107** |

## CI, email and external proof

PR #388 workflows on the exact validated head:

- Quality #1455, run `39849964128`: success, 64 steps;
- Product BUILD #108, run `39849964076`: success;
- Product publish staging #104, run `39849964107`: success;
- Wikidata retry quality #625, run `39849964077`: success;
- Sanctorale review quality #47, run `39849964133`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build` on Next.js 16.4.1.

The complete repository check, dependency audit and Cloudflare build passed locally. The existing dynamic-filesystem warning in `lib/litcal-mirror.ts` remains non-blocking and unchanged.

The old non-Trash Gmail alert for the first failed Quality run of PR #385 was read and diagnosed as the rejected Next.js 15/OpenNext combination. Corrective Quality #1448 on head `395ce3e6b63276b1d5f73107392ac67b7c817951` passed; only after that positive replacement proof was the message moved to Trash.

Dropbox proof:

- receipt `santosdia-e07-05-collective-sanctorale-batch-15-receipt-2026-10-22.json`, ID `id:oANWCGUyYBwAAAAAAAAYag`;
- plan v21 JSON `id:oANWCGUyYBwAAAAAAAAYaw` and Markdown `id:oANWCGUyYBwAAAAAAAAYaQ`;
- staging folder keyed by validated head `dbee19f444edc7f4e164c0a7bcbdc7b6d325d1ad`, ID `id:oANWCGUyYBwAAAAAAAAYWg`;
- staging validation `id:oANWCGUyYBwAAAAAAAAYXA` and release `id:oANWCGUyYBwAAAAAAAAYXQ`;
- staging release records 389 occurrences, 365 days, 1,945 labels and `productionApproved: false`;
- immutable approved source manifest remains preserved.

The v21 plan, Markdown and receipt were fetched back from Dropbox and parsed successfully. Plan hashes are `001548af858b598d4680e946df4d8add46095e8ad40fd9616bd39700d3c0fc5f` (JSON) and `ab4b73b7c1975426c01cfc44877606141613e54798487ae4ffc2483df46dc4bf` (Markdown).

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- E07.05 advanced but remains partial, so the formal countdown does not change.
- No task or deliverable was added or reopened.

## Repository hygiene

- PR #388 was integrated only after all five workflows passed on the exact head and `main` still matched the expected base.
- No implementation PR remains open. Issue #355 is the single live execution record and points to plan v21.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- This batch contains only source-bound Sanctorale records, review/promotion manifests and their safeguards; it introduces no production mutation.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.
- The implementation commit and squash merge remain recoverable through Git history.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 84 fixed anchors, 14 direct rules, 173 family members | Bind remaining 107 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 282-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- The Saturday Marian celebration is an optional alternative on permitted Saturdays, not a mandatory duplicate.
- Annual labels and dates do not create identities or perennial rules.
- Saints, memorials, feasts and solemnities remain explicit precedence outcomes; suppressed candidates are evidence, not coverage.
- Portugal rows for 4 February, 17 July, 17 August, 27 October and 6 November remain within the human-review boundary and cannot be promoted by textual similarity.
- This E07.05 batch proves four separate person identities and two collective observances, not the remaining collective observances, Marian titles, jurisdiction identities or full 389/389 equivalence.
- Collective labels never create a collective Person; each evidenced member keeps an independent identity and recognition, while the calendar celebration is an Observance with explicit participants.
- The staging archive is external-effect proof, not a public-cutover certificate.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Continue E07.05 in source-coherent batches: fixed saints, collective observances and Marian titles.
2. Keep identity, authority, rank and jurisdiction explicit; do not infer equivalence from labels or dates.
3. Resolve Portugal structural/proper/rank rows only through competent-authority review.
4. Complete E07.06 reconciliation, reach 389/389 and explain every annual difference.
5. Run multi-year regeneration and prepare an atomic cutover package, budget, receipts and rollback.
6. Request the specific production gate before any D1 mutation or deployment.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v21 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue E07.05 without repeating batches 14 or 15.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
