# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-11-04 12:31 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-11-04-v64.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 329/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy remains binding and cumulative.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1; historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative; normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#477](https://github.com/alexoxy/santosdodia/pull/477) delivered E07.05 batch 58:

- created the canonical Person and Roman Catholic Recognition for Callistus I;
- added an Observance, perennial General Roman rule and Portugal 2026 Occurrence for 14 October;
- bound `rc:StCallistusIPope` as an optional memorial (`MF`);
- preserved the official pope-and-martyr identity without inferring patronage or disputed detail;
- kept publication and remote D1 fail-closed.

Validated head: `a7240ae7f0848c73e41070733880342884e0b04b`; validated tree: `17d03a76776ad9aca174d01b9c7a2aa91573c571`.

Merge on `main`: `c9e5d3bdf3937edc4cfae4af1292fe032475d028`. The merged tree is exactly the validated tree.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **131** across **119** civil days.
- Total canonical migration coverage: **329/389 (84.576%)**.
- Approved-source occurrences outside the canonical shadow: **60**.
- Source-bound civil days: **312/365**.
- Civil days wholly without a source-bound canonical occurrence: **53**.
- Fixed-person backlog: **15**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

## CI and external proof

PR #477 workflows on the exact validated head:

- Product BUILD `41828948455`: success;
- Product publish staging `41828948445`: success;
- Quality `41828948500`: success;
- Wikidata retry quality `41828948453`: success;
- Sanctorale review quality `41828948439`: success.

PR #478 hardened the batch generator against duplicate insertions on repeated execution. Quality `41829868344` and Wikidata retry quality `41829868328` passed on head `33d34f0504aaebc8aee619db6682fd0305976e3f`; the fix merged as `1a051884c414283bae19928020ab07064e485388`.

Local focused tests, `npm run check`, the mandatory AdSense checker, `npm audit --audit-level=high` and `git diff --check` passed. The audit retains 18 moderate transitive findings; the forced fix is breaking and was not applied.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAb_Q`, SHA-256 `757222b3302ea419831f7f8282dc1d52b375ecb0affb6735b4ba5c96ca3de6a7`;
- source MD `id:oANWCGUyYBwAAAAAAAAb_A`, SHA-256 `ecc00b3839a5b893ab348516f1a4ae5e9bcb432f4e449738502542f009f6f7dd`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAcCg`, SHA-256 `f8af86842231ef055c4580dbe00bb92a8dd7047265fd2720d1f4a30cd217edec`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAcCQ`, SHA-256 `7bffae60e934a06e41dcc2203eed8f3a3bd994ff5f24d7a806e85971963da2ab`;
- plan v64 JSON `id:oANWCGUyYBwAAAAAAAAcCw`, SHA-256 `a428a8bbc44b6eb8334565182e3ee630f7b377d22f7d5d4ad4e3706d2dcb296a`;
- plan v64 MD `id:oANWCGUyYBwAAAAAAAAcDA`, SHA-256 `9afcb393518071606dda09c34940644bc5ca419d34a15951c1bf583224b0f05f`.

Staging artifact `13321531796`, digest `sha256:81a9262b26a18e4b6d6a484dfd416e2f1cbe82195b3af61a1bcc5d24683eedec`, was archived as `id:oANWCGUyYBwAAAAAAAAcAw`. Its source commit, validated head and functional merge have tree `17d03a76776ad9aca174d01b9c7a2aa91573c571`. Validation records 365 days, five complete locales, zero `falseEmptyToday` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions: **0**. Reopenings: **0**.
- E07.05 is partial; technical coverage advanced, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #477 was integrated only after exact head, tree, unchanged base and all five checks were verified.
- No review or review thread remained pending.
- No force push, history rewrite, production deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StHedwig` and `rc:StMargaretAlacoque` on 16 October, preserving independent identities and alternatives.
2. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
3. Resolve Portugal-specific structural/proper/rank rows through competent-authority review.
4. Reach 389/389, explain every annual difference and run multi-year regeneration.
5. Prepare an atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
6. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v64, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StHedwig` and `rc:StMargaretAlacoque`; do not repeat Callistus I.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
