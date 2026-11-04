# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-11-04 10:22 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-11-04-v60.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 324/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#468](https://github.com/alexoxy/santosdodia/pull/468) delivered E07.05 batch 54:

- created the canonical Person and Roman Catholic Recognition for Saint Faustina Kowalska, virgin;
- added the Observance, perennial General Roman rule and Portugal 2026 Occurrence for 5 October;
- bound the exact SNL row `rc:StFaustinaKowalska` as an optional memorial (`MF`);
- preserved proper-calendar grades as contextual rather than universal;
- kept patronage outside this batch because no competent exact contextual claim was promoted;
- kept publication and remote D1 fail-closed.

Validated head: `a7ee030e8486e64e781ddf26b5f6c85e1492479c`; validated tree: `4acdb2ab7e22e438e9a77c2f8006281679e5a0f2`.

Merge on `main`: `1f90754dd935e8aeee5290998cafbd4596de8fb9`. The merged tree is exactly the validated tree.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **126** across **116** civil days.
- Total canonical migration coverage: **324/389 (83.290%)**.
- Approved-source occurrences outside the canonical shadow: **65**.
- Source-bound civil days: **309/365**.
- Civil days wholly without a source-bound canonical occurrence: **56**.
- Fixed-person backlog: **20**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

Saint Faustina Kowalska is the General Roman optional memorial on 5 October. Proper-calendar grades remain contextual; translations and local devotion do not create separate identities or universal patronage.

## CI and external proof

PR #468 workflows on the exact validated head:

- Product BUILD run `41812493476`: success;
- Product publish staging run `41812493488`: success;
- Quality run `41812493481`: success;
- Wikidata retry quality run `41812493555`: success;
- Sanctorale review quality run `41812493594`: success.

Local proof passed focused tests, `npm run check`, the mandatory AdSense fail-closed checker, `npm audit --audit-level=high` and `git diff --check`. The audit still reports 18 moderate transitive findings; the automatic forced fix is breaking and was not applied in this calendar batch.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAblA`, SHA-256 `0f29ebe50b0dfe7b62b39154fa939b120581969b4fe41d15fbbcb575546fb9df`;
- source MD `id:oANWCGUyYBwAAAAAAAAblQ`, SHA-256 `fe4e6fad36648a5cd3abf4222dbc84e9d6a84b13823e86648e2ccf8e6ee8e0cd`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAbrA`, SHA-256 `6172183baec2c91a95adf40665d32f314372f38974b069c702aa4f2b16a23b37`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAbrQ`, SHA-256 `9bd55efb357125590b715d9ff70b505196f1460c9d85236949b232199036aaf2`;
- plan v60 JSON `id:oANWCGUyYBwAAAAAAAAbrg`, SHA-256 `10f8d506745290f0b2c5cd5e35e5e55a2112df80a1475b3429bf959afc3415ef`;
- plan v60 MD `id:oANWCGUyYBwAAAAAAAAbrw`, SHA-256 `3fe24c7ae7e6c4f1b817fad28bcea7665f64524424f76380f70af080e69ce6aa`.

Post-merge archive:

`/Apps/SantosDia Orchestrator/current/product/archive-1f90754dd935e8aeee5290998cafbd4596de8fb9`

- build `id:oANWCGUyYBwAAAAAAAAboQ`, SHA-256 `22d4b661f20416d2bc19d0f5b847dc987ff4247e7253ae952fc00b54da115b31`;
- manifest `id:oANWCGUyYBwAAAAAAAAbow`, SHA-256 `377e4d5b2a5918b79055ff32bd89208d410aa73f18b8cc60372ea42c03559228`;
- reconciliation ledger `id:oANWCGUyYBwAAAAAAAAbog`, SHA-256 `e10e5f2e137133c56afaa55c4a77df6bb441cccb8d0aeb54a600f76e465606a9`;
- release `id:oANWCGUyYBwAAAAAAAAbpA`, SHA-256 `31f30788b535aa4c82c21df8d7585146cfba6341aee4d96b7d2cc0f65252839e`;
- validation `id:oANWCGUyYBwAAAAAAAAbpQ`, SHA-256 `da4d8da704a490b70c7c7688b5a6cbc8318cfb7a908bd2d3aba85d3384a10988`;
- release SQL `id:oANWCGUyYBwAAAAAAAAbpg`, SHA-256 `85a0b3faeb5250ef9b2a5a4614f196af49e3ab30fe0d32784df0353b506d89c2`.

Staging artifact `13312174850`, digest `sha256:bb5c890d3a9c5c6668a0d5b5a9ebdf2a946608a1f11fcb56700d2e7be72f6ba0`, was archived only after tree equivalence was confirmed. Its workflow source was GitHub's tentative merge `34c96f3b47630ef9da2d419f75be6dbf4a5e1197`, whose tree equals the final merged tree. The validation records 365 days, five complete locales, zero `falseEmptyToday`, `fullSemanticEquivalence=false`, `publicationAllowed=false` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #468 was integrated only after the exact head, tree and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- Unrelated Dependabot PR #430 remained outside this batch.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StBruno` on 6 October using competent official sources.
2. Publish patronages only where a competent authority proves the exact claim and context.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v60, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StBruno`; do not repeat Saint Faustina Kowalska.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
