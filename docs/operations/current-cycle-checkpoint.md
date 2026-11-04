# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-11-04 08:51 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Master execution record: GitHub issue #355 and Dropbox plan `santosdia-entregaveis-2026-11-04-v59.{md,json}`

Status: active implementation; E07.05 is partial; Portugal 2026 semantic reconciliation is 323/389; perennial cutover and production mutation remain fail-closed.

## Continuity and operating boundary

- The global strategy is binding and cumulative until explicitly superseded by an approved normative document.
- First-party surfaces remain text-only; verified, user-activated Live is the sole audiovisual exception.
- Portugal is the first quality anchor, not the global architecture.
- Country/calendar, language, Church/rite, jurisdiction/institute, calendar system and timezone remain independent.
- Active serving policy is civil year Y and Y+1. Historical rules, sources, receipts and rollback remain preserved.
- Cloudflare Free remains normative. Normal development and CI cannot write remote D1.
- AdSense serving and resubmission remain fail-closed.

## Completed in this execution

PR [#466](https://github.com/alexoxy/santosdodia/pull/466) delivered E07.05 batch 53:

- created the canonical Person and Roman Catholic Recognition for Saint Wenceslaus, duke of Bohemia and martyr;
- added the Observance, perennial General Roman rule and Portugal 2026 Occurrence for 28 September;
- bound the exact SNL row `rc:StWenceslaus` as an optional memorial (`MF`);
- preserved Saints Lawrence Ruiz and companions as a distinct alternative on the same date;
- kept Czech and Bohemian patronage outside this batch pending explicit contextual modelling;
- kept publication and remote D1 fail-closed.

Validated head: `cb57f4a681e52b96cd9ded3d24f852c6bcce7f57`; validated tree: `140669f09a8814a3109df8d40732c71edd5f2cb2`.

Merge on `main`: `4a67be697213f914c5262bfe9dc14e42d71d748f`. The merged tree is exactly the validated tree.

E07.05 remains `EM_CURSO`; this partial batch does not reduce the master task countdown.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**.
- Direct TemporalRule bindings: **14**.
- Precedence-surviving TemporalRuleFamily bindings: **173**.
- Movable/transfer bindings: **11**.
- Exact fixed Sanctorale bindings: **125** across **115** civil days.
- Total canonical migration coverage: **323/389 (83.033%)**.
- Approved-source occurrences outside the canonical shadow: **66**.
- Source-bound civil days: **308/365**.
- Civil days wholly without a source-bound canonical occurrence: **57**.
- Fixed-person backlog: **21**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

Saint Wenceslaus and Saints Lawrence Ruiz and companions are independent alternatives on 28 September. Language variants do not create separate identities; Czech and Bohemian patronage remains contextual and was not universalized.

## CI and external proof

PR #466 workflows on the exact validated head:

- Product BUILD run `41801482175`: success;
- Product publish staging run `41801482266`: success;
- Quality run `41801482238`: success;
- Wikidata retry quality run `41801482303`: success;
- Sanctorale review quality run `41801482255`: success.

Local proof passed focused tests, `npm run check`, the mandatory AdSense fail-closed checker, `npm audit --audit-level=high` and `git diff --check`. The audit still reports 18 moderate transitive findings; the automatic forced fix is breaking and was not applied in this calendar batch.

Dropbox proof:

- source JSON `id:oANWCGUyYBwAAAAAAAAbhA`, SHA-256 `78ed3a46dd0050010ce130238d267aed7331822de445044089bee0e46625c5d1`;
- source MD `id:oANWCGUyYBwAAAAAAAAbgw`, SHA-256 `f06975a3d12a42212907add61ecee29f4cac8ea312db192bebe950c20efe97dd`;
- receipt JSON `id:oANWCGUyYBwAAAAAAAAbjw`, SHA-256 `a59e2798a4bf00c6db056be3373eed4238b35342d1075a791c8aa8139ae9dc4f`;
- receipt MD `id:oANWCGUyYBwAAAAAAAAbjQ`, SHA-256 `5a192ea2896356ea708ab7983911b6f8a4ab5518f1b43c6853febd11dacc7afb`;
- plan v59 JSON `id:oANWCGUyYBwAAAAAAAAbkg`, SHA-256 `19619209734ca7571bcb33bc9394fbca9df8efecd8d7770c2a8b2666a0a25883`;
- plan v59 MD `id:oANWCGUyYBwAAAAAAAAbkw`, SHA-256 `fa2369ae6f83030782cd9b679d548664364ecdcfcb315ccfd300d1b454a6de0c`.

Post-merge archive:

`/Apps/SantosDia Orchestrator/current/product/archive-4a67be697213f914c5262bfe9dc14e42d71d748f`

- manifest `id:oANWCGUyYBwAAAAAAAAbhg`, SHA-256 `80de966daf73cdec60d9af5e523c38301f8aad18a971e75d2630869f7cb4d39f`;
- reconciliation ledger `id:oANWCGUyYBwAAAAAAAAbhw`, SHA-256 `473d7431b95f99b19136812a3ef1d98674a6a3e796219e2da772fbc42662b1bd`;
- release `id:oANWCGUyYBwAAAAAAAAbiA`, SHA-256 `a7d29f6f65731550c0aaa2c3c17e549271523de096eda13dfb33d9fa6da9feda`;
- release SQL `id:oANWCGUyYBwAAAAAAAAbig`, SHA-256 `a92b1ad0460ee34ce5164a716893c7c529ca78cbafa0ced7b27bc1186420f9f9`;
- validation `id:oANWCGUyYBwAAAAAAAAbiQ`, SHA-256 `9bd9783827590625980963bf1512a86375e1ad4690492e7830ab6378a1b365ff`.

Staging artifact `13307018665`, digest `sha256:6c13f2eb8c730115fef28af5c8854ae26196a5bfb65a678f093a2a83de5068c5`, was archived only after tree equivalence was confirmed. Its workflow source was GitHub's tentative merge `03393412c916de56c7e7675571b7a79264fd5fbc`, whose tree equals the final merged tree. The validation records 365 days, five complete locales, zero `falseEmptyToday`, `fullSemanticEquivalence=false`, `publicationAllowed=false` and `productionApproved=false`.

## Task and deliverable countdown

- Tasks: **18 completed / 210; 192 remaining**.
- Deliverables: **0 completed / 32; 32 remaining**.
- Additions in this revision: **0**.
- Reopenings in this revision: **0**.
- E07.05 is partial; technical coverage advanced by one exact source row, but partial work does not reduce the task count.

## Repository and production hygiene

- PR #466 was integrated only after the exact head, tree and unchanged base were reverified and all five checks passed.
- No review thread or submitted review remained pending.
- Unrelated Dependabot PR #430 remained outside this batch.
- No force push, history rewrite, production data deletion, remote-D1 write, deployment, DNS/WAF mutation or AdSense activation occurred.
- Evidence Vault objects, annual source artifacts, receipts and rollback history remain preserved.

## Ordered next actions

1. Continue E07.05 with `rc:StFaustinaKowalska` on 5 October using competent official sources.
2. Publish patronages only where a competent authority proves the exact claim and context.
3. Continue source-coherent fixed Sanctorale, collective and Marian-title batches.
4. Resolve Portugal-specific structural/proper/rank rows by explicit competent-authority review.
5. Reach 389/389, explain every annual difference and run multi-year regeneration.
6. Prepare a concrete atomic cutover package, budget, receipts and rollback; request the specific production gate before mutation.
7. Prove Today, Calendar, Search, Calculator, JSON API and ICS parity, then proceed through the remaining global deliverables.

## Resume and stop rules

- Read issue #355 and Dropbox plan v59, then verify GitHub and Dropbox before new work.
- Keep one implementation batch active and continue from `rc:StFaustinaKowalska`; do not repeat Saint Wenceslaus.
- Never use CI or health checks to write remote D1.
- Do not merge a PR whose checks belong to an outdated head/base.
- Do not publish shadow output, infer identity from text, or conflate country, locale, Church, jurisdiction, calendar and timezone.
- Before any platform limit or stop, leave the repository, issue, Dropbox plan and this checkpoint in a safe repeatable state.
