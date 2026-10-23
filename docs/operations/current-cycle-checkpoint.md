# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 00:42 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v26.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 289/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#398](https://github.com/alexoxy/santosdodia/pull/398) delivered E07.05 batch 20:

- preserved Lourenço Ruiz and fifteen companions as sixteen independent Person/Recognition identities;
- modelled 28 September as one collective multi-person Observance, with one Portugal 2026 Occurrence and one general-Roman perennial rule;
- used the Portuguese National Secretariat for Liturgy for local date/rank and the Holy See for the finite sixteen-person enumeration;
- avoided a collective Person and did not infer identity from translation or name similarity;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `cd32041c4fff40fe00ff73d2a25aba43229cbc78`.

Squash merge: `32c796884332751535e397f5d20ffe41ba4103a3`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Fixed Sanctorale bindings: **91** across **86 civil days**.
- Total source-bound coverage: **289/389 (74.293%)**.
- Remaining: **100 occurrences** and **82 civil days**.
- Source-bound days: **283/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Fixed collective observances | 3 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| **Total** | **100** |

## CI, email and external proof

PR #398 workflows on the exact validated head:

- Quality #1475, run `39878567531`: success, including 64-step smoke path;
- Sanctorale review #57, run `39878567686`: success;
- Product BUILD #118, run `39878567539`: success;
- Product staging #114, run `39878567561`: success;
- Wikidata retry #635, run `39878567547`: success.

Local proof passed focused Person/Recognition/Observance/Occurrence/Vault tests, Roman Sanctorale 91, semantic inventory 289+100=389, 365/365 reconciliation, full `npm run check`, zero production-dependency audit vulnerabilities, the AdSense fail-closed checker and `npm run cloudflare:build`. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

The staging artifact `12469506563` (`sha256:f2486264badf6ac14c3de391edda81165045eff819db0b6559aff8cba1839252`, 380,889 bytes) confirmed 365/365 days, five complete locales, zero false-empty days, 389 approved-source occurrences and `productionApproved: false`.

The initial non-Trash Gmail search found no new SantosDia/GitHub/Cloudflare failure or quota alert. No mail was moved or deleted.

Dropbox proof, fetched after upload and matched byte for byte:

- v26 JSON: `id:oANWCGUyYBwAAAAAAAAYww`, SHA-256 `1fd795fc2bf93a2febda1dbbc0a27e01b927d737ab89a92077a61dc7bc9155f4`, 315,206 bytes;
- v26 MD: `id:oANWCGUyYBwAAAAAAAAYxA`, SHA-256 `d322bd774370e4219132253403b805b70e8769f88c10c824142f39a9f860d8eb`, 158,254 bytes;
- batch receipt: `id:oANWCGUyYBwAAAAAAAAYxQ`, SHA-256 `7aa8c54fd58897b03e2c6de1edbde806505a7cd290f7b551d10ccc2f62e902bf`, 2,773 bytes.

Issue #355 points to v26 and the batch-20 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #398 was integrated only after five workflows passed on the exact head.
- Its 21 files are confined to the batch; generated translation drift and lateral artifacts were excluded.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Issue #355 remains the single live execution record; no duplicate batch issue was created.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 289/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 289-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A collective celebration is an Observance linked to independent people, not a synthetic collective Person.
- The sixteen-name source proof does not accept biographies, patronages or public navigation; editorial copy remains original and separately fact-checked.
- Optional memorials remain subject to precedence. Green shadow CI never authorizes production.
- The remaining Archangels row must not be forced into a human Person model.
- Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Continue E07.05 with Paul Miki and companions or the First Martyrs of the Church of Rome.
2. Resolve Archangels only with an explicit non-human subject model or justified Observance-only representation.
3. Continue 50 fixed persons, 16 fixed/non-person observances and eight Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v26; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 20.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
