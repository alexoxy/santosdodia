# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-11-04 12:06 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-11-04-v63.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 328/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#475](https://github.com/alexoxy/santosdodia/pull/475) delivered E07.05 batch 57:

- created canonical Persons and Roman Catholic Recognitions for John Henry Newman and John Leonardi;
- added independent Observances, perennial General Roman rules and Portugal 2026 Occurrences for both on 9 October;
- bound the exact SNL rows `rc:StJohnHenryNewman` and `rc:StJohnLeonardi` as optional memorials (`MF`);
- preserved Newman, Leonardi and the existing Denis/Rusticus/Eleutherius collective as three independent same-day alternatives;
- recorded Leonardi's pharmacist patronage claim for later editorial research without publishing it in this batch;
- kept publication and remote D1 fail-closed.

Validated head: `0d974f28f2e5f43cd06534c6f587ce71a997592a`; validated tree: `ccbef70919b70dd9643b8aeae502eb303b3e45bb`.

Merge on `main`: `ccb9a7c08bb80b3146024626206c4e099f60cba8`. The merged tree is exactly the validated tree.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **130** across **118** civil days.
- Total canonical migration coverage: **328/389 (84.319%)**.
- Approved-source occurrences outside the canonical shadow: **61**.
- Source-bound civil days: **311/365**.
- Civil days wholly without a source-bound canonical occurrence: **54**.
- Fixed-person backlog: **16**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

John Henry Newman and John Leonardi are independently identified subjects with separate General Roman optional memorials on 9 October. They are not merged with each other or with the collective Denis/Rusticus/Eleutherius memorial.

## CI and external proof

PR #475 workflows on the exact validated head:

- Product BUILD run `41824785546`: success;
- Product publish staging run `41824785451`: success;
- Quality run `41824785510`: success;
- Wikidata retry quality run `41824785391`: success;
- Sanctorale review quality run `41824785690`: success.

Local proof passed focused tests, `npm run check`, the mandatory AdSense fail-closed checker, `npm audit --audit-level=high` and `git diff --check`. The audit still reports 18 moderate transitive findings; the automatic forced fix is breaking and was not applied in this calendar batch.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAb4g`, SHA-256 `5db2330a59c0364a9f27255fb3aef050e0e146fa685904e8cdb50daa21908758`;
- source MD `id:oANWCGUyYBwAAAAAAAAb4Q`, SHA-256 `b4622e530304b1c93f6e6cb776a63c93db716f16a76199e6a988f8760f6681a0`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAb-Q`, SHA-256 `15b6126697d3b243ae00aa53a2710a83607d3056add86ebaed6e9ab8b948bbf5`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAb-A`, SHA-256 `f38653c3120638de57557a70627dcdf7fd42037936c6a8153661892a664a6b52`;
- plan v63 JSON `id:oANWCGUyYBwAAAAAAAAb-g`, SHA-256 `8cf42211dbdb4ede3eeee2137b0e9f4611b3604102ce4f468f6698191369727f`;
- plan v63 MD `id:oANWCGUyYBwAAAAAAAAb-w`, SHA-256 `9f06bac8c3315eca35257d2e9423ceffdd8b02a233d1cce305826ba97d590159`.

Post-merge archive:

- ZIP `id:oANWCGUyYBwAAAAAAAAb8g`, path `/Apps/SantosDia Orchestrator/current/product/archive-ccb9a7c08bb80b3146024626206c4e099f60cba8.zip`;
- SHA-256 `57b96806a84ae81b997622264e28dc0897fc01576198e21a8f010d8c41defd60`;
- contains build, manifest, reconciliation ledger, release, release SQL and validation.

Staging artifact `13318124412` was archived only after tree equivalence was confirmed. Its workflow source `6c28ae4e48ef127af5958e36d71c2193aea700ea`, validated head and final merge all have tree `ccbef70919b70dd9643b8aeae502eb303b3e45bb`. The validation records 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #475 was integrated only after the exact head, tree and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StCallistusIPope` on 14 October, confirming identity, recognition, grade and scope in competent official sources.
2. Publish patronages only where a competent authority proves the exact claim and context.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v63, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StCallistusIPope`; do not repeat Newman, Leonardi or Denis and companions.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
