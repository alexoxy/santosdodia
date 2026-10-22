# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-22 18:52 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-22-v20.{md,json}`

Status: active implementation; E07.05 is in progress; Portugal 2026 semantic reconciliation is 280/389; perennial cutover and every production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#386](https://github.com/alexoxy/santosdodia/pull/386) advanced E07.05 with fixed Sanctorale batch 14:

- added separate canonical chains for Saint Pancras on 12 May and Saint Augustine of Canterbury on 27 May;
- linked each identity, recognition, observance, perennial rule and Portugal 2026 occurrence to exact official calendar and biographical sources;
- kept Christopher Magallanes and Companions outside this individual-person batch because the competent source presents a collective observance;
- exercised manifest, review-pack, Sanctorale, coverage, semantic-inventory and reconciliation safeguards;
- advanced the shadow by two exact bindings without inferring identity or universal applicability from names or dates;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `a63defdf790d8e502837af90f23e9c1e98e27970`.

Squash merge on `main`: `ceda780579cc6f9f309392eb92f2aec43b1731b6`.

E07.05 remains `EM_CURSO`; the next actionable unit is another source-coherent fixed/collective/Marian classification batch.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Explicit family suppressions/replacements: **180**; five rows remain withheld for jurisdiction review.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **82** across 78 civil days.
- Total canonical migration coverage: **280/389 (71.979%)**.
- Approved-source occurrences outside the canonical shadow: **109**.
- Source-bound civil days: **276/365**; unresolved civil days: **89**.
- Full semantic equivalence: `false`; perennial cutover and production promotion: `false`.

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 3 |
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **109** |

## CI, email and external proof

PR #386 workflows on the exact validated head:

- Quality #1450, run `39833848075`: success, 64 steps;
- Product BUILD #106, run `39833848071`: success;
- Product publish staging #102, run `39833848161`: success;
- Wikidata retry quality #623, run `39833848243`: success;
- Sanctorale review quality #45, run `39833848073`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build` on Next.js 16.4.1.

The complete repository check, dependency audit and Cloudflare build passed locally. The existing dynamic-filesystem warning in `lib/litcal-mirror.ts` remains non-blocking and unchanged.

The fresh non-Trash Gmail search on 2026-10-22 for SantosDia failure, error and quota alerts returned zero messages. No email was moved or deleted.

Dropbox proof:

- receipt `santosdia-e07-05-fixed-sanctorale-batch-14-receipt-2026-10-22.json`, ID `id:oANWCGUyYBwAAAAAAAAYWA`;
- plan v20 JSON `id:oANWCGUyYBwAAAAAAAAYVg` and Markdown `id:oANWCGUyYBwAAAAAAAAYWQ`;
- staging folder keyed by validated head `a63defdf790d8e502837af90f23e9c1e98e27970`, ID `id:oANWCGUyYBwAAAAAAAAYSA`;
- staging validation `id:oANWCGUyYBwAAAAAAAAYSg` and release `id:oANWCGUyYBwAAAAAAAAYSw`;
- staging release records 389 occurrences, 365 days, 1,945 labels and `productionApproved: false`;
- immutable approved source manifest remains preserved.

The v20 plan, Markdown and receipt were fetched back from Dropbox and parsed successfully.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- E07.05 advanced but remains partial, so the formal countdown does not change.
- No task or deliverable was added or reopened.

## Repository hygiene

- PR #386 was integrated only after all five workflows passed on the exact head and `main` still matched the expected base.
- No implementation PR remains open. Issue #355 is the single live execution record and points to plan v20.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- This batch contains only source-bound Sanctorale records, review/promotion manifests and their safeguards; it introduces no production mutation.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.
- The implementation commit and squash merge remain recoverable through Git history.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 82 fixed anchors, 14 direct rules, 173 family members | Bind remaining 109 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 280-source shadow | Cut over only after full equivalence and production gate |
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
- This E07.05 batch proves two separate fixed-person chains, not the remaining collective observances, Marian titles, jurisdiction identities or full 389/389 equivalence.
- Christopher Magallanes and Companions must be modelled as a collective observance unless competent evidence separately establishes an individual calendar row.
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

- Read issue #355 and the Dropbox v20 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue E07.05 without repeating batch 14.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
