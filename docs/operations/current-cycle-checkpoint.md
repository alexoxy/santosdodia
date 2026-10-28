# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-28 10:31 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-28-v52.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 315/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#452](https://github.com/alexoxy/santosdodia/pull/452) delivered E07.05 batch 46:

- created the canonical Person and Roman Catholic Recognition for Saint Joseph Calasanz using official Church evidence;
- added the distinct Observance, perennial General Roman rule and Portugal 2026 Occurrence for 25 August;
- bound the exact SNL row `rc:StJosephCalasanz` as an optional memorial (`MF`);
- preserved `rc:StLouis` as an independent unresolved optional memorial on the same date;
- prohibited inferred precedence and kept publication/D1 remote fail-closed.

Validated head: `a69526e84af074f5208897967e65e6a3d80a218a`.

Squash merge on `main`: `416bc6ad54fc2e606df9d9619d93257ff8f4ebae`.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **117** across **110** civil days.
- Total canonical migration coverage: **315/389 (80.977%)**.
- Approved-source occurrences outside the canonical shadow: **74**.
- Source-bound civil days: **305/365**.
- Civil days wholly without a source-bound canonical occurrence: **60**.
- Fixed-person backlog: **28**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

Saint Joseph Calasanz and Saint Louis remain separate identities and optional memorial alternatives on 25 August. The Calasanz source row is bound; Saint Louis remains in the exact unresolved inventory for independent review.

## CI and external proof

PR #452 workflows on the exact validated head:

- Product BUILD run `40671675362`: success;
- Product publish staging run `40671675427`: success after retrying a transient `curl (56) Connection reset by peer` without a code change;
- Quality run `40671675372`: success;
- Wikidata retry quality run `40671675603`: success;
- Sanctorale review quality run `40671675366`: success.

Local proof passed `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, the mandatory AdSense fail-closed checker and `git diff --check`.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAavw`, SHA-256 `b8bb085428bc7cdcd8578fe9ba2e11e7a4fe5c9f72a2268b0ecad23465236687`;
- source MD `id:oANWCGUyYBwAAAAAAAAawA`, SHA-256 `d3418aef931b8146da7d73700081530412beb5e13de4b00cb13b7aec0c8dbb37`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAa0g`, SHA-256 `0f939a444b5034249846fb4bc0996a7948328336e5b20a645038e943b2e1ba2a`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAa0w`, SHA-256 `64615a4f1ccf968e5f006351ab738345dc3a2b9d7c69d966764cab3aebc6e319`;
- plan v52 JSON `id:oANWCGUyYBwAAAAAAAAa0A`, SHA-256 `370c7c3b7baef6c72e0f49a7f3e60dccff677a7e6df142f424b35f925f7260b7`;
- plan v52 MD `id:oANWCGUyYBwAAAAAAAAa0Q`, SHA-256 `2ed3029dbc4182452e0f58c2548d8a150108a2b13db0e7752a888409c97b1128`.

Post-merge archive for the exact merge SHA:

`/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/416bc6ad54fc2e606df9d9619d93257ff8f4ebae`

- manifest `id:oANWCGUyYBwAAAAAAAAaxw`;
- validation `id:oANWCGUyYBwAAAAAAAAayA`;
- reconciliation ledger `id:oANWCGUyYBwAAAAAAAAayQ`;
- release `id:oANWCGUyYBwAAAAAAAAayg`.

Validation run `40672306477` confirms the exact SHA, 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #452 was integrated only after the exact head and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StLouis` on 25 August using competent official sources.
2. Preserve Saint Joseph Calasanz as an already bound, independent same-date optional memorial.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v52, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StLouis`; do not repeat Calasanz.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
