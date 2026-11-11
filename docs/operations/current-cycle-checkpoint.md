# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-11-11 11:37 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-11-11-v68.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 334/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy remains binding and cumulative.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1; historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative; normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#488](https://github.com/alexoxy/santosdodia/pull/488) delivered E07.05 batch 62:

- created the canonical Person, Roman Catholic Recognition and Observance for Saint John of Capistrano;
- added a perennial General Roman rule and exact Portugal 2026 occurrence for 23 October;
- bound `rc:StJohnCapistrano` as an optional memorial (`MF`);
- retained the Franciscan obligatory memorial as a distinct institutional rank;
- archived competent patronage evidence without publishing a patronage relation, and kept runtime publication and remote D1 fail-closed.

Validated head: `2b812545e7157820cb38174822c6eb4f876a7e4b`; validated tree: `5ab0b72b55faf1780c5b5874c6c968a22a16485d`.

CI merge `bdc55362d3c3142cf90b3754c4f4c000c1aabb2d`, validated head and functional merge `5ea5daed69564557d786261393abc437c58e2944` have the exact same tree.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **136** across **122** civil days.
- Total canonical migration coverage: **334/389 (85.861%)**.
- Approved-source occurrences outside the canonical shadow: **55**.
- Source-bound civil days: **315/365**.
- Civil days wholly without a source-bound canonical occurrence: **50**.
- Fixed-person backlog: **10**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

## CI and external proof

PR #488 workflows on the exact validated head:

- Product BUILD `43012435621`: success;
- Product publish staging `43012435644`: success;
- Quality `43012435614`: success;
- Wikidata retry quality `43012435790`: success;
- Sanctorale review quality `43012436061`: success.

Focused tests, `npm run check`, the mandatory AdSense checker, `npm audit --audit-level=high` and `git diff --check` passed. The current audit retains 10 moderate transitive findings; the forced fix is breaking and was not applied.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAcXw`, SHA-256 `fc95291bcad83891c0e267bd7012d3ac8685c5fa202481a8f0269fcdfef376cb`;
- source MD `id:oANWCGUyYBwAAAAAAAAcYA`, SHA-256 `5b5757358c98b8600f1ee06eebf29d735cc841139f6915b59361915fdd5ac5cc`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAcZg`, SHA-256 `a2bf5f9de60d82094584f57c4bdc9ec73aab09bdd225bae9cb99eadd09394e0c`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAcZw`, SHA-256 `20f4fb9cba1e4487f412d6b71fd9c1f7095aea9dc5250cb0b60f0e63617fff59`;
- plan v68 JSON `id:oANWCGUyYBwAAAAAAAAcaA`, SHA-256 `3e4d1c6ed583aced436268279111ea98f21b09bf3eec6aa2f2de01386fb5b91d`;
- plan v68 MD `id:oANWCGUyYBwAAAAAAAAcaQ`, SHA-256 `74bb5b5c713b9704e95efb54aa4b71fc105a070ba4fe7018699fab8bb49f5a02`.

Staging artifact `13851098048`, ZIP digest `sha256:1120cd0692c0a7b8e6d449c04c298038d7b60fc81ba333d5314e62c442d975f4`, was archived as `id:oANWCGUyYBwAAAAAAAAcXg`. It validates 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions: **0**. Reopenings: **0**.
- E07.05 is partial; technical coverage advanced, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #488 was integrated only after the exact head, unchanged base and all five checks were verified.
- The CI merge tree, validated head tree and functional merge tree are identical.
- No review or review thread remained pending.
- No force push, history rewrite, production deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StAnthonyMaryClaret` on 24 October, preserving exact identity, authority, rank and jurisdiction boundaries.
2. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
3. Resolve Portugal-specific structural/proper/rank rows through competent-authority review.
4. Reach 389/389, explain every annual difference and run multi-year regeneration.
5. Prepare an atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v68, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StAnthonyMaryClaret`; do not repeat the 23 October batch.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
