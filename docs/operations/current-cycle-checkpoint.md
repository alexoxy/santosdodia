# SantosDia — Current Cycle Checkpoint

Updated: 2026-09-10 09:49 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Machine contract: `config/product-platform-contract.json`

Status: active development; Portugal 2026 remains the published last-known-good baseline; perennial cutover remains fail-closed

## Continuity rule

The strategic document is the binding and cumulative product vision until full implementation. This checkpoint measures progress against that vision; it does not replace, narrow or reinterpret it. Resume from the first pending roadmap item only after independently confirming GitHub, Gmail and Dropbox state.

## Normative operating boundary

- First-party public experience is text only; verified, privacy-preserving, user-activated livestream is the sole audiovisual exception.
- Portugal is the first quality and semantic-equivalence anchor, never the global architecture.
- Church/tradition, jurisdiction, calendar system, locale and timezone remain independent dimensions.
- Cloudflare stays inside the Free architecture; no remote D1 or production write occurred in this cycle.
- AdSense remains `REMEDIATION_REQUIRED`; serving and review resubmission remain disabled.
- Evidence promotion, perennial publication, alert closure and destructive hygiene remain fail-closed.
- Evidence Vault, canonical history, receipts, provenance and rollback are never deleted as repository hygiene.

## Completed in this cycle

