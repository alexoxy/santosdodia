# www.santosdodia.com

A free, global and multilingual Christian discovery service for saints, feast dates, official media and calendar subscriptions.

Production: https://www.santosdodia.com

Product plan: [docs/product-plan.md](docs/product-plan.md)

Normative product strategy: [docs/product/global-liturgical-intelligence-v2.1.md](docs/product/global-liturgical-intelligence-v2.1.md)

Data quality baseline: [docs/data-quality-baseline.md](docs/data-quality-baseline.md)

Verified-profile standard: [docs/verified-profile-standard.md](docs/verified-profile-standard.md)

OSINT data-platform architecture: [docs/osint-data-platform.md](docs/osint-data-platform.md)

OSINT acquisition runbook: [docs/osint-acquisition-runbook.md](docs/osint-acquisition-runbook.md)

## Product scope

- Text-first, media-free first-party experience; verified user-activated livestream is the only audiovisual content
- Find saints and observances by date, name and Christian tradition
- Individual saint profiles with dates, traditions, reviewed summaries and traceable sources
- Free virtual candles stored only on the visitor's device
- Catholic, Orthodox, Anglican and Oriental Orthodox calendar views
- Calendar feeds by tradition and individual annual saint feeds
- Official live-stream directories and media archives with editorial OSINT verification
- Public REST API, JSON responses, ICS feeds and OpenAPI specification
- Consolidated copyright, licensing and source-provenance page linked from the footer
- Privacy, terms, FAQ and correction/rights-request pages linked from the footer
- Browser-sensitive interface with English fallback

The current dataset is a curated beta. Dates and observances may vary by Church, jurisdiction, rite, local tradition and calendar system. Patronage and place associations remain withheld until each claim has direct provenance.

## Development

```bash
npm ci
npm run check
npm run cloudflare:build
```

`npm run check` performs repository and OSINT registry audits, curated-data checks, typecheck, lint and the Next.js production build.

Public endpoints: `/api/v1/discover`, `/api/v1/today`, `/api/v1/observances`, `/api/v1/search`, `/api/ical/all`, `/api/ical/saint/{id}`, `/openapi.json`.

The GitHub repository is the code and schema source of truth. Production runs on Cloudflare Workers through OpenNext. The canonical production host is `www.santosdodia.com`; the apex host redirects to it. Raw OSINT source objects are archived outside Git and are never used as direct production content.
