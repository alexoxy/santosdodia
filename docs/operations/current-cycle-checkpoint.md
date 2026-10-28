# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-28 08:06 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-28-v50.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 313/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#448](https://github.com/alexoxy/santosdodia/pull/448) delivered E07.05 batch 44:

- represented Saint Pius X as one canonical Person and Roman Catholic Recognition;
- created the General Roman obligatory-memorial Observance, perennial rule and Portugal 2026 occurrence for 21 August;
- bound identity, date and `MO` rank to competent official evidence;
- kept unrelated local observances printed on the same SNL page separate from Saint Pius X's rank and scope;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `f8fd2921f1f5220b946b1540183d2b23486c184a`.

Squash merge: `60d8c539b9cb7fdc9ca72b0a7aa1be2443619103`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**.
- Fixed Sanctorale bindings: **115** across **108 civil dates**.
- Total source-bound coverage: **313/389 (80.463%)**.
- Remaining: **76 occurrences** and **62 wholly unbound civil days**.
- Source-bound days: **303/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 29 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Temporal weekday family | 3 |
| Portugal rank overrides | 2 |
| Fixed collective observances | 0 |
| **Total** | **76** |

## CI, archive and external proof

PR #448 passed Product BUILD `40653444113`, Product publish staging `40653444118`, Quality `40653444120`, Wikidata retry quality `40653444198` and Sanctorale review quality `40653444272` on the exact head. Ten focused tests, full local `npm run check`, typecheck, lint, build, `git diff --check`, `npm audit --audit-level=high` and the AdSense fail-closed checker passed.

The post-merge workflows archived the exact integrated commit `60d8c539b9cb7fdc9ca72b0a7aa1be2443619103` in Dropbox.

### Daily product archive

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/60d8c539b9cb7fdc9ca72b0a7aa1be2443619103`

| Artifact | Dropbox file |
|---|---|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAanQ` |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAang` |
| `reconciliation-ledger.json` | `id:oANWCGUyYBwAAAAAAAAanw` |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAaoA` |

Validation workflow `40653683722` reports the exact `sourceSha`, 365 days, five complete locales, zero false-empty Today results and `productionApproved: false`.

### Portugal v2 archive

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/60d8c539b9cb7fdc9ca72b0a7aa1be2443619103`

| Artifact | Dropbox file |
|---|---|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAaog` |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAaow` |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAapA` |
| `localization-review.json` | `id:oANWCGUyYBwAAAAAAAAapQ` |

The v2 receipt reports exact `sourceSha`, 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`.

Official proof:

- SNL 21 August 2026 lists “S. Pio X, papa – MO”;
- Vatican News identifies Saint Pius X, Pope, and the 21 August commemoration;
- the Holy See identifies Pius X as the 257th Pope and Giuseppe Melchiorre Sarto;
- unrelated local notes on the SNL page were not converted into Saint Pius X attributes, proper ranks or scope.

Dropbox proof:

- v50 JSON: `id:oANWCGUyYBwAAAAAAAAapg`, SHA-256 `bc07ff67e951c33a8aaeffbe95e70818f89195875a415d60a574921f220b00ae`;
- v50 MD: `id:oANWCGUyYBwAAAAAAAAapw`, SHA-256 `2ffbca3853e7b0a990dccf84ddf8e65a1c8b904c07fd5a0d428df5b2df5d5e74`;
- batch-44 JSON receipt: `id:oANWCGUyYBwAAAAAAAAaqA`, SHA-256 `8097af3e34a1300923cc7a8d3ede1bb7dda6be87633786f589241b5b86ec8046`;
- batch-44 MD receipt: `id:oANWCGUyYBwAAAAAAAAaqQ`, SHA-256 `3c683bc37a0829b5be188f00e9d11e9873b6e8c2eeb831386b7ead2de0cbbdbd`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAalQ`, SHA-256 `e5c06f01d4822f08c4021f77e66ca0e7394c866e0d53305f46cc603d1fcaebae`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAalg`, SHA-256 `2dabc4266ffd986b85d22f6dfeab05b064f9955c11d0a1db6b2edcb2a371166b`.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #448 was integrated only after all five checks passed on the exact head and main remained at the expected base.
- The batch is confined to Saint Pius X, exact official evidence, local-context separation and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- Post-merge archives were inspected under the exact merge SHA; no duplicate archive was created.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean dependency audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 313/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 313-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- General Roman rule, Portugal annual occurrence and unrelated local observances are independent contexts.
- Marian titles reuse the canonical Person of Mary unless competent evidence proves a distinct subject; labels and dates never create identity.
- Green shadow CI never authorises production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:QueenshipMary` on 22 August from competent official sources without duplicating the canonical Person of Mary.
2. Continue remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
3. Resolve structural, proper, transfer and rank rows by competent-authority review.
4. Reach 389/389, explain annual differences and run multi-year regeneration.
5. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v50; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 44.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