PR [#295](https://github.com/alexoxy/santosdodia/pull/295) replaced single-row progress with the first larger algorithmic Temporale unit:

- added perennial families for Sundays II–V of Lent, II–VI of Easter and II–IV of Advent;
- bound all 12 occurrences to exact approved Portugal 2026 source identities and record hashes;
- generalized the TemporalRuleFamily model from Easter weekdays to authority-isolated weekly series with explicit anchor, rank, legacy identity and canonical identity patterns;
- preserved the candidate-versus-publication boundary: 78 candidates now resolve to 59 exact source-bound family members plus 19 explicit precedence suppressions;
- added an immutable promotion receipt with mapping digests;
- added an exact semantic inventory for every remaining approved-source occurrence, classified only from canonical event identity and reviewed resolution status, never from labels.

Squash merge on `main`: `0512a5812ed91b4a8ba9a457e1e2b9f2d145d6e6`.

No public read-model switch, production D1 write, Dropbox production promotion, AdSense serving or review resubmission occurred.

## Portugal 2026 semantic-equivalence ledger

- Approved source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **5**.
- Precedence-surviving TemporalRuleFamily bindings: **59**; 19 suppressed candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80** across 76 civil days.
- Total canonical migration coverage: **155/389 (39.846%)**.
- Approved-source occurrences outside the canonical shadow: **234**.
- Source-bound civil days: **151/365**.
- Civil days without a source-bound canonical occurrence: **214**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

The unresolved inventory is exact and exhaustive:

| Semantic family | Remaining |
|---|---:|
| Temporal weekday families | 83 |
| Fixed individual persons | 52 |
| Ordinary Time Sunday family | 28 |
| Fixed/major non-person observances | 16 |
| Portugal structural overlays | 14 |
| Saturday Marian family | 14 |
| Fixed collective observances | 12 |
| Fixed Marian titles | 8 |
| Portugal proper identities | 5 |
| Portugal rank overrides | 2 |
| **Total** | **234** |

The 21 structural/proper/rank rows specific to Portugal remain behind explicit competent-authority human review. Coverage is occurrence-based; suppressions and transfer origins remain evidence, not extra coverage.

## CI and external proof

Final development head: `12915d024427b0ccac1673195ba59edbf936fe00`.

All workflows succeeded:

- Quality `34462267535` — success, all 64 steps including dependency audit, repository gates, Next.js build, Cloudflare build and production smoke;
- Wikidata retry quality `34462267434` — success;
- Product BUILD `34462267546` — success;
- Product publish staging `34462267405` — success.

Local proof also passed `npm run check`, `npm run cloudflare:build` and the AdSense fail-closed audit. The only lint output remains two pre-existing non-blocking unused-import warnings in the Live curator.

Dropbox external proof:

- folder: `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/12915d024427b0ccac1673195ba59edbf936fe00`;
- `validation.json` server-modified `2026-09-10T09:45:43Z`;
- 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and 15 decisions;
- status `validated-for-d1-staging`;
- `productionApproved: false`;
- the approved annual source release remains immutable.

## Operational alerts

A fresh non-Trash project-error search before development returned zero messages. A second search after merge also returned zero. No email was moved or deleted. The unread AdSense remediation message remains preserved and actionable.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability, security and hygiene | Realised core / continuous | Green CI, zero high-severity dependency findings, fail-closed publication and proven alert routine | Continue every cycle; finish source-level completeness and last-known-good receipts |
| P1 Roman perennial engine | Partial | Temporale, liturgical year, precedence, transfers, colours, rolling materialisation, 80 fixed rules and five TemporalRuleFamilies | Bind the remaining 234 occurrences; reach 389/389; explain all annual differences and prove multiple years |
| P2 calculator, API and rolling ICS | Realised core / awaiting equivalence | Shared engine, OpenAPI, rolling Y-1…Y+3 feed and annual snapshots | Prove 100% semantic parity and stable backlinks after Portugal cutover |
| P3 Portugal Today product | Partial | Published last-known-good Today and reviewed text-first context | Cut over only after 389/389; then prove zero false-empty, prayer/reference, Live and next/tomorrow on representative dates |
| Editorial, SEO and AdSense recovery | Partial / externally blocked | 30 deep-ready biographies, curated sitemap, thin pages noindex, visible source method | Strengthen representative production pages, verify recrawl and require explicit human approval before resubmission |
| P4 multi-tradition kernels | Pending | Shared architecture and preview data | Separate OCA, GOARCH, Church of England and Coptic kernels with competent sources and independent vectors |
| P5 jurisdictions and multilingual scale | Pending after Portugal | Independent context dimensions and 10-locale quality gates | Evidence-ready Lusophone jurisdiction packs; no Portugal-copy overlays |
| P6 Live, SEO and AI distribution | Partial | Verified user-activated Live and API/OpenAPI/JSON-LD foundations | Context-specific Live coverage and full HTML/API/ICS/JSON-LD parity |
| P7 autonomous maintenance | Partial | Monthly distributed acquisition, weekly lightweight exceptions and last-known-good preservation | Complete bootstrap receipts, delta-only mature sources and routine no-operator rollover |
| Global final product | Pending | Portugal is the functioning quality anchor; interoperability architecture exists | Complete P1–P3 for Portugal, then launch each jurisdiction/Church through the same authority-isolated gate |

## Repository hygiene inventory

- PR #295 merged only after four green workflows and Dropbox staging proof.
- No pull request remains open.
- The merged branch `feat/seasonal-sunday-temporal-families` was automatically deleted.
- Open issues: #181 only, the owned strategic umbrella with the next step below.
- No force push, history rewrite, dependency, route, workflow, media asset, D1 path or production path was introduced.
- Immutable source evidence, promotion receipts, failed-run history, Evidence Vault objects and rollback remain preserved.
- The unresolved inventory adds one deterministic test path to the existing Vault gate; it does not create a second runtime or publication path.

## Decisions and risks

- Seasonal Sunday families are high-confidence universal arithmetic; Ordinary Time Sundays require two segments plus explicit annual suppressions and will be a separate unit.
- The 234-row inventory is a work ledger, not publication authority. It cannot create Person, Observance or perennial rules from labels or dates.
- A green shadow PR does not authorize D1 production mutation or public cutover.
- AdSense remains a product-quality and human-decision gate, not a CI/count gate.
- Other Churches remain reviewed preview or planned until their own kernels pass; Roman semantics cannot be adapted across Church boundaries.

## Ordered roadmap

1. Implement the two-segment Ordinary Time Sunday family and its explicit 2026 precedence partition; target the remaining 28 Sunday occurrences without absorbing Christ the King or the All Saints suppression.
2. Implement coherent weekday families in bounded units: Holy Week/Easter Octave first, then Advent/Christmas/Epiphany, then Ordinary Time; every candidate needs an exact present-or-suppressed outcome.
3. Model the 14 optional Saturday Marian rows as a precedence-sensitive family, not 14 fixed duplicates.
4. Continue source-coherent fixed Sanctorale/collective/Marian-title batches using competent authority identities and bounded review packs.
5. Resolve the 21 Portugal-specific structural/proper/rank rows by explicit national authority review.
6. Reach 389/389, explain every difference and run multi-year regeneration before authorising the perennial cutover.
7. Execute an atomic reversible cutover; prove Today, Calendar, Search, Calculator, JSON API and ICS parity.
8. Complete Portugal product/AdSense acceptance, then start evidence-specific Lusophone jurisdictions and separate OCA, GOARCH, Church of England and Coptic kernels.

## Resume and stop rules

- Read this checkpoint, then confirm GitHub, Gmail and Dropbox before new work.
- Do not delete an error email without positive replacement workflow and promised external-effect proof.
- Do not merge a PR whose checks belong to an outdated base or head.
- Do not publish shadow output, infer identity from text, or conflate Church, country, locale, calendar and timezone.
- Do not add first-party media; verified Live remains the sole audiovisual exception.
- Before any platform limit or stop, leave `main`, alerts, PR purpose/next action and this checkpoint in a safe repeatable state.
