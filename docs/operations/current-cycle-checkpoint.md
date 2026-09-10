# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-09-10 14:50 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Machine contract: `config/product-platform-contract.json`

Status: active implementation; flexible ferial/Saint disposition is now part of the shadow perennial engine; automatic product validation remains remote-D1-free; Portugal 2026 remains the published last-known-good baseline; perennial cutover remains fail-closed

## Continuity rule

The strategic document is the binding and cumulative product vision until full implementation. This checkpoint measures progress against that vision; it does not replace, narrow or reinterpret it. The Work process is named **Implementação Visão Global SantosDia**; its weekly schedule is only a continuity cadence, not the mission or scope. Resume from the first pending roadmap item only after independently confirming GitHub, Gmail and Dropbox state.

## Normative operating boundary

- First-party public experience is text only; verified, privacy-preserving, user-activated livestream is the sole audiovisual exception.
- Portugal is the first quality and semantic-equivalence anchor, never the global architecture.
- Church/tradition, jurisdiction, calendar system, locale and timezone remain independent dimensions.
- Cloudflare stays inside the Free architecture. Automated PR, build, reconciliation and product-validation paths are local/artefact/Dropbox-only and cannot authenticate to or write remote D1. Remote D1 remains a separate explicit promotion boundary with budget preflight, idempotency, receipt and rollback.
- AdSense remains `REMEDIATION_REQUIRED`; serving and review resubmission remain disabled.
- Evidence promotion, perennial publication, alert closure and destructive hygiene remain fail-closed.
- Evidence Vault, canonical history, receipts, provenance and rollback are never deleted as repository hygiene.

## Completed in this cycle

