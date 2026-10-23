# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 00:08 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v25.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 288/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#396](https://github.com/alexoxy/santosdodia/pull/396) delivered E07.05 batch 19:

- preserved John de Brébeuf, Isaac Jogues, Gabriel Lalemant, Antoine Daniel, Charles Garnier, Noël Chabanel, René Goupil and Jean de la Lande as eight independent Person/Recognition identities;
- modelled 19 October as one collective multi-person Observance, with one Portugal 2026 Occurrence and one general-Roman perennial rule;
- used the Portuguese National Secretariat for Liturgy for local date/rank and Vatican News for the finite eight-person enumeration;
- avoided a collective Person and did not infer identity from translation or name similarity;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `999b7047af3f55813ce0f6960be005e7938763ea`.

Squash merge: `285b2b05dda523ba31a43d376edd86a8e906ac00`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Fixed Sanctorale bindings: **90** across **85 civil days**.
- Total source-bound coverage: **288/389 (74.036%)**.
- Remaining: **101 occurrences** and **83 civil days**.
- Source-bound days: **282/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 50 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Fixed collective observances | 4 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| **Total** | **101** |

## CI, email and external proof

PR #396 workflows on the exact validated head:

- Quality #1471, run `39875618283`: success;
- Sanctorale review #55, run `39875618288`: success;
- Product BUILD #116, run `39875618339`: success;
- Product staging #112, run `39875618308`: success;
- Wikidata retry #633, run `39875618404`: success.

Local proof passed focused identity/calendar tests, full `npm run check`, zero high audit vulnerabilities, the AdSense fail-closed checker and `npm run cloudflare:build`. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

The staging artifact `12467354009` (`sha256:658e006b9db0c329c7c7650dc16c5d2035dec6cba9e1216f3a167922950404ac`, 380,764 bytes) confirmed 365/365 days, five complete locales, zero false-empty days and `productionApproved: false`.

The initial non-Trash Gmail search found no new SantosDia/GitHub/Cloudflare failure or quota alert. No mail was moved or deleted.

Dropbox proof:

- v25 JSON: `id:oANWCGUyYBwAAAAAAAAYrA`, SHA-256 `33ba5952ef728b8756d2a4507a7aa693648e3b889ca8500a8ce5317715b812a0`;
- v25 MD: `id:oANWCGUyYBwAAAAAAAAYrg`, SHA-256 `a4dc2028c6f42920889afc4df153311f8e6bab8b70d3c1d66d55ffdc1ae50bf8`;
- batch receipt: `id:oANWCGUyYBwAAAAAAAAYrQ`, SHA-256 `f9bdc59ec06f5e5a1346f3376ee6407200777aadb18f9299b87042fbeef52c64`.

The JSON plan and receipt were fetched after upload and matched local SHA-256 hashes byte for byte. Issue #355 points to v25.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #396 was integrated only after five workflows passed on the exact head.
- Its 21 files are confined to the batch; generated translation drift and lateral artifacts were excluded.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Issue #355 remains the single live execution record; no duplicate batch issue was created.
- Evidence Vault, source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 288/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 288-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A collective celebration is an Observance linked to independent people, not a synthetic collective Person.
- The eight-name source proof does not accept biographies, patronages or public navigation; editorial copy remains original and separately fact-checked.
- Optional memorials remain subject to precedence. Green shadow CI never authorizes production.
- The remaining Archangels row must not be forced into a human Person model.
- Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Continue E07.05 with Paul Miki and companions, First Martyrs of Rome or Lawrence Ruiz and companions.
2. Resolve Archangels only with an explicit non-human subject model or justified Observance-only representation.
3. Continue 50 fixed persons, 16 fixed/non-person observances and eight Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v25; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 19.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

