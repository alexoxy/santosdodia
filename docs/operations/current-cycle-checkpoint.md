# SantosDia — Current Cycle Checkpoint

Updated: 2026-08-23 00:49 UTC
Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`
Status: active development; publication remains fail-closed

## Continuity rule

The strategic document is the binding, cumulative product vision until full implementation. This checkpoint reports coverage against that vision; it does not replace, narrow or reinterpret it. Resume work from the first unresolved roadmap item after independently confirming the current GitHub, Gmail and Dropbox state.

## Completed in this cycle

- PR #211 merged: text-only first-party public surface enforced in CI; verified livestream remains the sole audiovisual exception and loads only after explicit activation.
- PR #212 merged: source-bound perennial Roman Sanctorale seed across General Roman, Europe and Portugal policies, with autonomous multi-year generation and shared precedence/transfer logic.
- PR #213 merged: bounded 60-URL CauseSanti push canary isolated from the authoritative 6000-URL scheduled/manual raw stream.
- Rolling materialisation, rolling ICS, public calculator, civil/liturgical-year mapping, Roman Temporale, precedence, transfer scheduling and liturgical-colour logic were confirmed as existing shared infrastructure.
- The 26-page global strategy was reviewed and aligned with the latest work.
- The failed Sanctorale Quality alert was fixed, rerun through all 63 Quality steps, merged and moved to Gmail Trash.

## Open change

PR #215 — Align strategy with Lusophone rollout and current engine state

Scope:

- Portugal → evidence-ready Lusophone jurisdictions → separate multi-tradition global expansion;
- CPLP/PALOP explicitly treated as localisation/discovery groupings, never ecclesiastical authority;
- public jurisdiction/locale readiness gate;
- current engine delivery snapshot and alert-closure routine;
- machine-readable strategy contract;
- normative continuity until full strategic delivery;
- this durable cycle checkpoint.

Integration gate: merge only after the current PR head passes every required status check against the current `main`.

## Operational alerts

### Resolved

- Sanctorale PR Quality failure: synthetic override fixture used a domain outside the Portugal authority policy. Fixture corrected; full positive Quality execution completed; PR #212 merged; alert moved to Trash.

### Pending — do not delete

- CauseSanti primary-source workflow failure at commit `486c875`.
- Code-level fix is already in `main`: partial raw evidence is archiveable while downstream promotion remains independently false.
- PR #213 added the isolated push canary to shorten external verification.
- Required closing proof is still pending at this checkpoint: a post-fix Dropbox canary `index.json`/receipt with verified upload, current repository/run metadata and a successful workflow conclusion.
- The original Gmail alert must remain in Inbox until that proof exists.

## External evidence

- Dropbox currently exposes only the legacy CauseSanti archive folder `/Apps/SantosDia Orchestrator/archive/sources/causesanti-va/2026-08-22T121823Z`, modified 2026-08-22 12:18 UTC.
- That object predates the CauseSanti policy fix and is not acceptable as closure evidence.
- Expected new proof path: `/Apps/SantosDia Orchestrator/archive/sources/causesanti-va/canary/index.json` plus its slot receipt.
- No new CauseSanti failure email was present at the time of this checkpoint.

## Strategic coverage

| Strategic area | Status | Evidence / remaining gate |
|---|---|---|
| Binding global strategy | Partial | Normative and machine contract updates are in PR #215; merge still required. |
| Text-first first-party experience | Realised | CI blocks images, audio, remote fonts and non-live video/iframes. |
| Canonical context dimensions | Partial | Independent locale, jurisdiction, Church/tradition, calendar and timezone are contractual; public breadth remains incomplete. |
| Evidence Vault and provenance | Partial | Immutable/hashed/review gates exist; CauseSanti external canary proof remains open. |
| Roman perennial Temporale | Realised core | Annual deterministic generation and multi-year tests exist. |
| Roman Sanctorale | Partial | Six source-bound shadow rules prove composition; complete Portugal corpus equivalence remains the release gate. |
| Precedence, transfer and colours | Partial | Shared deterministic core exists; full official Portugal regression coverage remains. |
| Rolling materialisation Y-1…Y+3 | Realised core | Automatic annual window and atomic materialisation tests exist. |
| Rolling ICS and calculator | Partial | Foundations exist; complete context parity and hardening remain. |
| Portugal reference Today | Pending | Rebuild only after the new read model reaches semantic equivalence. |
| Lusophone jurisdictions | Pending | Start only after Portugal proof and jurisdiction-specific authority packs. |
| OCA, GOARCH and Church of England kernels | Pending | Separate authoritative kernels and acceptance vectors required. |
| Verified Live | Partial | Privacy-enhanced, user-activated exception exists; global Church-specific coverage remains. |
| Autonomous maintenance | Partial | Deterministic workflows and gates exist; end-to-end exception-only operation is incomplete. |

## Repository hygiene inventory — 2026-08-23

### Pull requests

- Active product PR: #215, with one purpose and a current Quality gate.
- Active maintenance PRs: #145 (Wrangler update) and #146 (download-artifact update); both were 79 commits behind and have been asked to rebase before any merge.
- PR #167 was closed as a stale integration surface. Its 14 unique commits remain preserved for selective reimplementation after the Portugal equivalence gate; no obsolete branch code was merged.

### Issues

- #181 is now the single open umbrella issue and points to the normative strategy, machine contract and this checkpoint.
- Legacy issues #10 and #11 were closed as superseded tracking surfaces. Their detailed technical history remains available; valid work returns through #181 rather than duplicate open backlogs.

### Branches

The complete first-page branch inventory contained 43 branches including `main`.

Sixteen branches have no tree difference from `main` and are deletion candidates with no code loss:

- `agent/d1-runtime-deliverable-proof`;
- `agent/editorial-scale-6-rescue-copy`, `copy2`, `copy3`, `copy4`, `copy5`, `copy6`, `copy7`, `copy8`, `copy9`, `copy11`;
- `cloudflare-preview`;
- `fix/verify-deployed-product-capabilities`;
- `product/adsense-readiness`;
- `product/christian-daily-platform-contract-20260822`;
- `product/v2-r1-migration-inventory-20260822` (unique commit history but no current tree difference).

The connector used for repository management does not expose branch-ref deletion. These candidates must remain marked for deletion rather than being force-moved or otherwise destructively simulated. All other non-active branches contain unique tree changes and remain preserved until their consumers and overlap with `main` are reviewed.

The superseded `docs/strategy-execution-update-20260823` branch becomes a deletion candidate after #215 merges because its strategy changes are a strict subset of the active replacement.

### Hygiene rule applied

No unique branch work was deleted merely because it is old. Zero-difference branches are separated from branches containing potentially reusable product work. Cleanup remains subordinate to current strategy, security and recoverability.

## Ordered roadmap for the next continuation

1. Verify the CauseSanti push canary workflow and inspect the Dropbox `canary/index.json` plus slot receipt. If successful, confirm repository, commit, run, hash and `verifiedAfterUpload`; only then move the old failure email to Trash.
2. Wait for the latest PR #215 Quality run. Fix any real failure, rerun, and merge only with the required `check` green on the current base.
3. Validate rebased dependency PRs #145 and #146 independently; merge only if current-base CI is green, otherwise close and replace with a fresh minimal update.
4. Delete the proven zero-difference branch candidates when branch-ref deletion is available, then repeat the comparison to confirm no code loss.
5. Build a source-bound Portugal 2026 reconciliation ledger that classifies every official occurrence as Temporale, fixed Sanctorale, movable/transfer or unresolved, without manually cloning annual dates into perennial rules.
6. Expand the Roman Sanctorale rule pack from the six-rule seed through reviewed canonical Observance identities and competent authority bindings.
7. Make reconciliation executable across at least 2025–2029; explain every difference and keep public cutover disabled until the Portugal acceptance corpus reaches full semantic equivalence.
8. Cut the public read model to the perennial engine only after equivalence, then rebuild Today as a compact text-first surface.
9. Begin Lusophone jurisdiction readiness packs only after the Portugal gate, keeping every local calendar, Church authority and Portuguese locale variant independent.

## Resume stop rules

- Do not delete an error email without positive workflow and promised external-effect proof.
- Do not merge a PR whose required status belongs to an outdated base or head.
- Do not publish shadow Sanctorale output.
- Do not infer Church from country, country from language or calendar system from either.
- Do not add first-party media; verified livestream is the sole audiovisual exception.
- Do not reduce the strategic document to the currently delivered subset.
- Do not keep a duplicate issue or PR open without a present purpose and next action.
- Do not delete unique branch work until overlap, consumers and recovery are proven.
