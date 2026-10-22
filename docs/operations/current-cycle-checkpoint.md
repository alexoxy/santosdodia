# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-22 17:45 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-22-v19.{md,json}`

Status: active implementation; E07.04 is accepted; Portugal 2026 semantic reconciliation is 278/389; perennial cutover and every production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#384](https://github.com/alexoxy/santosdodia/pull/384) completed E07.04:

- added separate early and late Ordinary Time Saturday Marian perennial families;
- grounded the option in the Holy See GIRM 377–378;
- classified 32 Portugal 2026 candidates as 14 exact SNL rows and 18 explicit precedence suppressions;
- preserved every surviving row as `selectionMode: optional-alternative` and `obligatory: false`;
- exercised season boundaries, precedence and optionality in repository tests;
- advanced the shadow without treating suppressed candidates as coverage;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.
- corrected the newly surfaced OpenNext support-policy failure by moving Next.js from 15.5.28 to Active LTS 16.4.1 and adopting the required TypeScript JSX settings.

Validated head: `7b6e3a912a9a822bcdf86e067ba15c4c7a2c7167`.

Squash merge on `main`: `da13d117307f12d32b45d336ad47704ebbd4ad47`.

E07.04 is `CONCLUIDA`; E07.05 is now the first actionable task.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Explicit family suppressions/replacements: **180**; five rows remain withheld for jurisdiction review.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **278/389 (71.465%)**.
- Approved-source occurrences outside the canonical shadow: **111**.
- Source-bound civil days: **274/365**; unresolved civil days: **91**.
- Full semantic equivalence: `false`; perennial cutover and production promotion: `false`.

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 3 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **111** |

## CI, email and external proof

PR #384 workflows on the exact validated head:

- Quality #1444, run `39434366663`: success, 64 steps;
- Product BUILD #104, run `39434366704`: success;
- Product publish staging #100, run `39434366721`: success;
- Wikidata retry quality #619, run `39434366825`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build` on Next.js 16.4.1.

Checkpoint PR #385 initially passed 62 Quality steps and then failed at the Cloudflare build because OpenNext refused the now-expired Next.js 15.5.28 support window. The repository was moved to Next.js 16.4.1, supported by current Next.js and OpenNext policy; the complete local pipeline then passed. The remote rerun on the corrected head remains the merge gate; no unsupported-version override was used.

The fresh non-Trash Gmail search on 2026-10-22 for SantosDia failure, error and quota alerts returned zero messages. No email was moved or deleted.

Dropbox proof:

- receipt `santosdia-e07-04-saturday-marian-receipt-2026-10-22.json`, ID `id:oANWCGUyYBwAAAAAAAAYRg`;
- plan v19 JSON `id:oANWCGUyYBwAAAAAAAAYRQ` and Markdown `id:oANWCGUyYBwAAAAAAAAYRA`;
- staging folder keyed by validated head `7b6e3a912a9a822bcdf86e067ba15c4c7a2c7167`, ID `id:oANWCGUyYBwAAAAAAAAYNQ`;
- staging validation `id:oANWCGUyYBwAAAAAAAAYNw` and release `id:oANWCGUyYBwAAAAAAAAYOA`;
- staging release records 389 occurrences, 365 days, 1,945 labels and `productionApproved: false`;
- immutable approved source manifest remains preserved.

The v19 plan, Markdown and receipt were fetched back from Dropbox and parsed successfully.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- E07.04 was accepted in this execution.
- No task or deliverable was added or reopened.

## Repository hygiene

- PR #384 was integrated only after all four workflows passed on the exact head and `main` still matched the expected base.
- No implementation PR remains open. Issue #355 is the single live execution record and points to plan v19.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- The Next.js upgrade is limited to `package.json`, `package-lock.json` and the required `tsconfig.json` JSX/type-path settings; it introduces no production mutation.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.
- The implementation commit and squash merge remain recoverable through Git history.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 80 fixed anchors, 14 direct rules, 173 family members | Bind remaining 111 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 278-source shadow | Cut over only after full equivalence and production gate |
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
- E07.04 acceptance proves the optional Saturday Marian family, not the five withheld jurisdiction identities or full 389/389 equivalence.
- The staging archive is external-effect proof, not a public-cutover certificate.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Execute E07.05 in source-coherent batches: fixed saints, collective observances and Marian titles.
2. Keep identity, authority, rank and jurisdiction explicit; do not infer equivalence from labels or dates.
3. Resolve Portugal structural/proper/rank rows only through competent-authority review.
4. Complete E07.06 reconciliation, reach 389/389 and explain every annual difference.
5. Run multi-year regeneration and prepare an atomic cutover package, budget, receipts and rollback.
6. Request the specific production gate before any D1 mutation or deployment.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v19 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue from E07.05 without repeating E07.04.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
