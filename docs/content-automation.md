# Content automation

_Last updated: 2026-09-03_

`config/automation-registry.json` is the reviewed inventory of SantosDia workflows, schedules, owners, publication modes, archive streams and producer entrypoints. The Quality gate validates it on every pull request. The active data phase is bounded bootstrap/backfill; once completeness is proven for a source/context, its maintenance path becomes monthly delta-only.

The normative editorial boundary is defined in `docs/editorial-content-policy.md`. External sources are research/evidence inputs; substantive public prose is a first-party SantosDia artifact stored in a SantosDia-controlled repository or approved first-party data store before publication.

## Operating model

SantosDia is designed for **continuous autonomous work with human review by exception**.

The autonomous saints chain now runs as:

1. approved-source acquisition;
2. immutable raw archive in Dropbox where rights permit, otherwise metadata/reference/hash evidence only;
3. normalization into factual claims and identifiers;
4. linguistic review and script checks;
5. idempotent D1 staging import of structured knowledge;
6. publication-candidate classification;
7. first-party evidence adapters built from reviewed source bindings;
8. independent-source corroboration of the `cross-check-required` queue;
9. immutable corroborated, pending and conflict queues in Dropbox;
10. repository-first SantosDia editorial composition from approved canonical facts;
11. duplication, rights, provenance and substantive-value checks;
12. human approval of interpretive/biographical prose before publication.

The public runtime never acquires or proxies third-party prose. A source can establish evidence, but the public article must be independently composed from verified facts using the SantosDia information architecture. Translation, shortening, reordering or light paraphrase of a source does not by itself qualify as SantosDia first-party editorial content.

The publication classifier uses `config/publication-decision-policy.json` and separates claims into:

- **auto-eligible** — deterministic, non-editorial evidence such as exact external identifiers; these are shadow-only until production auto-promotion is explicitly enabled;
- **cross-check-required** — factual claims such as dates, geography and localized source labels that can eventually become automatic after claim-specific corroboration;
- **human-review-required** — new canonical identities, merges/splits, recognition/canonization, Church or calendar changes, source conflicts and editorial prose.

The corroborator uses `config/corroboration-policy.json`. Two independent approved sources may corroborate an eligible factual claim. A single A1/A2 first-party source may corroborate only explicitly permitted lower-risk claim classes. Birth/death dates and patronage never graduate from a single source.

A different value is a conflict only for claim classes that are actually mutually exclusive. Birth and death dates are exclusive values. Localized labels, geography, patronage and observance links may legitimately have several valid values, so a non-matching value remains pending rather than being escalated as a false conflict.

## Reviewed source bindings

Official calendars and Church media normally do not expose SantosDia canonical IDs or Wikidata QIDs. SantosDia therefore uses a **review once, monitor continuously** binding model:

1. a human/editorial review establishes an exact `source record ↔ canonical person ↔ QID` binding;
2. the binding is stored as reviewed configuration;
3. future source sweeps re-check the same date/record automatically;
4. a matching source record emits structured corroboration evidence;
5. a missing, moved or ambiguous record creates a human-review binding-drift item instead of silently changing identity.

The first adapter uses Vatican News Portuguese saint-of-the-day metadata and `config/corroboration-source-bindings.vatican-news-pt.json`. It starts with reviewed bindings for Anthony of Lisbon/Padua, Francis and Clare of Assisi, Teresa of Ávila, Joseph, Mark, James the Greater, Luke, Andrew, John the Baptist and Stephen. The adapter is evidence-only and cannot publish source prose.

This pattern is intended to be reused for Portugal's Secretariado Nacional de Liturgia and then for Church-specific official sources such as OCA/GOARCH and Church of England. A source binding is always tradition- and jurisdiction-aware; it cannot validate membership in another Church by implication.

## First-party editorial layer

The public text layer is intentionally separated from source acquisition.

`source evidence → canonical facts → SantosDia editorial candidate → review → repository/data-plane publication`

The editorial layer should add original value by synthesising chronology, Church/tradition context, jurisdiction, calendar logic, related observances, Portugal-specific relevance when applicable, key facts and internal knowledge links. The underlying facts retain provenance even though the public wording is SantosDia's own editorial composition.

A public profile should not become indexable merely because a source has enough text to fill a page. Indexability depends on the SantosDia substantive-value gate, not source length.

## Boundaries

