# SantosDia — Current Cycle Checkpoint

Updated: 2026-09-09 12:42 UTC

Normative strategy: `docs/product/global-liturgical-intelligence-v2.1.md`

Machine contract: `config/product-platform-contract.json`

Status: active development; Portugal 2026 baseline remains published; perennial cutover remains fail-closed

## Continuity rule

The strategic document is the binding and cumulative product vision until full implementation. This checkpoint measures progress against that vision; it does not replace, narrow or reinterpret it. Resume from the first pending roadmap item only after independently confirming GitHub, Gmail and Dropbox state.

## Normative operating boundary

- First-party public experience is text only; verified, privacy-preserving, user-activated livestream is the sole audiovisual exception.
- Portugal is the first quality and semantic-equivalence anchor, never the global architecture.
- Church/tradition, jurisdiction, calendar system, locale and timezone remain independent dimensions.
- Heavy static acquisition/enrichment is monthly and distributed; only production health and source freshness/verified Live are weekly.
- Cloudflare remains inside the Free architecture. Remote D1 writes stay guarded and no production write was made in this cycle.
- AdSense remains `REMEDIATION_REQUIRED`; serving and review resubmission remain disabled.
- Evidence promotion, perennial publication, alert closure and destructive hygiene remain fail-closed.
- Evidence Vault, canonical history, receipts, provenance and rollback are never deleted as repository hygiene.

## Completed in this cycle

