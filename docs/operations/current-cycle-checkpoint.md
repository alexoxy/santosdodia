# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-23 21:07 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master record: issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-23-v31.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 reconciliation is 294/389; perennial cutover and production mutation remain fail-closed.

## Operating boundary

- The global strategy remains binding and cumulative until an explicitly approved normative replacement.
- First-party surfaces stay text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Rules, sources, receipts, history and rollback remain preserved.
- Cloudflare Free is normative; normal development and CI cannot write remote D1.
- AdSense, perennial publication and production mutation remain fail-closed.

## Completed in this execution

PR [#408](https://github.com/alexoxy/santosdodia/pull/408) delivered E07.05 batch 25:

- represented Saint Christopher Magallanes and twenty-four named companions as 25 independent canonical Persons and Roman Catholic Recognitions;
- represented their 21 May commemoration as one `multi-person-commemoration` Observance;
- bound the Portugal 2026 occurrence and optional-memorial rank to the exact SNL source row;
- used direct SNL evidence for the complete enumeration, date and rank, plus direct Holy See evidence for the collective canonization;
- preserved `publicationAllowed: false`, zero remote-D1 writes and no deployment.

Validated head: `0ad0a4a7f657949e16c74c3428c23419a39c4289`.

Squash merge: `8f05bbe667b2f964f2710d1354c3c1f6b474d367`.

E07.05 remains `EM_CURSO`; partial work does not reduce the task countdown.

## Portugal 2026 ledger

- Approved source: **389 occurrences**, **365 civil days**, **1,945 occurrence labels** in the v2 reconciliation contract.
- Fixed Sanctorale bindings: **96** across **91 civil days**.
- Total source-bound coverage: **294/389 (75.578%)**.
- Remaining: **95 occurrences** and **77 civil days**.
- Source-bound days: **288/365**.
- Full semantic equivalence, perennial cutover and production promotion: `false`.

| Unresolved family | Remaining |
|---|---:|
| Fixed individual persons | 48 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 13 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| Portugal transfer review | 2 |
| Temporal weekday family | 1 |
| Fixed collective observances | 0 |
| **Total** | **95** |

## CI, email and external proof

PR #408 workflows on the exact validated head:

- Quality #1495, run `40023563330`: success, 64 steps;
- Sanctorale review #67, run `40023563328`: success;
- Product BUILD #128, run `40023563268`: success;
- Product staging #124, run `40023563359`: success;
- Wikidata retry #645, run `40023563214`: success.

Local proof passed the full `npm run check`, focused canonical and Sanctorale tests and the AdSense fail-closed checker. The existing non-fatal Turbopack warning in `lib/litcal-mirror.ts` is unchanged.

The PR staging run produced GitHub artifact `12530744607`, digest `sha256:a87b52f558ab7364481adc7bc3483930c7560fc679d45a652ec1628460672af5`. Dropbox stored `manifest.json`, `validation.json`, `localization-review.json` and `release.json` under the validated head folder; validation reports 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and `productionApproved: false`. Its internal `sourceSha` remains the base `83b4946b...`; this discrepancy is recorded and is not presented as head provenance.

The initial and final non-Trash Gmail searches found no new SantosDia/GitHub/Cloudflare failure or quota alert. No mail was moved or deleted.

Dropbox proof:

- v31 JSON: `id:oANWCGUyYBwAAAAAAAAZHQ`, SHA-256 `f545424e0ca7df292d1eb3df99894fed7d674d386a358c3a3a45204ef78cf4a7`, 325,098 bytes;
- v31 MD: `id:oANWCGUyYBwAAAAAAAAZHg`, SHA-256 `9ddaa023722762f4acad0feb66e0a2b386b063834e160f5e6fa8efa74d0b7e12`, 166,935 bytes;
- batch-25 receipt: `id:oANWCGUyYBwAAAAAAAAZHw`, SHA-256 `1bd53b5ccd8323eaa528907f870de50a9480746750d7236071167d22bd18e638`, 2,306 bytes;
- staging localization review: `id:oANWCGUyYBwAAAAAAAAZEg`;
- staging validation: `id:oANWCGUyYBwAAAAAAAAZEA`;
- staging manifest: `id:oANWCGUyYBwAAAAAAAAZDw`;
- staging release: `id:oANWCGUyYBwAAAAAAAAZEQ`.

Issue #355 points to v31 and the batch-25 receipt.

## Countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Added tasks: **0**. Reopened tasks: **0**.
- E07.05 and E07 remain incomplete until all Portugal 2026 criteria pass.

## Repository hygiene

- PR #408 was integrated only after five workflows passed on the exact head and expected base.
- Its 21 files are confined to the 25-person collective binding, reviewed evidence and exact coverage vectors; generated translation drift and lateral artifacts were excluded.
- After this checkpoint, no development PR remains open. Issue #355 is the single live execution record.
- The merged development branch was automatically deleted; no stale batch branch remains remotely.
- No force push, history rewrite, production deletion, remote-D1 write, deploy, media asset or second calendar path was introduced.
- Evidence Vault, official-source artifacts, receipts and rollback history remain preserved.

## Strategic coverage matrix

| Product layer | Status | Proof | Remaining gate |
|---|---|---|---|
| P0 reliability/security | Realised core / continuous | Green CI, audit, text-first and D1 guards | Continue safe hygiene |
| P1 Roman perennial engine | Partial | 294/389 source-bound occurrences | Reach 389/389 |
| P2 calculator/API/ICS | Core / awaiting equivalence | Shared engine, OpenAPI, Y/Y+1 ICS | Prove parity after cutover |
| P3 Portugal daily product | Partial | Public baseline plus 294-source shadow | Full equivalence and production gate |
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
- The staging receipt's internal base `sourceSha` must not be mistaken for the validated PR head even when the Dropbox path is head-scoped.
- The v1 daily-primary release and v2 occurrence reconciliation are different contracts and their counts must never be presented as equivalent.
- Optional memorials remain subject to precedence. Green shadow CI never authorizes production.
- Other Churches retain their own computus, calendars and competent authorities.

## Ordered roadmap

1. Review `rc:StPaulVI` on 29 May and prove identity, recognition, exact SNL occurrence, rank and scope from official sources.
2. If that proof does not close, record the blocker and continue with `rc:StNorbert`.
3. Continue the remaining fixed persons, fixed/non-person observances and Marian titles in small reviewed batches.
4. Resolve remaining structural, proper, transfer and rank rows by competent-authority review.
5. Reach 389/389, explain annual differences and run multi-year regeneration.
6. Prepare cutover package, budget, receipts and rollback; request the production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then continue the global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox v31; verify GitHub, Gmail and Dropbox before new work.
- Keep one batch active and do not repeat batch 25.
- Never use CI or health checks to write remote D1.
- Do not delete an error email without a positive replacement run and external-effect proof.
- Do not merge checks from an outdated head/base.
- Do not publish shadow output or infer identity from text.
- Before any limit or stop, leave repository, issue, Dropbox plan and this checkpoint safely repeatable.
