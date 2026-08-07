# Content automation

_Last updated: 2026-08-07_

`config/automation-registry.json` is the reviewed inventory of SantosDia workflows, schedules, owners, publication modes, archive streams and producer entrypoints. The Quality gate validates it on every pull request.

## Boundaries

- GitHub Actions may acquire facts and prepare bounded staging packages.
- Automatic workflows never write to the production database or rewrite editorial content.
- Cloudflare serves only approved repository data; it does not acquire external data at request time.
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

The freshness audit checks at most 60 HTTPS URLs per run, with four concurrent requests and a 15-second timeout. Unreachable URLs remain review candidates and never trigger automatic deletion.

## Change policy

A new scheduled workflow must be added to the registry with its exact cron, owner, publication boundary, archive stream and producer entrypoints. Static pages and read-only routes do not require dedicated automations; the registry follows actual producers and schedules, not the size of the route tree.
