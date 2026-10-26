# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-26 14:55 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-26-v47.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 310/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#442](https://github.com/alexoxy/santosdodia/pull/442) delivered E07.05 batch 41:

- represented Sixtus II as one canonical Person and Roman Catholic Recognition;
- represented the official commemoration as a named Person with six companions, without fabricating anonymous Person records;
- created the General Roman optional-memorial rule and Portugal 2026 occurrence for 7 August;
- bound the occurrence, `MF` rank and group boundary to competent official evidence;
- preserved Saint Sixtus II and companions and Saint Cajetan as two independent same-day alternatives without inferred precedence;
- kept `publicationAllowed: false`, made zero remote-D1 writes and performed no manual deployment.

Validated head: `97bcad29837e6e04d0659537656d9ee074611e57`.

Squash merge: `806c947ca4c5e27e8b2721232dcbedfcafc16589`.

E07.05 remains `EM_CURSO`; partial coverage progress does not reduce the formal task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**.
- Fixed Sanctorale bindings: **112** across **105 civil dates**.
- Total source-bound coverage: **310/389 (79.692%)**.
- Remaining: **79 occurrences** and **65 wholly unbound civil days**.
- Source-bound days: **300/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 32 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **79** |

## CI, archive and external proof

PR #442 passed Product BUILD 40343089314, Product publish staging 40343089615, Quality 40343089286, Wikidata retry quality 40343089271 and Sanctorale review quality 40343089678 on the exact head. Focused tests, full local `npm run check`, build, dependency audit, `git diff --check` and the AdSense fail-closed checker passed.

The post-merge workflow archived commit `806c947ca4c5e27e8b2721232dcbedfcafc16589` in Dropbox under:

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/806c947ca4c5e27e8b2721232dcbedfcafc16589`

| Artifact | Dropbox file | Bytes |
|---|---|---:|
| `manifest.json` | `id:oANWCGUyYBwAAAAAAAAaWw` | 348687 |
| `validation.json` | `id:oANWCGUyYBwAAAAAAAAaXA` | 1148 |
| `reconciliation-ledger.json` | `id:oANWCGUyYBwAAAAAAAAaXQ` | 522864 |
| `release.json` | `id:oANWCGUyYBwAAAAAAAAaXg` | 2406 |

Validation SHA-256 is `a6cd4b1f3b6dc3b759fe8da0607e1beedc65108490125041aada21b7f948cda8`; release SHA-256 is `1cf9e50e8f8a1cd80798482b832e8c30bd50838316bacef0457c5a326e36c803`. Validation reports the exact integrated `sourceSha`, 365 days, zero false-empty Today results and `productionApproved: false`.

Official proof:

- SNL 7 August 2026 lists “Santos Sisto II, papa, e companheiros, mártires – MF”;
- the SNL martyrology explicitly bounds the group as four deacons martyred with Sixtus II plus Agapitus and Felicissimus on the same day;
- Vatican News identifies the official title and 7 August;
- no companion Person or precedence was inferred.

Dropbox proof:

- v47 JSON: `id:oANWCGUyYBwAAAAAAAAaZA`, SHA-256 `a23ff8c58eb5c23e9a2f8c8a15b32dd427cb3615d06be6d0c0977f51d224cea4`;
- v47 MD: `id:oANWCGUyYBwAAAAAAAAaZQ`, SHA-256 `3c65145e820292db5b624288a0909c5bb329f74e8dc15aa70c137e5804c3818a`;
- batch-41 JSON receipt: `id:oANWCGUyYBwAAAAAAAAaZw`, SHA-256 `571179735e4146154b6cdddbb8949a16dd6b1eb6cb91bf6fd0e9e36569ccc6ab`;
- batch-41 MD receipt: `id:oANWCGUyYBwAAAAAAAAaZg`, SHA-256 `93eebf0cbe619fff3a6f16550efcfa99bbc87fffcc548bd12de119575d52a22f`;
- source-evidence JSON: `id:oANWCGUyYBwAAAAAAAAaVA`, SHA-256 `946d0ab0d74ed8c6766efadf5b467047849bb69b991ddc0c1c80716eb288b818`;
- source-evidence MD: `id:oANWCGUyYBwAAAAAAAAaUw`, SHA-256 `abe72cddcb0dece5f8a8e48a183346cfb00ddcb01853b328bf0797e9c089a7b2`.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #442 was integrated only after checks passed on the exact head and expected base.
- The batch is confined to Sixtus II, the officially bounded companion group, exact source evidence and coverage vectors.
- No force push, history rewrite, production deletion, remote-D1 write, manual deploy, media asset or second calendar path was introduced.
- The automatic post-merge archive workflow did not authorize production mutation.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, clean npm audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 310/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 310-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A named saint requires independent Person and Church Recognition evidence before a calendar Observance can bind to it.
- A bounded companion group may remain one Observance without fabricating anonymous Persons.
- General Roman rule, Portugal annual occurrence and same-day alternatives remain separate; shared dates never imply precedence.
- Names, translated labels and dates never create identity automatically.
- Green shadow CI never authorizes production. Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StJaneFrancesDeChantal` on 12 August from competent official sources.
2. Continue remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
3. Resolve structural, proper, transfer and rank rows by competent-authority review.
4. Reach 389/389, explain annual differences and run multi-year regeneration.
5. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v47; verify GitHub and Dropbox before new work.
- Keep one batch active and do not repeat batch 41.
- Never use CI or health checks to write remote D1.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.

