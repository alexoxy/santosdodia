# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 07:02 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v41.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 304/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#429](https://github.com/alexoxy/santosdodia/pull/429) delivered E07.05 batch 35:

- represented Saint Camillus de Lellis as an independent canonical Person, Roman Catholic Recognition and Observance;
- retained `priest` and `founder` as canonical titles without creating further identities;
- added a perennial General Roman rule for the optional memorial on 14 July;
- bound the Portugal 2026 occurrence and `MF` rank to the exact SNL source row;
- preserved `rc:StCamillusDeLellis` as a legacy bridge rather than a second identity;
- preserved patronage as evidence without automatically promoting a canonical patronage relation;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `57bbc5abd2f998532e3173cab0db12f41e09ba97`.

Squash merge: `e348766206d06320298170a1520dc58960c5a73c`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **106** across **100 civil dates**.
- Total source-bound coverage: **304/389 (78.149%)**.
- Remaining: **85 occurrences** and **70 civil days**.
- Source-bound days: **295/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 38 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **85** |

## CI, staging and external proof

PR #429 passed Product BUILD 150, Product publish staging 146, Quality 1539, Wikidata retry quality 668 and Sanctorale review quality 91 on the exact head. The full local `npm run check`, focused canonical reconciliation tests, dependency audit, Cloudflare Free guardrails and the AdSense fail-closed checker passed; the pre-existing Turbopack dynamic-filesystem warning remained non-fatal.

The Dropbox integrated-head archive stores `manifest.json`, `reconciliation-ledger.json`, `validation.json` and `release.json` under `e348766206d06320298170a1520dc58960c5a73c`. Validation records the exact integrated `sourceSha`, 365 days, five complete locales, zero false-empty Today cases and `productionApproved: false`.

Official proof:

- SNL 14 July 2026 lists Saint Camillus de Lellis as `MF`, an optional memorial;
- Vatican News identifies Saint Camillus de Lellis as priest and founder of the Ministers to the Sick;
- the Holy See attests his founding role and patronage, retained here as evidence only.

Dropbox proof:

- v41 JSON: `id:oANWCGUyYBwAAAAAAAAZ3A`, 342,095 bytes;
- v41 MD: `id:oANWCGUyYBwAAAAAAAAZ3Q`, 188,299 bytes;
- batch-35 JSON receipt: `id:oANWCGUyYBwAAAAAAAAZ3g`, 2,295 bytes;
- batch-35 MD receipt: `id:oANWCGUyYBwAAAAAAAAZ3w`, 1,225 bytes;
- integrated-head manifest: `id:oANWCGUyYBwAAAAAAAAZ0w`;
- integrated-head validation: `id:oANWCGUyYBwAAAAAAAAZ1A`;
- integrated-head reconciliation ledger: `id:oANWCGUyYBwAAAAAAAAZ1Q`;
- integrated-head release: `id:oANWCGUyYBwAAAAAAAAZ1g`.

Issue #355 is to point to v41 and the batch-35 receipt after this checkpoint merges.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #429 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to Saint Camillus de Lellis, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 304/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 304-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A General Roman fixed date and rank may become a perennial rule only from competent universal evidence; Portugal 2026 remains a separate jurisdictional materialization.
- Optional memorials remain explicit alternatives subject to precedence; no source row or translation may silently force celebration.
- Names, translated labels and shared civil dates never create identity automatically.
- Archive provenance must be checked directly; this batch's validation `sourceSha` exactly matches the integrated main commit.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StApollinaris` on 20 July and prove identity, recognition, exact SNL occurrence, rank and scope from competent sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v41; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 35.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
