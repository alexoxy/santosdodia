# Content automation

_Last updated: 2026-08-15_

`config/automation-registry.json` is the reviewed inventory of SantosDia workflows, schedules, owners, publication modes, archive streams and producer entrypoints. The Quality gate validates it on every pull request.

## Operating model

SantosDia is designed for **continuous autonomous work with human review by exception**.

The autonomous saints chain now runs as:

1. approved-source acquisition;
2. immutable raw archive in Dropbox;
3. normalization;
4. linguistic review and script checks;
5. idempotent D1 staging import;
6. publication-candidate classification;
7. first-party evidence adapters built from reviewed source bindings;
8. independent-source corroboration of the `cross-check-required` queue;
9. immutable corroborated, pending and conflict queues in Dropbox.

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

The first adapter uses Vatican News Portuguese saint-of-the-day metadata and `config/corroboration-source-bindings.vatican-news-pt.json`. It starts with reviewed bindings for Anthony of Lisbon/Padua, Francis and Clare of Assisi, Teresa of Ávila, Joseph, Mark, James the Greater, Luke, Andrew, John the Baptist and Stephen. The adapter is evidence-only and cannot publish.

This pattern is intended to be reused for Portugal's Secretariado Nacional de Liturgia and then for Church-specific official sources such as OCA/GOARCH and Church of England. A source binding is always tradition- and jurisdiction-aware; it cannot validate membership in another Church by implication.

## Boundaries

- GitHub Actions may acquire facts and prepare bounded staging packages.
- Automatic workflows do not currently write to the production database or rewrite editorial content.
- `productionAutoPromotionEnabled` remains `false` while the publication classifier and corroborator run in shadow mode.
- `productionWriteAllowed` is also `false` in the corroboration policy and in every corroborated shadow queue.
- At least 20 clean shadow runs, zero observed false-positive classifications, maintained acceptance vectors and rollback evidence are required before any claim class can be considered for production auto-promotion.
- Editorial biography and interpretive text always require human approval.
- Cloudflare serves only approved repository/data-plane content; it does not acquire external data at request time.
- Dropbox is a bounded recovery archive and staging layer, not an operational database.
- Source failures create review candidates. They do not delete records or change production automatically.

## Scheduled work

| Task | UTC schedule | Output |
|---|---:|---|
| Production health | hourly at `:17` | read-only probes |
| Vatican saint metadata | daily 09:11 | immutable Vatican raw/normalized package; successful runs trigger reviewed-binding evidence generation |
| Observance staging | Monday 04:15 | Dropbox staging package |
| Ecclesiastical OSINT | Monday 05:17 | Dropbox candidate package |
| LitCal staging | Tuesday 03:35 | Dropbox staging package |
| Source freshness | Sunday 08:29 | review-only report |
| Global source orchestrator | hourly at `:02` | bounded source-policy decisions |
| Saints autonomous acquisition | Wednesday 02:47 | immutable Wikidata raw package; downstream event workflows continue normalization, language review, D1 staging import, publication classification and corroboration |

The freshness audit checks at most 60 HTTPS URLs per run, with four concurrent requests and a 15-second timeout. Unreachable URLs remain review candidates and never trigger automatic deletion.

## Publication progression

The safe progression is deliberately staged:

`shadow classification` → `reviewed first-party evidence` → `shadow corroboration` → `measured false-positive rate` → `claim-specific auto-promotion` → `broader automation only after evidence`.

Enabling one safe claim class must never implicitly enable another. Exact external identifiers, dates, localized names, Church membership, liturgical dates and editorial biographies are separate claim classes with separate promotion rules.

The next operational objective is to add further structured evidence adapters from already approved first-party and independent sources. Missing evidence leaves a claim pending; it never weakens the threshold.

## Change policy

A new scheduled workflow must be added to the registry with its exact cron, owner, publication boundary, archive stream and producer entrypoints. Event-driven producer workflows should also be registered so the inventory remains operationally complete. Static pages and read-only routes do not require dedicated automations; the registry follows actual producers and schedules, not the size of the route tree.
