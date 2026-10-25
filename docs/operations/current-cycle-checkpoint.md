# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-25 12:00 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-25-v39.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 302/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#425](https://github.com/alexoxy/santosdodia/pull/425) delivered E07.05 batch 33:

- represented Saint Augustine Zhao Rong as the named canonical Person and Roman Catholic Recognition;
- evolved Observance to v1.4 with an official bounded group of 119 companions that remains unmaterialized;
- prohibited anonymous Person creation while retaining the official group count and evidence;
- added a perennial General Roman rule for the optional memorial on 9 July;
- bound the Portugal 2026 occurrence and `MF` rank to the exact SNL source row;
- preserved `rc:StAugustineZhaoRong` as a legacy bridge rather than a second identity;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `ece625e8a21149371dcc56f26b090d0e1e811a08`.

Squash merge: `9858432133b23a88f92c81cee25d790e4acbf737`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **104** across **98 civil dates**.
- Total source-bound coverage: **302/389 (77.635%)**.
- Remaining: **87 occurrences** and **72 civil days**.
- Source-bound days: **293/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 40 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **87** |

## CI, staging and external proof

PR #425 passed Product BUILD 146, Product publish staging 142, Quality 1531, Wikidata retry quality 664 and Sanctorale review quality 87 on the exact head. The full local `npm run check`, focused canonical reconciliation tests and the AdSense fail-closed checker passed; the pre-existing Turbopack dynamic-filesystem warning remained non-fatal.

The Dropbox integrated-head archive stores `manifest.json`, `reconciliation-ledger.json`, `validation.json` and `release.json` under `9858432133b23a88f92c81cee25d790e4acbf737`. Validation records the exact integrated `sourceSha`, 365 days, five complete locales, zero false-empty Today cases and `productionApproved: false`.

Official proof:

- SNL 9 July 2026 lists Saints Augustine Zhao Rong, priest, and companions, martyrs, as `MF`, an optional memorial;
- Vatican News identifies Augustine as the first Chinese priest in the group and attests 120 martyrs;
- the Holy See canonization homily identifies Augustine Zhao Rong and his 119 companions.

Dropbox proof:

- v39 JSON: `id:oANWCGUyYBwAAAAAAAAZsg`, 338,881 bytes;
- v39 MD: `id:oANWCGUyYBwAAAAAAAAZsw`, 183,160 bytes;
- batch-33 JSON receipt: `id:oANWCGUyYBwAAAAAAAAZtA`, 2,276 bytes;
- batch-33 MD receipt: `id:oANWCGUyYBwAAAAAAAAZtQ`, 543 bytes;
- integrated-head manifest: `id:oANWCGUyYBwAAAAAAAAZqQ`;
- integrated-head validation: `id:oANWCGUyYBwAAAAAAAAZqg`;
- integrated-head reconciliation ledger: `id:oANWCGUyYBwAAAAAAAAZqw`;
- integrated-head release: `id:oANWCGUyYBwAAAAAAAAZrA`.

Issue #355 is to point to v39 and the batch-33 receipt after this checkpoint merges.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #425 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to Augustine Zhao Rong, the officially bounded companion group, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 302/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 302-source shadow | Full equivalence and production gate |
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

1. Review `rc:StHenry` on 13 July and prove identity, recognition, exact SNL occurrence, rank and scope from competent sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v39; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 33.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
