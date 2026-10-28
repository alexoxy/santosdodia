# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-10-28 14:10 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-10-28-v56.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 319/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#460](https://github.com/alexoxy/santosdodia/pull/460) delivered E07.05 batch 50:

- created the canonical Person and Roman Catholic Recognition for Saint Peter Claver;
- added the distinct Observance, perennial General Roman rule and Portugal 2026 Occurrence for 9 September;
- bound the exact SNL row `rc:StPeterClaver` as an optional memorial (`MF`);
- preserved institute proper ranks and same-day proper observances as independent contexts;
- archived the historical patronage as scoped evidence without publishing a contextual patronage entity, and kept publication/D1 remote fail-closed.

Validated head: `ae4759beba15f74f23de1eda519f3e2c7dbe4222`.

Merge on `main`: `eadd35fce84d86d33b4c1410fe50205b2beeb839`.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **121** across **113** civil days.
- Total canonical migration coverage: **319/389 (82.005%)**.
- Approved-source occurrences outside the canonical shadow: **70**.
- Source-bound civil days: **307/365**.
- Civil days wholly without a source-bound canonical occurrence: **58**.
- Fixed-person backlog: **25**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

Saint Peter Claver is an optional memorial in the General Roman Calendar on 9 September. Proper ranks for the Society of Jesus, Comboni Missionaries and Missionary Sisters of Saint Peter Claver remain contextual. The historical patronage is retained as scoped evidence and was not published as a contextual patronage entity.

## CI and external proof

PR #460 workflows on the exact validated head:

- Product BUILD run `40702001239`: success;
- Product publish staging run `40702001253`: success;
- Quality run `40702001265`: success;
- Wikidata retry quality run `40702001226`: success;
- Sanctorale review quality run `40702001299`: success.

Local proof passed focused tests, `npm run check`, `npm audit --audit-level=high` with zero vulnerabilities, clean regeneration, the mandatory AdSense fail-closed checker and `git diff --check`.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAbIw`, SHA-256 `d54d35a770af0358b4fd58704efe06d81bf5bff192c48f6e7798853d80f007dc`;
- source MD `id:oANWCGUyYBwAAAAAAAAbIg`, SHA-256 `fef0e70e14e89fa3bd5dcb7139c28aa32de9a0eaf23a103e4d6db381270c2e1c`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAbOA`, SHA-256 `0c16be144397647b734023876c0fe90a8e37067bf6da0ddbf94735188ae613b4`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAbOQ`, SHA-256 `a3e2b7623966dbd6a392480eb0117cb717f6f3c0f667892d40f2824f4f3b040e`;
- plan v56 JSON `id:oANWCGUyYBwAAAAAAAAbOg`, SHA-256 `d22c94980c28afa2d61fe261503e43aaf35f05dcd34980bddf572b3ac00ff67d`;
- plan v56 MD `id:oANWCGUyYBwAAAAAAAAbOw`, SHA-256 `23ae05a68ee7fce976447d59f9d3074ddefe1725ebaa6d7961f7c0b53750c119`.

Post-merge archive for the exact merge SHA:

`/Apps/SantosDia Orchestrator/current/product/archive-eadd35fce84d86d33b4c1410fe50205b2beeb839`

- manifest `id:oANWCGUyYBwAAAAAAAAbNQ`;
- validation `id:oANWCGUyYBwAAAAAAAAbNA`;
- reconciliation ledger `id:oANWCGUyYBwAAAAAAAAbNg`;
- release `id:oANWCGUyYBwAAAAAAAAbNw`.

The post-merge archive uses an exact-SHA local reproduction and references PR staging run `40702001253` and artifact `12821099699`. It confirms 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`; the receipt records `validationOrigin=local-exact-merge-reproduction` and a null post-merge workflow run ID.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #460 was integrated only after the exact head and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StHildegardBingen` and `rc:StRobertBellarmine` on 17 September as independent records using competent official sources.
2. Publish patronages only where a competent authority proves the exact claim and context.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v56, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StHildegardBingen` and `rc:StRobertBellarmine`; do not repeat Saint Peter Claver.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
