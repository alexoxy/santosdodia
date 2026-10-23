# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 18:35 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v27.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 290/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#400](https://github.com/alexoxy/santosdodia/pull/400) delivered E07.05 batch 21:

- preserved Paul Miki and twenty-five companions as twenty-six independent Person/Recognition identities;
- modelled 6 February as one collective multi-person Observance, with one Portugal 2026 Occurrence and one General Roman perennial rule;
- used the Portuguese National Secretariat for Liturgy for the finite official enumeration and local date/rank, with Vatican corroboration;
- avoided a collective Person and did not infer identity from translation or name similarity;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `fa5de0f2138e820859381de5b9626470bdd57ee0`.

Squash merge: `b31c722929b87f8475ba1efb7f1c7772436f3348`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Fixed Sanctorale bindings: **92** across **87 civil days**.
- Total source-bound coverage: **290/389 (74.550%)**.
- Remaining: **99 occurrences** and **81 civil days**.
- Source-bound days: **284/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Fixed collective observances | 2 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| **Total** | **99** |

## CI, email and external proof

PR #400 workflows on the exact validated head:

- Quality run `40003757281`: success, including 64-step smoke path;
- Sanctorale review #59, run `40003757431`: success;
- Product BUILD #120, run `40003757200`: success;
- Product staging #116, run `40003757027`: success;
- Wikidata retry #637, run `40003756985`: success.

Local proof passed focused Person/Recognition/Observance/Occurrence/Vault tests, Roman Sanctorale 92, semantic inventory 290+99=389, 365/365 reconciliation, full `npm run check`, zero production-dependency audit vulnerabilities, the AdSense fail-closed checker and `npm run cloudflare:build`. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

The staging artifact `12523242171` (`sha256:a0e9f6c088c27229864ff41dc62f504b0c3faf7038151f3b92b142defac071bf`, 381,037 bytes) and its Dropbox directory for the exact head confirmed 365/365 days, five complete locales, 1,945 labels, 389 approved-source occurrences and `productionApproved: false`.

The initial non-Trash Gmail search found no new SantosDia/GitHub/Cloudflare failure or quota alert. No mail was moved or deleted.

Dropbox proof, fetched after upload and matched byte for byte:

- v27 JSON: `id:oANWCGUyYBwAAAAAAAAY1Q`, SHA-256 `45e4f4364945bbdf7c8deb61179da3a86f693a35458cf63dc8f5f07821c1f3b5`, 317,463 bytes;
- v27 MD: `id:oANWCGUyYBwAAAAAAAAY1w`, SHA-256 `c08e15f3cb80db67b4820b050f23e4497857959a741ec302e13a79341efc6890`, 159,203 bytes;
- batch receipt: `id:oANWCGUyYBwAAAAAAAAY1g`, SHA-256 `215b4fb72e7958a7721f6b6d1eea60ab180d3bb99d7b44d24d45eac2abc106b3`, 2,063 bytes.

Issue #355 points to v27 and the batch-21 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #400 was integrated only after five workflows passed on the exact head.
- Its 23 files are confined to the batch; generated translation drift and lateral artifacts were excluded.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Issue #355 remains the single live execution record; no duplicate batch issue was created.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 290/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 290-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A collective celebration is an Observance linked to independent people, not a synthetic collective Person.
- The twenty-six-name source proof does not accept biographies, patronages or public navigation; editorial copy remains original and separately fact-checked.
- Optional memorials remain subject to precedence. Green shadow CI never authorizes production.
- The remaining Archangels row must not be forced into a human Person model.
- Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Continue E07.05 with the First Martyrs of the Church of Rome, without fabricating anonymous Person records.
2. Resolve Archangels only with an explicit non-human subject model or justified Observance-only representation.
3. Continue 50 fixed persons, 16 fixed/non-person observances and eight Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v27; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 21.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
