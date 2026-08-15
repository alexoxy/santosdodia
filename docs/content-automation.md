# Content automation

_Last updated: 2026-08-15_

`config/automation-registry.json` is the reviewed inventory of SantosDia workflows, schedules, owners, publication modes, archive streams and producer entrypoints. The Quality gate validates it on every pull request.

## Operating model

SantosDia is designed for **continuous autonomous work with human review by exception**.

The autonomous chain already runs as:

1. approved-source acquisition;
2. immutable raw archive in Dropbox;
3. normalization;
4. linguistic review and script checks;
5. idempotent D1 staging import;
6. publication-candidate classification.

The publication classifier uses `config/publication-decision-policy.json` and separates claims into:

- **auto-eligible** — deterministic, non-editorial evidence such as exact external identifiers; these are shadow-only until production auto-promotion is explicitly enabled;
- **cross-check-required** — factual claims such as dates, geography and localized source labels that can eventually become automatic after claim-specific corroboration;
- **human-review-required** — new canonical identities, merges/splits, recognition/canonization, Church or calendar changes, source conflicts and editorial prose.

This means humans should not repeatedly inspect every successful acquisition or normalization batch. Human attention is reserved for semantic, ecclesial, conflicting or editorial decisions.

## Boundaries

- GitHub Actions may acquire facts and prepare bounded staging packages.
- Automatic workflows do not currently write to the production database or rewrite editorial content.
- `productionAutoPromotionEnabled` remains `false` while the publication classifier runs in shadow mode.
- At least 20 clean shadow runs, zero observed false-positive classifications, maintained acceptance vectors and rollback evidence are required before any claim class can be considered for production auto-promotion.
- Editorial biography and interpretive text always require human approval.
- Cloudflare serves only approved repository/data-plane content; it does not acquire external data at request time.
- Dropbox is a bounded recovery archive and staging layer, not an operational database.
- Source failures create review candidates. They do not delete records or change production automatically.

## Scheduled work

| Task | UTC schedule | Output |
|---|---:|---|
| Production health | hourly at `:17` | read-only probes |
| Observance staging | Monday 04:15 | Dropbox staging package |
| Ecclesiastical OSINT | Monday 05:17 | Dropbox candidate package |
| LitCal staging | Tuesday 03:35 | Dropbox staging package |
| Source freshness | Sunday 08:29 | review-only report |
| Global source orchestrator | hourly at `:02` | bounded source-policy decisions |
| Saints autonomous acquisition | Wednesday 02:47 | immutable Wikidata raw package; downstream event workflows continue normalization, language review, staging import and publication classification |

The freshness audit checks at most 60 HTTPS URLs per run, with four concurrent requests and a 15-second timeout. Unreachable URLs remain review candidates and never trigger automatic deletion.

## Publication progression

The safe progression is deliberately staged:

`shadow classification` → `measured false-positive rate` → `claim-specific auto-promotion` → `broader automation only after evidence`.

Enabling one safe claim class must never implicitly enable another. Exact external identifiers, dates, localized names, Church membership, liturgical dates and editorial biographies are separate claim classes with separate promotion rules.

## Change policy

A new scheduled workflow must be added to the registry with its exact cron, owner, publication boundary, archive stream and producer entrypoints. Event-driven producer workflows should also be registered so the inventory remains operationally complete. Static pages and read-only routes do not require dedicated automations; the registry follows actual producers and schedules, not the size of the route tree.