PR [#293](https://github.com/alexoxy/santosdodia/pull/293) promoted twelve source-reviewed General Roman optional memorials as complete canonical chains:

1. Raymond of Penyafort — 7 January;
2. Vincent of Saragossa — 22 January;
3. Angela Merici — 27 January;
4. Blaise of Sebaste — 3 February;
5. Ansgar — 3 February;
6. Fidelis of Sigmaringen — 24 April;
7. Peter Chanel — 28 April;
8. Louis-Marie de Montfort — 28 April;
9. Pius V — 30 April;
10. John I, Pope — 18 May;
11. Bernardine of Siena — 20 May;
12. Rita of Cascia — 22 May.

Each chain now contains Person, Roman Catholic Recognition, Observance, perennial fixed SanctoraleRule, exact Portugal 2026 Occurrence, read-only legacy bridge and approved-source shadow binding. SNL evidence binds the annual date and `MF` rank; Vatican News evidence binds identity and ecclesial designation. No identity was inferred from a label.

The annual engine now preserves legitimate same-day optional choices on 20 January, 3 February, 23 April and 28 April without inventing a winner. Incompatible equal-precedence collisions remain fail-closed.

Three immutable review packs respect the five-identity review ceiling while one logical PR delivered the whole product unit:

- batch 11 digest: `48081e95d5d1e6c728741688d44889c7a29d39eeedfb4b51db5d4aace4df6d04`;
- batch 12 digest: `744cdc97923d7ff5a5a6efe2121610639f8f49eec6ee33b07b0059f12a9a3e6d`;
- batch 13 digest: `83f0dac3ab362ba6a75997c9c0705ebca2bf281cf8eda0e1c83c0ef22a636d93`;
- fixed mapping digest: `fcefa8b3d7c131945bf31c54212387ef1592dd2046f7fcf6fa3d3440c5aea4d0`.

The same PR closed a dependency-security incident without a parallel dependency lane:

- `js-yaml` is constrained to 4.3.2;
- one global `sharp` 0.35.4 override covers Next.js and Miniflare;
- the lockfile is reproducible with the CI runner's npm 10.9.8;
- `npm ci --include=optional` succeeds;
- `npm audit --audit-level=high` reports zero vulnerabilities.

Squash merge on `main`: `00317ceabb4080ea696aa58ae688417868c0188f`.

No public read-model switch, production D1 write, Dropbox production promotion, AdSense serving or review resubmission occurred.

## Portugal 2026 semantic-equivalence ledger

- Approved annual source population: **389 occurrences**, **365 civil days**, **1,945 labels**.
- Direct TemporalRule bindings: **5**.
- Precedence-surviving TemporalRuleFamily bindings: **47**; 19 suppressed candidates remain evidence and do not count as coverage.
- Movable/transfer bindings: **11**, including three explicitly approved Portugal transfers.
- Exact fixed Sanctorale bindings: **80**.
- Total canonical migration coverage: **143/389 (36.761%)**.
- Legacy occurrences outside the canonical shadow: **246**.
- Source-bound civil days: **139/365**.
- Civil days without a source-bound canonical occurrence: **226**.
- Full semantic equivalence: `false`.
- Perennial read-model cutover and production promotion: `false`.

Coverage is occurrence-based. Suppressed candidates and transfer origins remain evidence, not extra coverage.

## CI and external proof

Final PR head: `4e154c0ebb30ee648d065617acb3634fd1b8365d`.

All replacement workflows succeeded:

- Quality `34352231988` — success, including dependency install/audit, all repository gates, Next.js build, Cloudflare build and production smoke;
- Sanctorale review quality `34352232042` — success;
- Wikidata retry quality `34352231995` — success;
- Product BUILD `34352232041` — success;
- Product publish staging `34352232002` — success.

The initial Quality run `34349776253` correctly rejected six high-severity transitive advisories. The first fix exposed npm-version lockfile drift in Quality `34350980945`, Wikidata retry `34350980947` and staging `34350981027`. One npm-10-compatible resolution corrected all three without weakening audit thresholds.

Dropbox external proof:

- folder:
  `/Apps/SantosDia Orchestrator/Santos do Dia/02_Dados_Eclesiasticos/06_Publicacao/roman-catholic/2026/v2/4e154c0ebb30ee648d065617acb3634fd1b8365d`;
- `validation.json` server-modified `2026-09-09T12:40:29Z`;
- 389 occurrences, 365 days, 1,945 labels, 22 multi-observance days and 15 decisions;
- status `validated-for-d1-staging`;
- `productionApproved: false`;
- immutable approved source release remains `9967aff7318b0b4794a0415f7bac271cf9a101ed`.

## Operational alerts

Four GitHub failure notifications were read and tied to the exact failing runs:

- Gmail `1a08617605b8f2fb` — Quality `34349776253`, dependency audit;
- Gmail `1a08622665ed862d` — Quality `34350980945`, npm-10 lockfile drift;
- Gmail `1a08622566154ece` — Wikidata retry `34350980947`, the same install failure;
- Gmail `1a08622549518ba1` — staging `34350981027`, the same install failure before archive/publish steps.

Only after the corrected head passed all five workflows, Dropbox exposed the promised staging receipt and PR #293 was merged were the four messages moved to Trash. No unrelated email was modified. Future searches must continue to exclude Trash and preserve the unread AdSense remediation message.

## Strategic coverage and distance to final product

| Product layer | Status | Current proof | Remaining acceptance gate |
|---|---|---|---|
| P0 reliability, security and hygiene | Realised core / continuous | Green CI, zero high vulnerabilities, fail-closed publication, proven alert routine | Continue every cycle; complete source-level last-known-good/completeness receipts |
| P1 Roman perennial engine | Partial | Temporale, liturgical-year core, precedence, transfer, colours, rolling materialisation and 80 fixed Sanctorale rules | Bind the remaining 246 Portugal occurrences; reach 389/389; prove additional years and every difference |
| P2 calculator, API and rolling ICS | Realised core / not fully accepted | Shared engine, OpenAPI, rolling Y-1…Y+3 feed and annual snapshots exist | Prove 100% semantic parity and stable backlinks for the post-cutover Portugal release |
| P3 Portugal Today product | Partial | Published last-known-good Today and reviewed text-first context | Cut over to the perennial engine only after 389/389; then prove zero false-empty, prayer/reference, Live and next/tomorrow on representative dates |
| Editorial, SEO and AdSense recovery | Partial / blocked externally | 30 deep-ready biographies, curated sitemap, thin pages noindex, visible source method | Strengthen representative production pages, verify recrawl and honest claims; human approval required before AdSense resubmission |
| P4 multi-tradition kernels | Pending | Shared architecture and preview data exist | Separate OCA, GOARCH, Church of England and Coptic kernels with competent sources and independent acceptance vectors |
| P5 jurisdictions and multilingual scale | Pending after Portugal | Context dimensions and 10-locale quality gates exist | Evidence-ready Lusophone jurisdiction packs first; no Portugal-copy overlay; each locale/context gets an independent readiness gate |
| P6 Live, SEO and AI distribution | Partial | Verified user-activated Live, API/OpenAPI/JSON-LD foundations | Context-specific Live coverage, graph-derived substantive discovery, full HTML/API/ICS/JSON-LD parity |
| P7 autonomous maintenance | Partial | Monthly distributed acquisition, weekly lightweight exceptions, source failure preserves last-known-good | Complete bootstrap receipts, switch complete sources to delta-only, automate dead-path detection and prove routine no-operator rollover |
| Global final product | Pending | Portugal is a functioning quality anchor and the interoperability architecture is present | Complete P1–P3 for Portugal, then launch each new jurisdiction/Church only through the same authority-isolated readiness gate |

The critical path is not a frontend redesign. It is:

1. Portugal 2026 semantic equivalence at 389/389;
2. perennial read-model cutover with atomic rollback;
3. Today/Calendar/API/ICS parity and Portugal product acceptance;
4. AdSense production-quality recovery;
5. evidence-ready Lusophone jurisdictions;
6. independent OCA, GOARCH, Church of England and Coptic kernels;
7. global jurisdiction/locale scale and delta-only autonomous maintenance.

## Repository hygiene inventory

- PR #293 merged after five green replacement workflows.
- No pull request remains open.
- The merged branch `feat/sanctorale-reviewed-batch-11-13` was automatically deleted.
- Open issues: #181 only, the owned strategic umbrella.
- No force push, destructive branch cleanup or history rewrite occurred.
- No new runtime dependency, first-party media, route, workflow, D1 path or publication path was introduced.
- Historical failing runs, immutable review packs, Evidence Vault objects, receipts and rollback remain preserved.
- The two pre-existing lint warnings in `scripts/media/curate-live-streams.mjs` remain non-blocking and should be removed only with the next Live-curator consumer audit.

## Decisions and risks

- The approved annual source release is immutable evidence; staging folders are keyed to the validating head while `sourceSha` continues to identify the approved source release.
- Same-day optional memorials are valid alternatives, not ambiguous collisions.
- A green shadow PR does not authorize D1 production mutation or public cutover.
- The remaining 246 occurrences include different semantic families. Batch selection must stay source/rank coherent; annual labels cannot manufacture perennial identity or rules.
- AdSense remains a product-quality and human-decision gate, not a CI/count gate.
- Other Churches remain reviewed preview or planned until their own kernels pass; no Roman semantic adaptation is allowed.

## Ordered roadmap

1. Promote the next coherent Sanctorale block, favouring source rows whose identities and ranks can be reviewed together; target a materially larger unit while retaining five-identity review packs.
2. Classify the remaining 246 occurrences by semantic family (fixed individual, group commemoration, local Portugal overlay, Temporale, transfer/precedence or non-person observance) so work is burned down by rule family rather than one saint at a time.
3. Add source-proved Temporale/transfer vectors only where they close real coverage without double-counting suppressed/replacement evidence.
4. Reach 389/389, explain every difference and run multi-year regeneration before authorising the perennial read-model cutover.
5. Execute the cutover as an atomic, reversible release; prove Today, Calendar, Search, Calculator, JSON API and ICS semantic parity.
6. Complete the compact text-first Portugal Today acceptance pass and representative production editorial/SEO quality; keep AdSense blocked until explicit human resubmission.
7. Start jurisdiction-specific Lusophone packs, then separate OCA, GOARCH, Church of England and Coptic kernels with their own authorities and acceptance vectors.
8. Convert completed source bootstraps to monthly delta-only maintenance and retain continuous security/hygiene checks.

## Resume and stop rules

- Read this checkpoint, then confirm GitHub, Gmail and Dropbox before new work.
- Do not delete an error email without positive replacement workflow and promised external-effect proof.
- Do not merge a PR whose required checks belong to an outdated base or head.
- Do not publish shadow output, infer identity from text, or conflate Church, country, locale, calendar and timezone.
- Do not add first-party media; verified Live remains the sole audiovisual exception.
- Before any platform limit or stop, leave `main`, alerts, PR purpose/next action and this checkpoint in a safe repeatable state.