PR [#303](https://github.com/alexoxy/santosdodia/pull/303) completed the flexible ferial disposition unit for celebrations of Saints:

- kept the deterministic feria as an explicit default when one or more optional memorials are permitted, instead of selecting a Saint automatically;
- exposed memorials coinciding with Advent weekdays from 17-24 December, Christmas-Octave weekdays and Lenten weekdays as limited commemoration candidates while retaining the privileged feria;
- preserved the existing Sunday, feast, solemnity, transfer and fail-closed equal-precedence behaviours;
- extended the shadow precedence contract to v1.1 and annual-calendar contract to v0.2 with separate `defaultCandidateId`, `optionalCandidateIds`, `commemorationCandidateIds` and `celebratedCandidateId` semantics;
- registered GIRM 355 as A0 normative evidence and documented that jurisdictional adaptations remain separate policy;
- added explicit single-option, multiple-option and privileged-commemoration vectors across 2026 and 2027.

Development head: `27a973e00da7f963f0f25aaa9d5cc11cf3c682bc`.

Squash merge on `main`: `f84b5eda5132dd915e0154076effcf483f300953`.

No annual source row or coverage claim was added by this semantic unit. No public read-model switch, D1 write, Dropbox production promotion, AdSense serving or review resubmission occurred. The remote-D1-free boundary introduced by PR #299 remained enforced.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **5**.
- Precedence-surviving TemporalRuleFamily bindings: **96**; 24 suppressed candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **192/389 (49.357%)**.
- Approved-source occurrences outside the canonical shadow: **197**.
- Source-bound civil days: **188/365**.
- Civil days without a source-bound canonical occurrence: **177**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The unresolved inventory is exact and exhaustive:

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 74 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Saturday Marian family | 14 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **197** |

The 21 structural/proper/rank rows specific to Portugal remain behind explicit competent-authority human review. Coverage is occurrence-based; suppressions and transfer origins remain evidence, not extra coverage.

## CI and external proof

Final development head: `27a973e00da7f963f0f25aaa9d5cc11cf3c682bc`.

PR #303 workflows succeeded:

- Quality `34491145643` — success, all 64 steps including the new ferial/Saint vectors, canonical coverage, TypeScript, Next.js build, Cloudflare build and production smoke;
- Wikidata retry quality `34491146846` — success.

The code-only path did not trigger a product-release or Dropbox-publication workflow. Local proof passed the complete `npm run check`; the only lint output remains the two pre-existing non-blocking unused-import warnings in the Live curator.

Dropbox connectivity was reconfirmed after merge. No new archive was expected or written because this unit changes only shadow resolution semantics and no annual source data or release artefact. The last v1/v2 archives from merge `5f2ded54669e34ea393dec25e0562a4fb90a269f`, the approved annual source release and all earlier D1 receipts remain immutable.

## Operational alerts

Both the pre-development and post-merge non-Trash project-error searches returned zero messages. The resolved Cloudflare quota alert remains in Trash. The reset remains `2026-09-11T00:00:00Z`; no write-based reset probe occurred. The unread AdSense remediation message remains preserved and actionable.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability, security and hygiene | Realised core / continuous | Green CI, corrected D1 incident, automatic product validation remote-D1-free, fail-closed publication and proven alert routine | Confirm the reset without a write probe; keep remote promotion explicit and budgeted; continue source-level completeness |
| P1 Roman perennial engine | Partial | Temporale, liturgical year, flexible ferial/Saint disposition, precedence, transfers, colours, rolling materialisation, 80 fixed rules and nine TemporalRuleFamilies | Bind the remaining 197 occurrences; reach 389/389; explain all annual differences and prove multiple years |
| P2 calculator, API and rolling ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, rolling Y-1…Y+3 feed and annual snapshots | Prove 100% semantic parity and stable backlinks after Portugal cutover |
| P3 Portugal Today product | Partial | Published last-known-good Today and reviewed text-first context | Cut over only after 389/389; then prove zero false-empty, prayer/reference, Live and next/tomorrow on representative dates |
| Editorial, SEO and AdSense recovery | Partial / externally blocked | 30 deep-ready biographies, curated sitemap, thin pages noindex, visible source method | Strengthen representative production pages, verify recrawl and require explicit human approval before resubmission |
| P4 multi-tradition kernels | Pending | Shared architecture and preview data | Separate OCA, GOARCH, Church of England and Coptic kernels with competent sources and independent vectors |
| P5 jurisdictions and multilingual scale | Pending after Portugal | Independent context dimensions and 10-locale quality gates | Evidence-ready Lusophone jurisdiction packs; no Portugal-copy overlays |
| P6 Live, SEO and AI distribution | Partial | Verified user-activated Live and API/OpenAPI/JSON-LD foundations | Context-specific Live coverage and full HTML/API/ICS/JSON-LD parity |
| P7 autonomous maintenance | Partial | Monthly distributed acquisition, weekly lightweight exceptions and last-known-good preservation | Complete bootstrap receipts, delta-only mature sources and routine no-operator rollover |
| Global final product | Pending | Portugal is the functioning quality anchor; interoperability architecture exists | Complete P1–P3 for Portugal, then launch each jurisdiction/Church through the same authority-isolated gate |

## Repository hygiene inventory

- PR #303 merged only after its 64-step Quality and auxiliary workflow both completed successfully.
- No pull request remains open.
- The merged feature branch `feat/flexible-ferial-saint-disposition` was automatically deleted; the squash commit and Git history preserve recovery.
- Open issues: #181 only, the owned strategic umbrella with the next step below.
- No force push, history rewrite, dependency, route, workflow, media asset, annual source mutation, D1 data mutation or production path was introduced.
- Immutable source evidence, promotion receipts, failed-run history, Evidence Vault objects and rollback remain preserved.
- The change extends the existing precedence and annual-calendar path; it does not create a second feria resolver, calendar engine or publication route.

## Decisions and risks

- The 10 September D1 limit was an automation-boundary failure, not a reason to upgrade Cloudflare or weaken validation. Cloudflare Free remains normative.
- D1 stays blocked by the provider until the stated reset; development may continue locally and through Dropbox, but no remote write or write-based health probe may run before or after reset without an explicit promotion decision.
- The 197-row inventory is a work ledger, not publication authority. It cannot create Person, Observance or perennial rules from labels or dates.
- A fixed Sanctorale date is an annual candidate generator, not a guarantee that the Saint is celebrated on that civil date in every year; the annual outcome comes from Temporale, precedence and jurisdiction policy.
- `optional-choice` records canonical permission, not an observed local pastoral selection. The engine therefore keeps the feria default separate from full optional celebrations and limited commemorations.
- GIRM 355 is universal normative evidence for these dispositions; any territorial adaptation must enter through the jurisdiction-policy layer and competent authority evidence.
- The 2026 Portugal structural overlay on 5 December and similar source-specific cases must not be generalized from labels or annual output.
- A green shadow PR does not authorize D1 production mutation or public cutover.
- AdSense remains a product-quality and human-decision gate, not a CI/count gate.
- Other Churches remain reviewed preview or planned until their own kernels pass; Roman semantics cannot be adapted across Church boundaries.

## Ordered roadmap

1. Implement Advent/Christmas/Epiphany weekday families through the new ferial-disposition semantics; every generated member must have an exact present, replaced, optional, commemorated or suppressed result against the approved Portugal 2026 source.
2. Implement the two-segment Ordinary Time weekday families without annual dates, again preserving exact source and suppression partitions.
3. Model the 14 optional Saturday Marian rows as a precedence-sensitive family, not 14 fixed duplicates.
4. Continue source-coherent fixed Sanctorale/collective/Marian-title batches using competent authority identities and bounded review packs.
5. Resolve the 21 Portugal-specific structural/proper/rank rows by explicit national authority review.
6. Reach 389/389, explain every difference and run multi-year regeneration before authorising the perennial cutover.
7. Execute an atomic reversible cutover; prove Today, Calendar, Search, Calculator, JSON API and ICS parity.
8. Complete Portugal product/AdSense acceptance, then start evidence-specific Lusophone jurisdictions and separate OCA, GOARCH, Church of England and Coptic kernels.

After `2026-09-11T00:00:00Z`, verify in parallel that no new quota alert or failed request remains. This is a read-only operational check, not a blocker for local product development, a D1 write probe or authority to restore automatic product writes.

## Resume and stop rules

- Read this checkpoint, then confirm GitHub, Gmail and Dropbox before new work.
- Never use automatic product validation, PR CI, a build, a reconciliation run or a health probe to write remote D1.
- Do not delete an error email without positive replacement workflow and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated base or head.
- Do not publish shadow output, infer identity from text, or conflate Church, country, locale, calendar and timezone.
- Do not add first-party media; verified Live remains the sole audiovisual exception.
- Before any platform limit or stop, leave `main`, alerts, PR purpose/next action and this checkpoint in a safe repeatable state.
