# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-28 12:45 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-28-v54.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 317/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#456](https://github.com/alexoxy/santosdodia/pull/456) delivered E07.05 batch 48:

- reused the canonical John the Baptist Person and Roman Catholic Recognition;
- added the distinct Passion/Martyrdom Observance, perennial General Roman rule and Portugal 2026 Occurrence for 29 August;
- bound the exact SNL row `rc:BeheadingJohnBaptist` as an obligatory memorial (`MO`);
- preserved the Order of Malta proper feast as contextual rather than universal;
- prohibited title-derived identity and kept publication/D1 remote fail-closed.

Validated head: `24b82e9c8200c91dd8314bfbb53e915d3d4fc0cd`.

Merge on `main`: `328122f83c8a00fb061827a75dc6674bdb831f6f`.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **119** across **111** civil days.
- Total canonical migration coverage: **317/389 (81.491%)**.
- Approved-source occurrences outside the canonical shadow: **72**.
- Source-bound civil days: **306/365**.
- Civil days wholly without a source-bound canonical occurrence: **59**.
- Fixed-person backlog: **27**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The Nativity and Passion of Saint John the Baptist reuse one canonical person while remaining distinct Observances on 24 June and 29 August. The Order of Malta proper feast remains contextual and was not promoted to a universal rule.

## CI and external proof

PR #456 workflows on the exact validated head:

- Product BUILD run `40688989767`: success;
- Product publish staging run `40688989645`: success;
- Quality run `40688989807`: success;
- Wikidata retry quality run `40688989644`: success;
- Sanctorale review quality run `40688989655`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `git diff --check`.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAa6Q`, SHA-256 `011d55ff9e1409a5cbaf7404bdcb4571de234e206dc826e0196f55a1e5833e9b`;
- source MD `id:oANWCGUyYBwAAAAAAAAa6g`, SHA-256 `cb7845fdc4fb5937d79927f5cb777712007c6c21dceca53f681c5644045bcb92`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAbBg`, SHA-256 `2552da6845492d1b46bc108a2a510181c0b51e9743da4b67bfa1e83e1a99c9d2`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAbBw`, SHA-256 `4abef6e7a694775bbc51f2b519dc1dadf18b4827d956c17896092a99cbe51241`;
- plan v54 JSON `id:oANWCGUyYBwAAAAAAAAbBA`, SHA-256 `991bb2d141f892878bccc73b638b109c950c0e70e08dd28a60c02b36d7cb8833`;
- plan v54 MD `id:oANWCGUyYBwAAAAAAAAbBQ`, SHA-256 `d97722eea28c544c90bf676b34ceaa7b7358d7957405a07ce531a9cbaeb6075d`.

Post-merge archive for the exact merge SHA:

`/Apps/SantosDia Orchestrator/current/product/archive-328122f83c8a00fb061827a75dc6674bdb831f6f`

- manifest `id:oANWCGUyYBwAAAAAAAAbAA`;
- validation `id:oANWCGUyYBwAAAAAAAAbAQ`;
- reconciliation ledger `id:oANWCGUyYBwAAAAAAAAbAg`;
- release `id:oANWCGUyYBwAAAAAAAAbAw`.

The merge push produced no staging run. An exact-SHA local reproduction confirms 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`; the receipt explicitly records `validationOrigin=local-exact-merge-reproduction` and a null workflow run ID.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #456 was integrated only after the exact head and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StMotherTeresa` on 5 September using competent official sources.
2. Preserve proper calendars and patronages only in their proven contexts; do not universalize them.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v54, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StMotherTeresa`; do not repeat John the Baptist's Passion.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
