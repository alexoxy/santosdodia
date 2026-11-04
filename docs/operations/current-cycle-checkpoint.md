# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-11-04 11:31 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-11-04-v62.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 326/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#473](https://github.com/alexoxy/santosdodia/pull/473) delivered E07.05 batch 56:

- created canonical Persons and Roman Catholic Recognitions for Denis/Dinis of Paris, Rusticus/Rústico and Eleutherius/Eleutério;
- added one collective Observance, a perennial General Roman rule and Portugal 2026 Occurrence for 9 October;
- bound the exact SNL row `rc:StDenis` as an optional memorial (`MF`);
- preserved the Martirology roles of bishop, priest and deacon, recording but not inferring through a differing Vatican News wording;
- kept John Henry Newman and John Leonardi as independent same-day alternatives;
- kept publication and remote D1 fail-closed.

Validated head: `f4ff890457fd43a7bb9d425ea991de1d3f23efa3`; validated tree: `7506ba5c39172ef2dc901506238d33291045fd8e`.

Merge on `main`: `91ca331067379f0ee39e3892636c6b0a10bc79df`. The merged tree is exactly the validated tree.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **128** across **118** civil days.
- Total canonical migration coverage: **326/389 (83.805%)**.
- Approved-source occurrences outside the canonical shadow: **63**.
- Source-bound civil days: **311/365**.
- Civil days wholly without a source-bound canonical occurrence: **54**.
- Fixed-person backlog: **18**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

Denis, Rusticus and Eleutherius are three independently identified subjects in one General Roman optional memorial on 9 October. Translation and collective wording do not create or merge identities.

## CI and external proof

PR #473 workflows on the exact validated head:

- Product BUILD run `41819988799`: success;
- Product publish staging run `41819988713`: success;
- Quality run `41819988642`: success;
- Wikidata retry quality run `41819988641`: success;
- Sanctorale review quality run `41819988551`: success.

Local proof passed focused tests, `npm run check`, the mandatory AdSense fail-closed checker, `npm audit --audit-level=high` and `git diff --check`. The audit still reports 18 moderate transitive findings; the automatic forced fix is breaking and was not applied in this calendar batch.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAb2w`, SHA-256 `b91b69a251606b0934ff5cd7ad78f08b22fe2429be4ee94defe6bdd0d5b4dcca`;
- source MD `id:oANWCGUyYBwAAAAAAAAb3A`, SHA-256 `c0d00d88072cf6c776cf179e1839836d89a3b80df4a7a604326fa241cf9e4f4f`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAb3Q`, SHA-256 `239c96b1afcf726018168816bd0a21f028fdc4defc0dc42cf0ce6e662988e074`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAb3g`, SHA-256 `9b8450c6414c87b0e3af03222500fc5e005ecba614d4308487e9a45de3ed981e`;
- plan v62 JSON `id:oANWCGUyYBwAAAAAAAAb3w`, SHA-256 `9f6b5ad061b288eaff3b9a0e44f0133ae502593990b4c7b26601d53104fd4c9d`;
- plan v62 MD `id:oANWCGUyYBwAAAAAAAAb4A`, SHA-256 `06bf17880952ad2d7f4c74e2e6fff886d0e9b5840b45a1054f4938897ac2a044`.

Post-merge archive:

- ZIP `id:oANWCGUyYBwAAAAAAAAb1Q`, path `/Apps/SantosDia Orchestrator/current/product/archive-91ca331067379f0ee39e3892636c6b0a10bc79df.zip`;
- SHA-256 `6d1b0c053de22776a84b7aa43f5d8913f124cc6b3d0611ea3e45d3ed55a3eba3`;
- contains build, manifest, reconciliation ledger, release, release SQL and validation.

Staging artifact `13315878726` was archived only after tree equivalence was confirmed. Its workflow source `2ef59a145f9adb2d40454fb3c8defbd0f7177402`, validated head and final merge all have tree `7506ba5c39172ef2dc901506238d33291045fd8e`. The validation records 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #473 was integrated only after the exact head, tree and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StJohnHenryNewman` and `rc:StJohnLeonardi` on 9 October, preserving the two optional memorials as independent alternatives.
2. Publish patronages only where a competent authority proves the exact claim and context.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v62, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StJohnHenryNewman` and `rc:StJohnLeonardi`; do not repeat Denis and companions.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
