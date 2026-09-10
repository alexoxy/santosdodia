# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-09-10 13:50 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Machine contract: `config/product-platform-contract.json`

Status: active implementation; automatic product validation is remote-D1-free after the 10 September quota incident; Portugal 2026 remains the published last-known-good baseline; perennial cutover remains fail-closed

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

PR [#301](https://github.com/alexoxy/santosdodia/pull/301) completed the nine-row Holy Week/Easter Octave unit:

- added a Holy Week Monday-Wednesday family and an Easter Octave Monday-Saturday family, both derived from Gregorian Easter rather than copied annual dates;
- extended the family model from v1.2 to v1.3 with explicit member profiles, so family membership is independent from liturgical rank;
- preserved the approved rank `celebration with precedence over solemnities` instead of weakening the nine rows to ordinary weekdays;
- bound every member to its exact Portugal 2026 source occurrence identity and record hash;
- added an immutable promotion receipt with unit and combined mapping digests while preserving the previous seasonal and Ordinary Time receipts as historical checkpoints;
- exercised the new arithmetic across 2020-2030 and added fail-closed validation for unknown member profiles and ranks.

Development head: `e31e1ffe01ad81d0407d4297adeb50759ce9e0e6`.

Squash merge on `main`: `5f2ded54669e34ea393dec25e0562a4fb90a269f`.

No public read-model switch, D1 write, Dropbox production promotion, AdSense serving or review resubmission occurred. The remote-D1-free boundary introduced by PR #299 remained enforced in every workflow.

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

Final development head: `e31e1ffe01ad81d0407d4297adeb50759ce9e0e6`.

PR #301 workflows succeeded:

- Quality `34484365199` — success, all 64 steps including canonical coverage, Next.js build, Cloudflare build and production smoke;
- Wikidata retry quality `34484365117` — success;
- Product BUILD `34484365140` — success;
- Product publish staging `34484365101` — success, remote-D1-free.

Post-merge workflows succeeded:

- Quality `34484707466` — success;
- Product BUILD `34484707472` — success;
- Product publish staging `34484707462` — success and Dropbox archive created, with no D1 job;
- chained Portugal product v2 staging `34484823430` — success and Dropbox archive created, with no D1 job.

Local proof passed `npm run check`, `npm run cloudflare:build`, YAML parsing and the AdSense fail-closed audit. The only lint output remains two pre-existing non-blocking unused-import warnings in the Live curator.

Dropbox external proof:

- v1 folder `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/5f2ded54669e34ea393dec25e0562a4fb90a269f`; `validation.json` server-modified `2026-09-10T13:47:00Z`, source-bound to run `34484707462`, 365/365 days, five complete locales, zero false-empty Today rows and `productionApproved: false`;
- v2 folder `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/5f2ded54669e34ea393dec25e0562a4fb90a269f`; `validation.json` server-modified `2026-09-10T13:48:31Z`, 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days, 15 decisions and `productionApproved: false`;
- both archives prove that the legitimate external effect survives without a remote D1 job; the approved annual source release and earlier D1 receipts remain immutable.

## Operational alerts

The pre-development non-Trash project-error search returned zero messages. The resolved Cloudflare quota alert remains in Trash. The reset remains `2026-09-11T00:00:00Z`; no write-based reset probe occurred. The unread AdSense remediation message remains preserved and actionable.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability, security and hygiene | Realised core / continuous | Green CI, corrected D1 incident, automatic product validation remote-D1-free, fail-closed publication and proven alert routine | Confirm the reset without a write probe; keep remote promotion explicit and budgeted; continue source-level completeness |
| P1 Roman perennial engine | Partial | Temporale, liturgical year, precedence, transfers, colours, rolling materialisation, 80 fixed rules and nine TemporalRuleFamilies | Bind the remaining 197 occurrences; reach 389/389; explain all annual differences and prove multiple years |
| P2 calculator, API and rolling ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, rolling Y-1…Y+3 feed and annual snapshots | Prove 100% semantic parity and stable backlinks after Portugal cutover |
| P3 Portugal Today product | Partial | Published last-known-good Today and reviewed text-first context | Cut over only after 389/389; then prove zero false-empty, prayer/reference, Live and next/tomorrow on representative dates |
| Editorial, SEO and AdSense recovery | Partial / externally blocked | 30 deep-ready biographies, curated sitemap, thin pages noindex, visible source method | Strengthen representative production pages, verify recrawl and require explicit human approval before resubmission |
| P4 multi-tradition kernels | Pending | Shared architecture and preview data | Separate OCA, GOARCH, Church of England and Coptic kernels with competent sources and independent vectors |
| P5 jurisdictions and multilingual scale | Pending after Portugal | Independent context dimensions and 10-locale quality gates | Evidence-ready Lusophone jurisdiction packs; no Portugal-copy overlays |
| P6 Live, SEO and AI distribution | Partial | Verified user-activated Live and API/OpenAPI/JSON-LD foundations | Context-specific Live coverage and full HTML/API/ICS/JSON-LD parity |
| P7 autonomous maintenance | Partial | Monthly distributed acquisition, weekly lightweight exceptions and last-known-good preservation | Complete bootstrap receipts, delta-only mature sources and routine no-operator rollover |
| Global final product | Pending | Portugal is the functioning quality anchor; interoperability architecture exists | Complete P1–P3 for Portugal, then launch each jurisdiction/Church through the same authority-isolated gate |

## Repository hygiene inventory

- PR #301 merged only after four green workflows; four post-merge workflows and two Dropbox archives then proved the resulting path.
- No pull request remains open.
- The merged feature branch `feat/holy-week-easter-octave-families` was automatically deleted; the squash commit and promotion receipt preserve recovery.
- Open issues: #181 only, the owned strategic umbrella with the next step below.
- No force push, history rewrite, dependency, route, workflow, media asset, D1 data mutation or production path was introduced.
- Immutable source evidence, promotion receipts, failed-run history, Evidence Vault objects and rollback remain preserved.
- The two new rule families extend the sole TemporalRuleFamily path; they do not create a duplicate engine or publication route.

## Decisions and risks

- The 10 September D1 limit was an automation-boundary failure, not a reason to upgrade Cloudflare or weaken validation. Cloudflare Free remains normative.
- D1 stays blocked by the provider until the stated reset; development may continue locally and through Dropbox, but no remote write or write-based health probe may run before or after reset without an explicit promotion decision.
- The 197-row inventory is a work ledger, not publication authority. It cannot create Person, Observance or perennial rules from labels or dates.
- Explicit member profiles are now part of the family contract because a high-rank temporal family cannot safely be inferred from the word `weekday` or from labels.
- A green shadow PR does not authorize D1 production mutation or public cutover.
- AdSense remains a product-quality and human-decision gate, not a CI/count gate.
- Other Churches remain reviewed preview or planned until their own kernels pass; Roman semantics cannot be adapted across Church boundaries.

## Ordered roadmap

1. After `2026-09-11T00:00:00Z`, confirm only that no new quota alert or failed request remains; do not perform a D1 write probe and do not restore automatic product writes.
2. Implement the remaining Advent/Christmas/Epiphany weekday families, then the two-segment Ordinary Time weekdays; every candidate needs an exact present-or-suppressed outcome.
3. Model the 14 optional Saturday Marian rows as a precedence-sensitive family, not 14 fixed duplicates.
4. Continue source-coherent fixed Sanctorale/collective/Marian-title batches using competent authority identities and bounded review packs.
5. Resolve the 21 Portugal-specific structural/proper/rank rows by explicit national authority review.
6. Reach 389/389, explain every difference and run multi-year regeneration before authorising the perennial cutover.
7. Execute an atomic reversible cutover; prove Today, Calendar, Search, Calculator, JSON API and ICS parity.
8. Complete Portugal product/AdSense acceptance, then start evidence-specific Lusophone jurisdictions and separate OCA, GOARCH, Church of England and Coptic kernels.

## Resume and stop rules

- Read this checkpoint, then confirm GitHub, Gmail and Dropbox before new work.
- Never use automatic product validation, PR CI, a build, a reconciliation run or a health probe to write remote D1.
- Do not delete an error email without positive replacement workflow and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated base or head.
- Do not publish shadow output, infer identity from text, or conflate Church, country, locale, calendar and timezone.
- Do not add first-party media; verified Live remains the sole audiovisual exception.
- Before any platform limit or stop, leave `main`, alerts, PR purpose/next action and this checkpoint in a safe repeatable state.
