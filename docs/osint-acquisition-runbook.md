# SantosDia OSINT acquisition runbook

_Last updated: 2026-08-06_

## Safety state

The OSINT platform is currently in **archive-only bootstrap mode**.

- Production publication is disconnected.
- Raw captures are content-addressed and immutable.
- Raw acquisition directories are excluded from Git.
- Every enabled source requires an approved policy record and a source-specific adapter.
- Pending or blocked sources cannot execute.

## Dropbox archive

The confirmed archive root exists at `/SantosDia-OSINT/` with:

```text
00-governance
01-raw
02-extracted
03-normalized
04-validation
05-conflicts
06-publication-packages
07-receipts
99-archive
```

Dropbox is the archival lake. D1 remains the normalized application database.

## Commands

```bash
npm run osint:registry-audit
npm run osint:robots-audit
npm run osint:dump
```

### Registry audit

`osint:registry-audit` verifies:

- unique source identifiers;
- valid HTTPS source URLs;
- authority-score ranges;
- manifest-to-registry URL agreement;
- one policy record per manifest source;
- approved policy for every enabled source;
- explicit licence/use and robots/API status;
- positive rate limit for approved sources;
- archive-only and `publish=false` manifest settings.

The registry audit is part of the repository-wide `npm run check` gate.

### Robots evidence audit

`osint:robots-audit` retrieves only `/robots.txt` for P0 sources and archives:

- original bytes;
- final URL and HTTP status;
- SHA-256;
- `User-agent`, `Allow`, `Disallow`, `Sitemap`, `Crawl-delay` and `Content-Signal` directives;
- a compact policy-evidence report.

This command does not approve a source automatically and does not retrieve site content.

### Initial dump

`osint:dump` runs the P0 manifest through the policy registry. It executes only sources that are both:

1. marked `enabled: true` in the manifest; and
2. marked `decision: approved` in the policy registry.

The runner rejects adapter paths outside `scripts/osint/adapters/`.

## Current enabled source

Only `wikidata` is enabled.

The adapter uses the official Wikidata SPARQL endpoint and retrieves a bounded sample of entities represented as saints through either:

- `canonization status (P411) = saint (Q43115)`; or
- `instance of (P31) = saint (Q43115)`.

Environment controls:

```bash
OSINT_WIKIDATA_PAGE_SIZE=500
OSINT_WIKIDATA_MAX_PAGES=1
OSINT_WIKIDATA_DELAY_MS=10000
```

The default is deliberately small. A full initial dump must increase `OSINT_WIKIDATA_MAX_PAGES` explicitly and retain the configured inter-request delay.

## Output contract

Each raw response is stored under:

```text
data/osint/runs/{source_id}/{run_id}/
```

Each page produces:

- a content-addressed raw object;
- a receipt containing timestamps, endpoint, HTTP metadata, byte count, SHA-256 and request-query hash;
- a final run summary.

These paths are local staging paths and are ignored by Git. The next integration step uploads the raw object to `/SantosDia-OSINT/01-raw/` and the receipt to `/SantosDia-OSINT/07-receipts/`.

## Source activation procedure

A source may move from `pending` to `approved` only when the policy registry records:

- access mechanism: API, feed, dump, ICS, RSS, PDF or bounded HTML;
- robots or API-contract status;
- licence status;
- allowed uses;
- evidence URLs;
- rate limit;
- source-specific adapter.

When reuse rights are not open, the adapter must be restricted to explicitly allowed metadata, source links or internal evidence. Full editorial text must not be republished by default.

## Publication boundary

No archive output becomes public content directly. The future publication path is:

```text
raw object
→ extraction
→ normalization
→ entity resolution
→ assertion/evidence graph
→ redundancy and conflict validation
→ confidence threshold
→ immutable publication package
→ D1 promotion
```

Rollback retains the previous publication package whenever confidence falls or authoritative sources conflict.
