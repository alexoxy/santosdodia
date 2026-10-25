# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-25 09:51 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-25-v37.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 300/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#421](https://github.com/alexoxy/santosdodia/pull/421) delivered E07.05 batch 31:

- represented Saint Cyril of Alexandria as an independent canonical Person, Roman Catholic Recognition and Observance;
- added a perennial General Roman rule for the optional memorial on 27 June;
- bound the Portugal 2026 occurrence and `MF` rank to the exact SNL source row;
- preserved Saint Cyril and the Saturday Marian memorial as distinct optional alternatives on the same civil date;
- preserved `rc:StCyrilAlexandria` as a legacy bridge rather than a second identity;
- used competent official sources for identity, date, rank and scope;
- kept `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `4aae6175878790ca04bc58f026ea49073dc58013`.

Squash merge: `42a7bc1971b3981bdf6095ee5c61ab7e56432a14`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **102** across **96 civil dates**.
- Total source-bound coverage: **300/389 (77.121%)**.
- Remaining: **89 occurrences** and **74 civil days**.
- Source-bound days: **291/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 42 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **89** |

## CI, staging and external proof

PR #421 passed Product BUILD 142, Product publish staging 138, Quality 1523, Wikidata retry quality 660 and Sanctorale review quality 81 on the exact head. The full local `npm run check`, focused canonical reconciliation tests, Cloudflare Free guardrails and the AdSense fail-closed checker passed; the pre-existing Turbopack dynamic-filesystem warning remained non-fatal.

The Dropbox head archive stores `manifest.json`, `validation.json`, `localization-review.json` and `release.json` under `4aae6175878790ca04bc58f026ea49073dc58013`. Validation reports 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`. Its internal `sourceSha` remains the base `c67e97b8b4b44f8421380649f1dbf578429c3aec`; this is recorded and is not presented as head provenance.

Official proof:

- SNL 27 June 2026 lists Saint Cyril of Alexandria, bishop and Doctor of the Church, as `MF`, an optional memorial, alongside the Saturday Marian optional memorial;
- Vatican News and the Holy See identify Saint Cyril as Bishop of Alexandria and Doctor of the Church.

Dropbox proof:

- v37 JSON: `id:oANWCGUyYBwAAAAAAAAZjg`, 335,761 bytes;
- v37 MD: `id:oANWCGUyYBwAAAAAAAAZjw`, 179,761 bytes;
- batch-31 receipt: `id:oANWCGUyYBwAAAAAAAAZkA`, 3,550 bytes;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAZgA`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAZgQ`;
- staging release: `id:oANWCGUyYBwAAAAAAAAZgg`;
- staging localization review: `id:oANWCGUyYBwAAAAAAAAZgw`.

Issue #355 points to v37 and the batch-31 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #421 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to the Saint Cyril of Alexandria chain, exact official evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 300/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 300-source shadow | Full equivalence and production gate |
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
- The staging receipt's internal base `sourceSha` must not be mistaken for the validated PR head even when the Dropbox path is head-scoped.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StMariaGoretti` on 6 July and prove identity, recognition, exact SNL occurrence, rank and scope from official sources.
2. Keep the perennial General Roman rule separate from the Portugal 2026 materialization.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v37; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 31.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
