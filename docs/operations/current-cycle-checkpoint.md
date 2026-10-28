# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-28 09:08 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-28-v51.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 314/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#450](https://github.com/alexoxy/santosdodia/pull/450) delivered E07.05 batch 45:

- reused the canonical Person of Mary and its Roman Catholic Recognition without creating a duplicate identity;
- created a distinct Marian-title Observance, General Roman obligatory-memorial rule and Portugal 2026 occurrence for 22 August;
- bound title, date and `MO` rank to competent official evidence;
- kept the Bragança-Miranda, Carmelite and institute proper contexts separate from the General Roman rule;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `354bbf21c58d9fd6c99e3badee8274879604ab5a`.

Squash merge: `0dda11cab1090533a894829e1288d9b9eb19e7f9`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**.
- Fixed Sanctorale bindings: **116** across **109 civil dates**.
- Total source-bound coverage: **314/389 (80.720%)**.
- Remaining: **75 occurrences** and **61 wholly unbound civil days**.
- Source-bound days: **304/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 29 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 7 |
| Portugal proper identities | 5 |
| Temporal weekday family | 3 |
| Portugal rank overrides | 2 |
| Fixed collective observances | 0 |
| **Total** | **75** |

## CI, archive and external proof

PR #450 passed Product BUILD `40660714674`, Product publish staging `40660714730`, Quality `40660714708`, Wikidata retry quality `40660714672` and Sanctorale review quality `40660714855` on the exact head. Focused tests, full local `npm run check`, typecheck, lint, build, `git diff --check`, `npm audit --audit-level=high` and the AdSense fail-closed checker passed.

Post-merge workflow `40660932589` archived the exact integrated commit `0dda11cab1090533a894829e1288d9b9eb19e7f9` in Dropbox.

### Daily product archive

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/0dda11cab1090533a894829e1288d9b9eb19e7f9`

| Artifact | Dropbox file |
|---|---|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAasg` |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAasw` |
| `reconciliation-ledger.json` | `id:oANWCGUyYBwAAAAAAAAatA` |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAatQ` |

Validation workflow `40660932589` reports the exact `sourceSha`, 365 days, five complete locales, zero false-empty Today results and `productionApproved: false`.

### Portugal v2 archive

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/0dda11cab1090533a894829e1288d9b9eb19e7f9`

| Artifact | Dropbox file |
|---|---|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAatw` |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAauA` |

The v2 receipt reports exact `sourceSha`, 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`.

Official proof:

- SNL 22 August 2026 lists “Virgem santa Maria, Rainha – MO”;
- the Holy See identifies the 22 August memorial of the Blessed Virgin Mary invoked as Queen;
- the Marian title reuses the canonical Person of Mary instead of creating an identity from a translated title;
- proper diocesan, Carmelite and institute observances on the same SNL page were not converted into a universal rule.

Dropbox proof:

- v51 JSON: `id:oANWCGUyYBwAAAAAAAAauw`, SHA-256 `0aec0b440111156ce618e7e653051e905b54045ce37b5589111cee194e3a3f0a`;
- v51 MD: `id:oANWCGUyYBwAAAAAAAAavA`, SHA-256 `aeb379553ef1365b8bfcc3c7a9f42df55b5189be30007481eb5b18cca0a4796c`;
- batch-45 JSON receipt: `id:oANWCGUyYBwAAAAAAAAavQ`, SHA-256 `4d0ed8e103fa71ca044384045fda8c48b3ad023764727186ba9161ec235f07e7`;
- batch-45 MD receipt: `id:oANWCGUyYBwAAAAAAAAavg`, SHA-256 `1084c04539cba13470f6851a5238b8767ef6f8dad5ac9db3ac6c1ce9883bf62c`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAaqg`, SHA-256 `b3ae74332cba8953a2b35970f52966090900e11a377e98a05bd89e08afafff42`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAaqw`, SHA-256 `a9348f6b27b7ed48980d24406fb3e841709e523722493d9d7197d26c35c0117a`.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #450 was integrated only after all five checks passed on the exact head and main remained at the expected base.
- The batch is confined to Maria Rainha, exact official evidence, proper-context separation and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- Post-merge archives were inspected under the exact merge SHA; no duplicate archive was created.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean dependency audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 314/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 314-source shadow | Full equivalence and production gate |
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

1. Review `rc:StJosephCalasanz` on 25 August from competent official sources while preserving `rc:StLouis` as an independent alternative on the same date.
2. Continue remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
3. Resolve structural, proper, transfer and rank rows by competent-authority review.
4. Reach 389/389, explain annual differences and run multi-year regeneration.
5. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v51; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 45.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
