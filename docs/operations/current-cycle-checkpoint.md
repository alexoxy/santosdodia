# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-28 07:20 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-28-v49.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 312/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#446](https://github.com/alexoxy/santosdodia/pull/446) delivered E07.05 batch 43:

- represented Saint John Eudes as one canonical Person and Roman Catholic Recognition;
- created the General Roman optional-memorial Observance, perennial rule and Portugal 2026 occurrence for 19 August;
- bound identity, date and `MF` rank to competent official evidence;
- preserved the Good Shepherd congregation's proper solemnity and the Priests of the Sacred Heart congregation's obligatory memorial as institute contexts without universalising or materialising either as a general Portugal rule;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `9705f1d824395acde180f205382f56048aa9b356`.

Squash merge: `5c1df1fcc0c4a012cc7088676a3e381dea495cc2`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**.
- Fixed Sanctorale bindings: **114** across **107 civil dates**.
- Total source-bound coverage: **312/389 (80.206%)**.
- Remaining: **77 occurrences** and **63 wholly unbound civil days**.
- Source-bound days: **302/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 30 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Temporal weekday family | 3 |
| Portugal rank overrides | 2 |
| Fixed collective observances | 0 |
| **Total** | **77** |

## CI, archive and external proof

PR #446 passed Product BUILD `40352971231`, Product publish staging `40352971217`, Quality `40352971389`, Wikidata retry quality `40352971234` and Sanctorale review quality `40352971171` on the exact head. Ten focused tests, full local `npm run check`, typecheck, lint, build, `git diff --check` and the AdSense fail-closed checker passed.

The post-merge workflows archived the exact integrated commit `5c1df1fcc0c4a012cc7088676a3e381dea495cc2` in Dropbox.

### Daily product archive

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/5c1df1fcc0c4a012cc7088676a3e381dea495cc2`

| Artifact | Dropbox file | SHA-256 |
|---|---|---|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAahQ` | `27178d705a618101e28bcbf441709e3c8472ed94c2d63ad487d998f004f35214` |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAahg` | `9abd6ade8950f8b69b8884de2ffed3ffed18f196cbdd31ff930b513b4f8fc8d2` |
| `reconciliation-ledger.json` | `id:oANWCGUyYBwAAAAAAAAahw` | `ab75d9a99a941bfacf3c2a3342793544a20327cb2a61e5efceb2f822f6e1dadd` |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAaiA` | `bbd50c920200ae423f635d6ee77db5280c45b9116b6d9749fb59e249c90e9f23` |

Validation workflow `40353356511` reports exact `sourceSha`, 365 days, zero false-empty Today results and `productionApproved: false`.

### Portugal v2 archive

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/5c1df1fcc0c4a012cc7088676a3e381dea495cc2`

| Artifact | Dropbox file | SHA-256 |
|---|---|---|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAaig` | `adc727396c6996b3b111f98f68a7b0078415cee46fc62b7baa5b8024e0a58c02` |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAaiw` | `c9eb5c983421e750146dfa7c1573ce6109cbae8abb972d6d0e48015e27b118b6` |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAajA` | `01d9a90dba0f4e86dff55bb2a2ce07287c376fec9353533cbad75f792516791e` |
| `localization-review.json` | `id:oANWCGUyYBwAAAAAAAAajQ` | `54d4bfa512c4efda859998d1ac47b464aa646383b84433e9e4535dcaa7ac72be` |

The v2 receipt reports exact `sourceSha`, 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`.

Official proof:

- SNL 19 August 2026 lists “S. João Eudes, presbítero – MF”;
- the SNL page explicitly distinguishes two institute-proper ranks from the general-calendar optional memorial;
- Vatican News and the Holy See identify Saint John Eudes as priest and founder;
- institute ranks were not universalised and no identity was inferred from translation alone.

Dropbox proof:

- v49 JSON: `id:oANWCGUyYBwAAAAAAAAakw`, SHA-256 `527a9bf1e2b484e3c82cc4f914b6ffdf1fd560e8fb54d4976029029632ad8e78`;
- v49 MD: `id:oANWCGUyYBwAAAAAAAAalA`, SHA-256 `05e29cfe11904454ebae13288be4b6a2233151eb49ba17276cc6a753f66775fe`;
- batch-43 JSON receipt: `id:oANWCGUyYBwAAAAAAAAakQ`, SHA-256 `d4ffa59ade331758721b00877ab4b5cd6123c709ef0095df0feade3c0fbc59c7`;
- batch-43 MD receipt: `id:oANWCGUyYBwAAAAAAAAakg`, SHA-256 `9a942943e048727b9bac638c66f51df0a286b497267471be9d0c3cd4d393f69c`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAafQ`, SHA-256 `8666192a4d48e1c94922e780f59ae51888d3a860541169ec67837ed3ab4bc2b5`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAafg`, SHA-256 `1bde76a0066ab9c5d89e644129485853fd53635219d2a097db18086546ca6ea4`.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #446 was integrated only after all five checks passed on the exact head and main remained at the expected base.
- The batch is confined to John Eudes, exact official evidence, institute-context separation and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- Post-merge archives were inspected and hashed; no duplicate archive was created.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean dependency audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 312/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 312-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A general Roman rank and an institute's proper rank are independent contexts; neither institute rank can be universalised by shared identity or date.
- General Roman rule and Portugal annual occurrence remain separate.
- Names, translated labels and dates never create identity automatically.
- Green shadow CI never authorises production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StPiusX` on 21 August from competent official sources.
2. Continue remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
3. Resolve structural, proper, transfer and rank rows by competent-authority review.
4. Reach 389/389, explain annual differences and run multi-year regeneration.
5. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v49; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 43.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

