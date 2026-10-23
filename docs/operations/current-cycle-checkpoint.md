# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 20:16 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v30.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 293/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#406](https://github.com/alexoxy/santosdodia/pull/406) delivered E07.05 batch 24:

- represented Saint Joseph the Worker as a distinct canonical Observance;
- reused the existing `saint-joseph` Person and Roman Catholic Recognition instead of duplicating the person;
- bound the Portugal 2026 occurrence on 1 May and optional-memorial rank to the exact SNL source row;
- used direct SNL evidence for date/rank and direct Holy See evidence for same-person identity and the 1 May memorial;
- added an explicit review contract and tests for safe canonical identity reuse;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `ca5b93985ea6b85d51ee1ff41e391040072ce9c4`.

Squash merge: `56484ad0439c8e416928a0a93406603c44fe9061`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **95** across **90 civil days**.
- Total source-bound coverage: **293/389 (75.321%)**.
- Remaining: **96 occurrences** and **78 civil days**.
- Source-bound days: **287/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 49 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **96** |

## CI, email and external proof

PR #406 workflows on the exact validated head:

- Quality #1491, run `40017288815`: success;
- Sanctorale review #65, run `40017288811`: success;
- Product BUILD #126, run `40017288796`: success;
- Product staging #122, run `40017288779`: success;
- Wikidata retry #643, run `40017288797`: success.

Local proof passed focused Observance/Occurrence/Sanctorale tests, semantic inventory 293+96=389, 365/365 reconciliation, the complete data/test/lint sequence, `npm run build`, the AdSense fail-closed checker and `npm run cloudflare:build`. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

The PR staging run produced GitHub artifact `12529485545`, digest `sha256:91d9e4fabb768a15754f939cc70850e249f52abb289fc5448376478a9e3080e2`. Dropbox stored `manifest.json`, `validation.json`, `localization-review.json` and `release.json` under the exact validated head; validation reports 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`.

The initial and final non-Trash Gmail searches found no new SantosDia/GitHub/Cloudflare failure or quota alert. No mail was moved or deleted.

Dropbox proof:

- v30 JSON: `id:oANWCGUyYBwAAAAAAAAZBg`, SHA-256 `2725f310fe232e2a972bb507ed7044e49900e7d747559fbb96676e9f45ee20bb`, 323,257 bytes;
- v30 MD: `id:oANWCGUyYBwAAAAAAAAZCA`, SHA-256 `e71045a9001d3397c7261dc75f943ff2a8604502a9dbffaecb245444eb4c86e6`, 163,625 bytes;
- batch-24 receipt: `id:oANWCGUyYBwAAAAAAAAZBw`, SHA-256 `b9e3b4c731dd87b8c60a0134f37244180243a4715562166ec6aef32184fab244`, 2,749 bytes;
- staging localization review: `id:oANWCGUyYBwAAAAAAAAZAA`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAY_g`;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAY_Q`;
- staging release: `id:oANWCGUyYBwAAAAAAAAY_w`.

Issue #355 points to v30 and the batch-24 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #406 was integrated only after five workflows passed on the exact head and expected base.
- Its 16 files are confined to the Saint Joseph the Worker binding, identity-reuse contract and exact coverage vectors; generated translation drift and lateral artifacts were excluded.
- Zero open PRs remain. Issue #355 is the single live execution record.
- The merged development branch was automatically deleted; no stale batch branch remains remotely.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 293/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 293-source shadow | Full equivalence and production gate |
| Editorial/SEO/AdSense | Partial / gated | Text-first corpus and fail-closed checker | Factual/editorial acceptance |
| Global Church kernels | Pending / foundations | Independent context dimensions | Authority-specific kernels |
| Multilingual scale | Partial | Ten-locale technical gates | Evidence-based ranking and review |
| Autonomous maintenance | Partial | Monthly acquisition contracts | End-to-end rollover receipts |
| Final global product | Pending | Portugal quality anchor | All 32 deliverables accepted |

## Decisions and risks

- A finite, officially enumerated human group remains independent Person/Recognition subjects of a multi-person Observance.
- An officially attested unenumerated collective may be Observance-only with a stable key; it cannot manufacture anonymous people.
- An officially attested commemoration of named non-human beings may be Observance-only; it cannot coerce angels into the human Person/Recognition model.
- Multiple liturgical Observances may reuse one canonical Person and Church Recognition only with direct same-person evidence; titles and dates alone never authorize identity reuse.
- The v1 daily-primary release and v2 occurrence reconciliation are different contracts and their counts must never be presented as equivalent.
- Optional memorials remain subject to precedence. Green shadow CI never authorizes production.
- Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StChristopherMagallanes` on 21 May without trusting the provisional fixed-person classification; prove and enumerate any companions before choosing the canonical Observance model.
2. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
3. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
4. Reach 389/389, explain annual differences and run multi-year regeneration.
5. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v30; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 24.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
