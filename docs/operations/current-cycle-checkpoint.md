# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-22 21:11 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-22-v22.{md,json}`

Status: active implementation; E07.05 is in progress; Portugal 2026 semantic reconciliation is 284/389; perennial cutover and every production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#390](https://github.com/alexoxy/santosdodia/pull/390) advanced E07.05 with collective Sanctorale batch 16:

- added separate Person and Recognition chains for Nereus, Achilleus, Marcellinus and Peter;
- modelled 12 May and 2 June as two multi-person Observances instead of inventing collective Person identities;
- linked the collective Observances, perennial rules and Portugal 2026 occurrences to exact SNL rows and Vatican News identity evidence;
- preserved Saint Pancras and Nereus/Achilleus as two explicit optional choices on 12 May, without arbitrary winner selection;
- exercised Person, Recognition, Observance, Occurrence, review-pack, Sanctorale, coverage, inventory and ledger safeguards;
- advanced the shadow by two exact occurrence bindings and four canonical persons;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `0f592ae3532bae0b66bff62fc0422e3fea371ccc`.

Squash merge on `main`: `195c422695e8a7ae935b2441ab8c0306573151ed`.

E07.05 remains `EM_CURSO`; the next actionable unit is another source-coherent fixed/collective/Marian classification batch.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Explicit family suppressions/replacements: **180**; five rows remain withheld for jurisdiction review.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **86** across 81 civil days.
- Total canonical migration coverage: **284/389 (73.008%)**.
- Approved-source occurrences outside the canonical shadow: **105**.
- Source-bound civil days: **279/365**; unresolved civil days: **86**.
- Full semantic equivalence: `false`; perennial cutover and production promotion: `false`.

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 3 |
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed collective observances | 8 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **105** |

## CI, email and external proof

PR #390 workflows on the exact validated head:

- Quality #1459, run `39854115039`: success, 64 steps;
- Product BUILD #110, run `39854114975`: success;
- Product publish staging #106, run `39854115006`: success;
- Wikidata retry quality #627, run `39854114957`: success;
- Sanctorale review quality #49, run `39854114988`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build` on Next.js 16.4.1. The existing dynamic-filesystem warning in `lib/litcal-mirror.ts` remains non-blocking and unchanged.

Gmail had no new SantosDia failure, quota or run-failed messages outside Trash at the start of the execution. No email was deleted in this execution.

External proof:

- staging artifact `12459066492`, digest `sha256:709d2314c0bc45e1557fe3b9e943bab6620862659b448565d0f25123dd6827cf`;
- staging validation SHA-256 `ceee933d98b0916868e6d9b37ce8e09c1720c2141458e0c21ffc35c614b49525`;
- validation confirms 365 days, five complete locales, zero false-empty Today results and `productionApproved: false`;
- Dropbox receipt `santosdia-e07-05-sanctorale-batch-16-receipt-2026-10-22.json`, ID `id:oANWCGUyYBwAAAAAAAAYew`;
- Dropbox plan v22 JSON `id:oANWCGUyYBwAAAAAAAAYfQ` and Markdown `id:oANWCGUyYBwAAAAAAAAYfA`;
- plan hashes: `0dcda47799d891c627fc231bf6f9b64323da16688299aa0e0b07b9954c688194` (JSON) and `2e6ac79a99ab766db97e4c521d8f4653ec3aa218861444a7188900b990f39f16` (Markdown);
- receipt was fetched back from Dropbox and parsed successfully.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- E07.05 advanced but remains partial, so the formal countdown does not change.
- No task or deliverable was added or reopened.

## Repository hygiene

- PR #390 was integrated only after all five workflows passed on the exact head and `main` still matched the expected base.
- No implementation PR remains open. Issue #355 is the single live execution record and points to plan v22.
- The batch branch is eligible for automatic deletion; evidence remains recoverable through Git history, Dropbox and the GitHub artifact.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 86 fixed anchors, 14 direct rules, 173 family members | Bind remaining 105 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 284-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- Annual labels and dates do not create identities or perennial rules.
- Collective labels never create a collective Person; each evidenced member keeps an independent identity and recognition.
- Optional memorials sharing one civil date remain explicit choices and do not receive an arbitrary winner.
- Portugal rows for 4 February, 17 July, 17 August, 27 October and 6 November remain within the human-review boundary.
- This batch proves four separate person identities and two collective observances, not the remaining collectives, Marian titles, jurisdiction identities or full equivalence.
- A green shadow PR or staging artifact does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Continue E07.05 in source-coherent batches; remaining backlog includes 8 collective occurrences, 50 fixed persons, 16 fixed/non-person observances and 8 Marian titles.
2. Keep identity, authority, rank and jurisdiction explicit; do not infer equivalence from labels or dates.
3. Resolve Portugal structural/proper/rank rows only through competent-authority review.
4. Complete E07.06 reconciliation, reach 389/389 and explain every annual difference.
5. Run multi-year regeneration and prepare an atomic cutover package, budget, receipts and rollback.
6. Request the specific production gate before any D1 mutation or deployment.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v22 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue E07.05 without repeating batches 14, 15 or 16.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
