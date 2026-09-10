# SantosDia — Global Vision Implementation Checkpoint

Updated: 2026-09-10 12:52 UTC

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

PR [#299](https://github.com/alexoxy/santosdodia/pull/299) resolved the Cloudflare D1 quota incident before further product work:

- Cloudflare reported at `2026-09-10T10:59:08Z` that account `alexmmpinto` had exceeded the Workers Free limit of 100,000 D1 rows written; writes remain unavailable until `2026-09-11T00:00:00Z`, while stored data is unaffected;
- identified two automatic annual-release write paths: the v1 product workflow wrote remote staging after a qualifying main push and then triggered a second Portugal v2 remote staging load;
- removed both remote publication jobs, their D1 environment, staging database identifier and Cloudflare credentials while retaining local package construction, validation artefacts and immutable Dropbox archives;
- added a repository audit that rejects remote D1 commands, Cloudflare credentials or the `d1-staging` environment in either automatic product-validation workflow;
- updated the public publication boundary to require both product pipelines to remain remote-D1-free and to preserve their Dropbox evidence archive;
- renamed the Work process from a cadence-oriented title to **Implementação Visão Global SantosDia** and encoded the remote D1 boundary in its continuing instructions.

Development head: `5cb295137187d458224c999c074d02b77305fbd6`.

Squash merge on `main`: `8dce3ee9585ed72eaa196cbc1e42a10f2a9e5cf6`.

No public read-model switch, new D1 write, Dropbox production promotion, AdSense serving or review resubmission occurred during diagnosis, correction or validation. The product-equivalence ledger is unchanged from PR #297.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **5**.
- Precedence-surviving TemporalRuleFamily bindings: **87**; 24 suppressed candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **183/389 (47.044%)**.
- Approved-source occurrences outside the canonical shadow: **206**.
- Source-bound civil days: **179/365**.
- Civil days without a source-bound canonical occurrence: **186**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The unresolved inventory is exact and exhaustive:

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 83 |
| Fixed individual persons | 52 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Saturday Marian family | 14 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **206** |

The 21 structural/proper/rank rows specific to Portugal remain behind explicit competent-authority human review. Coverage is occurrence-based; suppressions and transfer origins remain evidence, not extra coverage.

## CI and external proof

Final development head: `5cb295137187d458224c999c074d02b77305fbd6`.

PR #299 workflows succeeded:

- Quality `34478335145` — success, including the new remote-D1-free audit, Next.js build, Cloudflare build and production smoke;
- Wikidata retry quality `34478335223` — success;
- Product publish staging `34478335226` — success with only `build-and-validate-release`; no remote D1 job existed;
- Portugal product v2 staging `34478335181` — success with only `build-and-validate-v2`; no remote D1 job existed.

Post-merge workflows also succeeded:

- Quality `34478637859` — success;
- Product publish staging `34478637864` — build/validate and Dropbox archive succeeded, with no D1 job;
- chained Portugal product v2 staging `34478761566` — build/validate and Dropbox archive succeeded, with no D1 job.

Local proof passed `npm run check`, `npm run cloudflare:build`, YAML parsing and the AdSense fail-closed audit. The only lint output remains two pre-existing non-blocking unused-import warnings in the Live curator.

Dropbox external proof:

- v1 folder `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/8dce3ee9585ed72eaa196cbc1e42a10f2a9e5cf6`; `validation.json` server-modified `2026-09-10T12:47:45Z`, source-bound to post-merge run `34478637864`, 365/365 days, five complete locales, zero false-empty Today rows and `productionApproved: false`;
- v2 folder `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/8dce3ee9585ed72eaa196cbc1e42a10f2a9e5cf6`; `validation.json` server-modified `2026-09-10T12:49:03Z`, 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days, 15 decisions and `productionApproved: false`;
- both archives prove that the legitimate external effect survives without a remote D1 job; the approved annual source release and earlier D1 receipts remain immutable.

## Operational alerts

Cloudflare alert `[Alert] D1 daily operation limit exceeded for account: alexmmpinto` (Gmail message `1a08af8b79d8960d`) was read and preserved during diagnosis. It was moved to Trash only after PR #299, all four PR workflows, the three post-merge workflows and both Dropbox archives succeeded. The reset remains `2026-09-11T00:00:00Z`; no write-based reset probe is permitted. The unread AdSense remediation message remains preserved and actionable.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability, security and hygiene | Realised core / continuous | Green CI, corrected D1 incident, automatic product validation remote-D1-free, fail-closed publication and proven alert routine | Confirm the reset without a write probe; keep remote promotion explicit and budgeted; continue source-level completeness |
| P1 Roman perennial engine | Partial | Temporale, liturgical year, precedence, transfers, colours, rolling materialisation, 80 fixed rules and seven TemporalRuleFamilies | Bind the remaining 206 occurrences; reach 389/389; explain all annual differences and prove multiple years |
| P2 calculator, API and rolling ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, rolling Y-1…Y+3 feed and annual snapshots | Prove 100% semantic parity and stable backlinks after Portugal cutover |
| P3 Portugal Today product | Partial | Published last-known-good Today and reviewed text-first context | Cut over only after 389/389; then prove zero false-empty, prayer/reference, Live and next/tomorrow on representative dates |
| Editorial, SEO and AdSense recovery | Partial / externally blocked | 30 deep-ready biographies, curated sitemap, thin pages noindex, visible source method | Strengthen representative production pages, verify recrawl and require explicit human approval before resubmission |
| P4 multi-tradition kernels | Pending | Shared architecture and preview data | Separate OCA, GOARCH, Church of England and Coptic kernels with competent sources and independent vectors |
| P5 jurisdictions and multilingual scale | Pending after Portugal | Independent context dimensions and 10-locale quality gates | Evidence-ready Lusophone jurisdiction packs; no Portugal-copy overlays |
| P6 Live, SEO and AI distribution | Partial | Verified user-activated Live and API/OpenAPI/JSON-LD foundations | Context-specific Live coverage and full HTML/API/ICS/JSON-LD parity |
| P7 autonomous maintenance | Partial | Monthly distributed acquisition, weekly lightweight exceptions and last-known-good preservation | Complete bootstrap receipts, delta-only mature sources and routine no-operator rollover |
| Global final product | Pending | Portugal is the functioning quality anchor; interoperability architecture exists | Complete P1–P3 for Portugal, then launch each jurisdiction/Church through the same authority-isolated gate |

## Repository hygiene inventory

- PR #299 merged only after four green workflows; three post-merge workflows and two Dropbox archives then proved the replacement path.
- No pull request remains open.
- The merged branch `fix/cloudflare-d1-automatic-write-guard` was automatically deleted.
- Open issues: #181 only, the owned strategic umbrella with the next step below.
- No force push, history rewrite, dependency, route, media asset, D1 data mutation or production path was introduced; two unsafe automatic jobs and 166 lines were removed.
- Immutable source evidence, promotion receipts, failed-run history, Evidence Vault objects and rollback remain preserved.
- Product validation still creates the same local SQL/package artefacts and durable archives; remote D1 is no longer a hidden continuation of validation.

## Decisions and risks

- The 10 September D1 limit was an automation-boundary failure, not a reason to upgrade Cloudflare or weaken validation. Cloudflare Free remains normative.
- D1 stays blocked by the provider until the stated reset; development may continue locally and through Dropbox, but no remote write or write-based health probe may run before or after reset without an explicit promotion decision.
- The 206-row inventory is a work ledger, not publication authority. It cannot create Person, Observance or perennial rules from labels or dates.
- A green shadow PR does not authorize D1 production mutation or public cutover.
- AdSense remains a product-quality and human-decision gate, not a CI/count gate.
- Other Churches remain reviewed preview or planned until their own kernels pass; Roman semantics cannot be adapted across Church boundaries.

## Ordered roadmap

1. After `2026-09-11T00:00:00Z`, confirm only that no new quota alert or failed request remains; do not perform a D1 write probe and do not restore automatic product writes.
2. Implement the nine-row Holy Week/Easter Octave weekday unit: Monday–Wednesday of Holy Week plus Monday–Saturday of the Easter Octave, with exact approved-source bindings and no annual dates embedded in the perennial rules.
3. Implement the remaining Advent/Christmas/Epiphany weekday families, then the two-segment Ordinary Time weekdays; every candidate needs an exact present-or-suppressed outcome.
4. Model the 14 optional Saturday Marian rows as a precedence-sensitive family, not 14 fixed duplicates.
5. Continue source-coherent fixed Sanctorale/collective/Marian-title batches using competent authority identities and bounded review packs.
6. Resolve the 21 Portugal-specific structural/proper/rank rows by explicit national authority review.
7. Reach 389/389, explain every difference and run multi-year regeneration before authorising the perennial cutover.
8. Execute an atomic reversible cutover; prove Today, Calendar, Search, Calculator, JSON API and ICS parity.
9. Complete Portugal product/AdSense acceptance, then start evidence-specific Lusophone jurisdictions and separate OCA, GOARCH, Church of England and Coptic kernels.

## Resume and stop rules

- Read this checkpoint, then confirm GitHub, Gmail and Dropbox before new work.
- Never use automatic product validation, PR CI, a build, a reconciliation run or a health probe to write remote D1.
- Do not delete an error email without positive replacement workflow and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated base or head.
- Do not publish shadow output, infer identity from text, or conflate Church, country, locale, calendar and timezone.
- Do not add first-party media; verified Live remains the sole audiovisual exception.
- Before any platform limit or stop, leave `main`, alerts, PR purpose/next action and this checkpoint in a safe repeatable state.
