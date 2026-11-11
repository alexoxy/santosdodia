# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-11-11 10:45 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-11-11-v67.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 333/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy remains binding and cumulative.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1; historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative; normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#486](https://github.com/alexoxy/santosdodia/pull/486) delivered E07.05 batch 61:

- created the canonical Person, Roman Catholic Recognition and Observance for Saint John Paul II;
- added a perennial General Roman rule and exact Portugal 2026 occurrence for 22 October;
- bound `rc:StJohnPaulII` as an optional memorial (`MF`);
- retained territorial and institutional alternatives on 22 October as separate contextual observances;
- published no patronage relation and kept runtime publication and remote D1 fail-closed.

Validated head: `d3d3ea2f456d7499a4f7d40ab62451bcbdca7db2`; validated tree: `453ed8e45b6cd689a1129f0bd755097834018098`.

CI merge `da60fb7716e8f334fac4b64b3e36e2b37df5b954`, validated head and functional merge `a908a9ac0dc18ff2c9ff0b050ac83ea19cd95fd6` have the exact same tree.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **135** across **121** civil days.
- Total canonical migration coverage: **333/389 (85.604%)**.
- Approved-source occurrences outside the canonical shadow: **56**.
- Source-bound civil days: **314/365**.
- Civil days wholly without a source-bound canonical occurrence: **51**.
- Fixed-person backlog: **11**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

## CI and external proof

PR #486 workflows on the exact validated head:

- Product BUILD `43005315243`: success;
- Product publish staging `43005315337`: success;
- Quality `43005315273`: success;
- Wikidata retry quality `43005315421`: success;
- Sanctorale review quality `43005315215`: success.

Focused tests, `npm run check`, the mandatory AdSense checker, `npm audit --audit-level=high` and `git diff --check` passed. The current audit retains 10 moderate transitive findings; the forced fix is breaking and was not applied.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAcPw`, SHA-256 `5b0edce4063d4dc74622290fc3dc06ab60d2438ec814ec7806a20ffc365be61c`;
- source MD `id:oANWCGUyYBwAAAAAAAAcPg`, SHA-256 `d2c2119923608e72ce8809b1799741466f4e653d2cc8f34a68aba6dd49f78d1a`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAcTA`, SHA-256 `dd6861400aa32f15bddeb289d02a1d5efa9e637e24001924727d019c1b251419`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAcSw`, SHA-256 `cd6b6acd3e23c005068941bbd05be436d8b1aa681a32abfdf90b65e18a13be0a`;
- plan v67 JSON `id:oANWCGUyYBwAAAAAAAAcUg`, SHA-256 `307a0e4f2e109961edd85be281831767d23d5cf465c09266ce959bbb9d04c6f3`;
- plan v67 MD `id:oANWCGUyYBwAAAAAAAAcUw`, SHA-256 `9a484746270fced910166ad096ec332024497262846c3b68574863407f51528d`.

Staging artifact `13847024659`, ZIP digest `sha256:445c043621cbcdd729a04e41e41e178b2c514c3b11654b4d1b14ad2d84aed929`, was archived as `id:oANWCGUyYBwAAAAAAAAcRQ`. It validates 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions: **0**. Reopenings: **0**.
- E07.05 is partial; technical coverage advanced, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #486 was integrated only after the exact head, unchanged base and all five checks were verified.
- The CI merge tree, validated head tree and functional merge tree are identical.
- No review or review thread remained pending.
- No force push, history rewrite, production deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StJohnCapistrano` on 23 October, preserving exact identity, authority, rank and jurisdiction boundaries.
2. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
3. Resolve Portugal-specific structural/proper/rank rows through competent-authority review.
4. Reach 389/389, explain every annual difference and run multi-year regeneration.
5. Prepare an atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v67, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StJohnCapistrano`; do not repeat the 22 October batch.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
