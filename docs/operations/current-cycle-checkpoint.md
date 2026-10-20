# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-20 13:15 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-20-v18.{md,json}`

Status: active implementation; E07.03 is accepted; Portugal 2026 semantic reconciliation is 264/389; perennial cutover and every production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#382](https://github.com/alexoxy/santosdodia/pull/382) completed E07.03:

- extended the perennial late Ordinary Time weekday family through weeks 31–34;
- reviewed 24 annual candidates against the immutable approved SNL source release;
- bound six exact ferial rows and recorded 17 explicit memorial, feast or solemnity precedence outcomes;
- withheld the 6 November Portugal jurisdiction overlay rather than treating Saint Nuno of Saint Mary as a universal ferial row;
- retained exclusive Pentecost/Advent bounds and backward-from-Advent week numbering;
- completed the week 1–34 candidate partition into exact source binding, explicit precedence or reviewed withholding;
- updated coverage, semantic inventory, reconciliation ledger, documentation and immutable receipt;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `b06fc57b3bf2af80b921bf6b3031f260b93d09cc`.

Squash merge on `main`: `e8f90830dc9c57ee052279ed737d0c070cfb420a`.

E07.03 is `CONCLUIDA`; E07.04 is now the first actionable task.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **159**.
- Explicit family suppressions/replacements: **162**; five rows remain withheld for jurisdiction review.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **264/389 (67.866%)**.
- Approved-source occurrences outside the canonical shadow: **125**.
- Source-bound civil days: **260/365**; unresolved civil days: **105**.
- Full semantic equivalence: `false`; perennial cutover and production promotion: `false`.

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 3 |
| Saturday Marian family | 14 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **125** |

## CI, email and external proof

PR #382 workflows on the exact validated head:

- Quality #1440, run `39427744361`: success, 64 steps;
- Product BUILD #102, run `39427744293`: success;
- Product publish staging #98, run `39427744294`: success;
- Wikidata retry quality #617, run `39427744291`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `npm run cloudflare:build`.

The initial non-Trash Gmail search for new SantosDia/GitHub/Cloudflare failure or quota alerts returned zero messages. A final repeat was temporarily rate-limited; no email was moved or deleted.

Dropbox proof:

- receipt `santosdia-e07-03-ordinary-time-weekdays-31-34-receipt-2026-10-20.json`, ID `id:oANWCGUyYBwAAAAAAAAYNA`;
- plan v18 JSON `id:oANWCGUyYBwAAAAAAAAYMg` and Markdown `id:oANWCGUyYBwAAAAAAAAYMw`;
- staging folder keyed by the validated head `b06fc57b3bf2af80b921bf6b3031f260b93d09cc`;
- staging release records 389 occurrences, 365 days, 1,945 labels and `productionApproved: false`;
- immutable approved source manifest `id:oANWCGUyYBwAAAAAAAAWmQ`.

The v18 plan and receipt were fetched back from Dropbox and parsed successfully. The receipt records the exact merge, CI, 24 reviewed candidates, updated coverage and zero remote-D1 writes.

## Task and deliverable countdown

- Tasks: **17 completed / 210; 193 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- E07.03 was accepted in this execution.
- No task or deliverable was added or reopened.

## Repository hygiene

- PR #382 was integrated only after all four workflows passed on the exact head and `main` still matched the expected base.
- The implementation branch was automatically removed after merge; commit, squash commit and recovery history remain available.
- No implementation PR remains open. Issue #355 remains the single live execution record and points to plan v18.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, media asset or second calendar path was introduced.
- The generated linguistic snapshot produced locally by validation was excluded from the commit.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability/security/hygiene | Realised core / continuous | Green CI, dependency audit, text-first and D1 guardrails | Continue source-level completeness and safe hygiene |
| P1 Roman perennial engine | Partial | Liturgical year, precedence/transfers, 80 fixed anchors, 14 direct rules, 159 family members | Bind remaining 125 occurrences and reach 389/389 |
| P2 calculator/API/ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS and snapshots | Prove parity after Portugal cutover |
| P3 Portugal daily product | Partial | Last-known-good public model plus 264-source shadow | Cut over only after full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance and explicit resubmission approval |
| Global Church kernels | Pending/partial foundations | Independent dimensions and reference engines | Authority-specific Catholic, Orthodox, Anglican, Coptic and later kernels |
| Multilingual scale | Partial | Ten-locale technical quality gates | Evidence-based language ranking and reviewed translations |
| Autonomous maintenance | Partial | Monthly acquisition contracts and guarded CI | End-to-end rollover/delta receipts without remote-write overrun |
| Final global product | Pending | Portugal is the quality anchor | Complete all 32 deliverables with published proof where required |

## Decisions and risks

- Late Ordinary Time weekday numbering is calculated backwards from Advent; it is not inferred from annual labels or copied dates.
- Saints, memorials, feasts and solemnities are explicit annual precedence outcomes; suppressed candidates are evidence, not coverage.
- Portugal rows for 4 February, 17 July, 17 August, 27 October and 6 November remain within the human-review boundary and cannot be promoted by textual similarity.
- E07.03 acceptance proves the Ordinary Time weekday partition, not the five withheld jurisdiction identities or full 389/389 equivalence.
- The staging archive is keyed by the PR head and is fail-closed; its validation payload retains the base source SHA, so it is external-effect proof, not a public-cutover certificate.
- A green shadow PR does not authorize production D1, deployment or public cutover.
- Other Churches retain their own computus, native calendar and competent sources; Roman semantics cannot be copied across traditions.

## Ordered roadmap

1. Execute E07.04: inventory and model the 14 Saturday Marian candidates as optional, precedence-sensitive outcomes, never mandatory duplicates.
2. Continue E07.05 with source-coherent fixed Sanctorale, collective and Marian-title batches.
3. Resolve remaining Portugal-specific structural/proper/rank rows only through competent-authority review.
4. Complete E07.06 reconciliation, reach 389/389 and explain every annual difference.
5. Run multi-year regeneration and prepare an atomic cutover package, budget, receipts and rollback.
6. Request the specific production gate before any D1 mutation or deployment.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and the Dropbox v18 plan, then verify GitHub, Gmail and Dropbox before new work.
- Keep one implementation batch active and continue from E07.04 without repeating E07.03.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
