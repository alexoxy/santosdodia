# SantosDia — Current Cycle Checkpoint

Updated: 2026-09-10 10:42 UTC

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

PR [#297](https://github.com/alexoxy/santosdodia/pull/297) completed the Ordinary Time Sunday algorithmic unit:

- added the early II–IX and late X–XXXIV perennial families instead of storing 2026 Sunday dates as rules;
- introduced a deterministic Second Sunday in Ordinary Time anchor and kept the late segment counted backwards from Advent;
- proved the Second Sunday anchor against both General Roman and Portugal policies for every year 1900–2200;
- bound all 28 approved Portugal 2026 Ordinary Time Sunday rows to exact source occurrence identities and record hashes;
- preserved five explicit 2026 suppressions: Sundays VII–IX at the Lent boundary, Sunday XXXI by All Saints and Sunday XXXIV by Christ the King;
- preserved the candidate/publication boundary: 111 total family candidates now resolve to 87 exact source-bound members plus 24 explicit precedence or season-boundary suppressions;
- added an immutable promotion receipt with mapping and suppression digests and removed the 28 covered rows from the exact unresolved inventory.

Development head: `90cb9eaeb3d3231c97a5872fdec7e53c1414af31`.

Squash merge on `main`: `67294b2cdbd17f844a8dcb4d8ee8268a9fcf45d1`.

No public read-model switch, production D1 write, Dropbox production promotion, AdSense serving or review resubmission occurred.

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

Final development head: `90cb9eaeb3d3231c97a5872fdec7e53c1414af31`.

All workflows succeeded:

- Quality `34467092961` — success, all 64 steps including dependency audit, repository gates, Next.js build, Cloudflare build and production smoke;
- Wikidata retry quality `34467092958` — success;
- Product BUILD `34467092909` — success;
- Product publish staging `34467093037` — success.

Local proof also passed `npm run check`, `npm run cloudflare:build` and the AdSense fail-closed audit. The only lint output remains two pre-existing non-blocking unused-import warnings in the Live curator.

Dropbox external proof:

- folder: `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/90cb9eaeb3d3231c97a5872fdec7e53c1414af31`;
- `validation.json` validated `2026-09-10T10:39:22.197Z` and server-modified `2026-09-10T10:40:01Z`;
- 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and 15 decisions;
- status `validated-for-d1-staging`;
- `productionApproved: false`;
- the approved annual source release remains immutable.

## Operational alerts

A fresh non-Trash project-error search before development returned zero messages. A second two-query search after merge also returned zero. No email was moved or deleted. The unread AdSense remediation message remains preserved and actionable.

## Strategic coverage matrix

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability, security and hygiene | Realised core / continuous | Green CI, zero high-severity dependency findings, fail-closed publication and proven alert routine | Continue every cycle; finish source-level completeness and last-known-good receipts |
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

- PR #297 merged only after four green workflows and Dropbox staging proof.
- No pull request remains open.
- The merged branch `feat/ordinary-time-sunday-families` was automatically deleted.
- Open issues: #181 only, the owned strategic umbrella with the next step below.
- No force push, history rewrite, dependency, route, workflow, media asset, D1 path or production path was introduced.
- Immutable source evidence, promotion receipts, failed-run history, Evidence Vault objects and rollback remain preserved.
- The new anchor and two families extend the existing TemporalRuleFamily path; they do not create a second runtime or publication path.

## Decisions and risks

- Ordinary Time Sunday numbering is now represented by two perennial segments, while the 2026 presence/suppression partition remains annual evidence rather than a universal outcome.
- The 206-row inventory is a work ledger, not publication authority. It cannot create Person, Observance or perennial rules from labels or dates.
- A green shadow PR does not authorize D1 production mutation or public cutover.
- AdSense remains a product-quality and human-decision gate, not a CI/count gate.
- Other Churches remain reviewed preview or planned until their own kernels pass; Roman semantics cannot be adapted across Church boundaries.

## Ordered roadmap

1. Implement the nine-row Holy Week/Easter Octave weekday unit: Monday–Wednesday of Holy Week plus Monday–Saturday of the Easter Octave, with exact approved-source bindings and no annual dates embedded in the perennial rules.
2. Implement the remaining Advent/Christmas/Epiphany weekday families, then the two-segment Ordinary Time weekdays; every candidate needs an exact present-or-suppressed outcome.
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
