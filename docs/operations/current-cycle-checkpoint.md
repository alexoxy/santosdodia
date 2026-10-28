# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-28 11:02 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-28-v53.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 316/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#454](https://github.com/alexoxy/santosdodia/pull/454) delivered E07.05 batch 47:

- created the canonical Person and Roman Catholic Recognition for Saint Louis IX of France using official Church evidence;
- added the distinct Observance, perennial General Roman rule and Portugal 2026 Occurrence for 25 August;
- bound the exact SNL row `rc:StLouis` as an optional memorial (`MF`);
- preserved `rc:StJosephCalasanz` as an independently bound optional memorial on the same date;
- prohibited inferred precedence and kept publication/D1 remote fail-closed.

Validated head: `cbe7cd78221742fd81cb80fc9c11ed2169ab3426`.

Merge on `main`: `5e2c3740c58f118aa48e0e330be7bb81096b71f7`.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **118** across **110** civil days.
- Total canonical migration coverage: **316/389 (81.234%)**.
- Approved-source occurrences outside the canonical shadow: **73**.
- Source-bound civil days: **305/365**.
- Civil days wholly without a source-bound canonical occurrence: **60**.
- Fixed-person backlog: **27**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

Saint Louis and Saint Joseph Calasanz remain separate identities and optional-memorial alternatives on 25 August. Both exact source rows are bound independently; the shared civil date did not collapse either Occurrence or infer precedence.

## CI and external proof

PR #454 workflows on the exact validated head:

- Product BUILD run `40675998486`: success;
- Product publish staging run `40675998596`: success;
- Quality run `40675998667`: success;
- Wikidata retry quality run `40675998459`: success;
- Sanctorale review quality run `40675998572`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `git diff --check`.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAa1A`, SHA-256 `f5a33ab09ee7751c2a98a9dca2c8d534a92f12c3c79b49c673ca10507c12ceb1`;
- source MD `id:oANWCGUyYBwAAAAAAAAa1Q`, SHA-256 `94da4916aaffea061ab7d45ce16f80c9bf2aabc5823e3f53eabebe2b8c5b4c35`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAa5w`, SHA-256 `d1093cb232d0cdc7720275117da594887382aa21f5b47a7fba031865e04a7af7`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAa6A`, SHA-256 `b70667b4c4b68e15b681daad2598bb68a8c197efae12668340b716235f572d5e`;
- plan v53 JSON `id:oANWCGUyYBwAAAAAAAAa5Q`, SHA-256 `cfa6c454ef76802f7992629636a7c5ff40b8599f580bcbec89246702fc9d6fd3`;
- plan v53 MD `id:oANWCGUyYBwAAAAAAAAa5g`, SHA-256 `c31390b1caabf8d92d2df6337ffbdb14b4a575a4a0a373cd1a846c3f1c1be10a`.

Post-merge archive for the exact merge SHA:

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/5e2c3740c58f118aa48e0e330be7bb81096b71f7`

- manifest `id:oANWCGUyYBwAAAAAAAAa3A`;
- validation `id:oANWCGUyYBwAAAAAAAAa3Q`;
- reconciliation ledger `id:oANWCGUyYBwAAAAAAAAa3g`;
- release `id:oANWCGUyYBwAAAAAAAAa3w`.

Validation run `40676257784` confirms the exact SHA, 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #454 was integrated only after the exact head and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:BeheadingJohnBaptist` on 29 August using competent official sources.
2. Reuse the canonical John the Baptist Person; model the Passion/Beheading as a distinct Observance without title-derived identity.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v53, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:BeheadingJohnBaptist`; do not repeat Saint Louis or Calasanz.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