- GitHub Actions may acquire facts and prepare bounded staging packages.
- Automatic workflows do not currently write to the production database or rewrite approved editorial content.
- `productionAutoPromotionEnabled` remains `false` while the publication classifier and corroborator run in shadow mode.
- `productionWriteAllowed` is also `false` in the corroboration policy and in every corroborated shadow queue.
- At least 20 clean shadow runs, zero observed false-positive classifications, maintained acceptance vectors and rollback evidence are required before any claim class can be considered for production auto-promotion.
- Editorial biography and interpretive text always require human approval.
- Third-party prose without explicit reuse rights is not copied into the public editorial corpus; retain only permitted evidence, factual extraction and rights metadata.
- Cloudflare serves only approved first-party repository/data-plane content; it does not acquire external data at request time.
- Dropbox is a bounded recovery archive and staging layer, not an operational database or the public editorial source of truth.
- Source failures create review candidates. They do not delete records, rewrite editorial copy or change production automatically.

## Acquisition lifecycle

1. **Bootstrap/backfill:** consume the approved source backlog in bounded resumable chunks and preserve a completeness receipt per authority/context/locale.
2. **Evidence memory:** keep immutable permitted raw releases in Dropbox; where reuse rights do not permit raw retention, store metadata, reference, hash, retrieval receipt and normalized factual claims.
3. **Canonicalization:** reconcile identities, Church competence, jurisdiction, native calendar semantics and provenance before materialization.
4. **Durable publication:** generate first-party calendar, API, ICS and editorial candidates from SantosDia-controlled knowledge. Public requests never call the source.
5. **Maintenance:** after a completeness receipt, stop full-corpus sweeps and run monthly distributed delta checks. A specific official change may trigger one bounded reviewed event.
6. **Failure:** retain last-known-good and create review work; never delete or rewrite production from a failed fetch.

“Maximum data” means maximum useful, lawful and attributable evidence, not indiscriminate prose copying. Bots are named pipeline roles backed by deterministic scripts where possible; adding overlapping workflows is not scale.

## Scheduled work

Heavy/static acquisition roots run once per month and are intentionally distributed across the month. Only lightweight production health and source freshness/verified Live remain weekly. Event-driven stages may continue a successful root cycle, but do not add independent polling. Pull-request CI remains event-driven and is not an acquisition or D1 schedule.

| Task | UTC schedule | Output |
|---|---:|---|
| Causes of Saints metadata | day 1, 03:17 | immutable primary-source metadata staging |
| Global source orchestrator | day 2, 00:02 | bounded source-policy decisions |
| Saints Baseline acquisition | day 4, 01:17 | immutable recognition-v1 candidate batch and downstream reviewed D1 staging chain |
| Saints profile enrichment | day 6, 03:07 | bounded exact-QID profile/geography evidence |
| Saints multilingual labels | day 8, 04:13 | bounded multilingual label evidence |
| Observance staging | day 10, 05:15 | Dropbox staging package |
| Ecclesiastical OSINT | day 12, 06:17 | Dropbox candidate package |
| Saints identity ledger | day 14, 07:23 | cross-batch identity evidence |
| Saints navigation exports | day 16, 08:31 | maps, timelines, calendar exports and Portugal review queues |
| LitCal staging | day 18, 03:35 | Dropbox staging package |
| Saints autonomous acquisition | day 20, 02:47 | immutable Wikidata raw package and bounded downstream chain |
| Vatican saint metadata | day 22, 09:11 | immutable Vatican evidence and reviewed-binding chain |
| Source freshness | Sunday 08:29 | lightweight review-only report and verified Live trigger |
| Production health | Monday 09:17 | lightweight read-only probes |

The freshness audit checks at most 60 HTTPS URLs per run, with four concurrent requests and a 15-second timeout. Unreachable URLs remain review candidates and never trigger automatic deletion.

## Publication progression

The safe progression is deliberately staged:

`shadow classification` → `reviewed first-party evidence` → `shadow corroboration` → `canonical facts` → `SantosDia editorial candidate` → `editorial review` → `substantive-value gate` → `publication`.

Enabling one safe claim class must never implicitly enable another. Exact external identifiers, dates, localized names, Church membership, liturgical dates and editorial biographies are separate claim classes with separate promotion rules.

The next content objective is to turn a larger evidence-backed canonical corpus into substantive first-party SantosDia pages without mass-producing thin templates. Missing evidence leaves a claim pending; it never weakens the threshold.

## Change policy

A new scheduled workflow must be added to the registry with its exact cron, owner, publication boundary, archive stream and producer entrypoints. Event-driven producer workflows should also be registered so the inventory remains operationally complete. Static pages and read-only routes do not require dedicated automations; the registry follows actual producers and schedules, not the size of the route tree.