# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 15:30 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v48.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 311/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#444](https://github.com/alexoxy/santosdodia/pull/444) delivered E07.05 batch 42:

- represented Saint Jane Frances de Chantal as one canonical Person and Roman Catholic Recognition;
- created the General Roman optional-memorial Observance, perennial rule and Portugal 2026 occurrence for 12 August;
- bound identity, date and `MF` rank to competent official evidence;
- preserved the Visitation Order's proper solemnity as institute context without universalising or materialising it as a general Portugal rule;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `13a3ba6a51e2370a58023a4eac6fd72f739c2c67`.

Squash merge: `f74f00145565b60516e3ffb55c3d342d992bbb0b`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**.
- Fixed Sanctorale bindings: **113** across **106 civil dates**.
- Total source-bound coverage: **311/389 (79.949%)**.
- Remaining: **78 occurrences** and **64 wholly unbound civil days**.
- Source-bound days: **301/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 31 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **78** |

## CI, archive and external proof

PR #444 passed Product BUILD 40348488960, Product publish staging 40348488723, Quality 40348488825, Wikidata retry quality 40348489044 and Sanctorale review quality 40348488798 on the exact head. Focused tests, full local `npm run check`, the 84-page build, `git diff --check` and the AdSense fail-closed checker passed.

The post-merge workflow 40348862719 archived commit `f74f00145565b60516e3ffb55c3d342d992bbb0b` in Dropbox under:

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/f74f00145565b60516e3ffb55c3d342d992bbb0b`

| Artifact | Dropbox file | Bytes | SHA-256 |
|---|---|---:|---|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAacA` | 348687 | `d8669dcc72c42cd82f36f9cccbfb2467a4bb7bdf8a3d26e24292257df8502747` |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAacQ` | 1148 | `7a3ad98a26b44d5f6ec9bec9c51f5752b12e9a74fc78a840999e793c812c96e2` |
| `reconciliation-ledger.json` | `id:oANWCGUyYBwAAAAAAAAacg` | 524561 | `2aca0fb3bae7b46b52c43cce4ee98d4faf26f0083e632f44ed464add971f05e7` |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAacw` | 2406 | `1ffacda43e7d897f142ae05c447a47d6eeaf6c0b0a0f0c907c5077c6cc98d7a4` |

Validation reports the exact integrated `sourceSha`, 365 days, zero false-empty Today results and `productionApproved: false`.

Official proof:

- SNL 12 August 2026 lists “S. Joana Francisca de Chantal, religiosa – MF”;
- the SNL page explicitly distinguishes the Visitation Order's proper solemnity from the general-calendar optional memorial;
- Vatican News identifies Saint Jane Frances de Chantal as a religious and gives 12 August;
- institute rank was not universalised and no identity was inferred from translation alone.

Dropbox proof:

- v48 JSON: `id:oANWCGUyYBwAAAAAAAAaeQ`, SHA-256 `b9396f5586f3fa06d6a573cb4d7ba66989265516d2f7f1f1cddabc7ae47eb5a7`;
- v48 MD: `id:oANWCGUyYBwAAAAAAAAaeg`, SHA-256 `cfbe0147fdf5732eb20d489c192dd2de89dbffcdf009c97ba87b69e574745cba`;
- batch-42 JSON receipt: `id:oANWCGUyYBwAAAAAAAAaew`, SHA-256 `ff87c0b55269aa6aa4c1403fea58291d26cac76f2c962c691a711bd90749bb36`;
- batch-42 MD receipt: `id:oANWCGUyYBwAAAAAAAAafA`, SHA-256 `900844c98a85d884ffaa8732a219ea3e7a85d9bcb51bac31156412be090da384`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAaaA`, SHA-256 `45ab879c1c77711ea6a240b3afdb97c9d2773561f2ca2b2c077453561406bbef`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAaaQ`, SHA-256 `e1ba947dd5690906601e349f62fe0cb0b8b1d2b867291e8497960ca8b6dd6ec0`.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #444 was integrated only after all five checks passed on the exact head and main remained at the expected base.
- The batch is confined to Jane Frances de Chantal, exact official evidence, institute-context separation and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- The automatic post-merge archive workflow did not authorise production mutation.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 311/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 311-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A general Roman rank and an institute's proper rank are independent contexts; the latter cannot be universalised by shared identity or date.
- General Roman rule and Portugal annual occurrence remain separate.
- Names, translated labels and dates never create identity automatically.
- Green shadow CI never authorises production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StJohnEudes` on 19 August from competent official sources.
2. Continue remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
3. Resolve structural, proper, transfer and rank rows by competent-authority review.
4. Reach 389/389, explain annual differences and run multi-year regeneration.
5. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v48; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 42.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

