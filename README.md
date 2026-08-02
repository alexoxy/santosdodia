# www.santosdodia.com

A free, global and multilingual Christian discovery service for saints, patronages, feast dates, official media and calendar subscriptions.

Production: https://www.santosdodia.com

Product plan: [docs/product-plan.md](docs/product-plan.md)

Data quality baseline: [docs/data-quality-baseline.md](docs/data-quality-baseline.md)

Verified-profile standard: [docs/verified-profile-standard.md](docs/verified-profile-standard.md)

## Product scope

- Find patron saints by profession, cause, place, date, name and Christian tradition
- Individual saint profiles with patronages, dates, traditions and traceable sources
- Free virtual candles stored only on the visitor's device
- Catholic, Orthodox, Anglican and Oriental Orthodox calendar views
- Calendar feeds by tradition and individual annual saint feeds
- Official live-stream directories and media archives with editorial OSINT verification
- Public REST API, JSON responses, ICS feeds and OpenAPI specification
- Consolidated copyright, licensing and source-provenance page linked from the footer
- Browser-sensitive interface with English fallback

The current dataset is a curated beta. Dates and patronage associations may vary by Church, jurisdiction, rite, local tradition and calendar system.

## Development

```bash
npm ci
npm run check
npm run cloudflare:build
```

`npm run check` performs the curated-data audit, typecheck, lint and Next.js production build.

Public endpoints: `/api/v1/discover`, `/api/v1/today`, `/api/v1/observances`, `/api/v1/search`, `/api/ical/all`, `/api/ical/saint/{id}`, `/openapi.json`.

The GitHub repository is the source of truth. Production runs on Cloudflare Workers through OpenNext. The canonical production host is `www.santosdodia.com`; the apex host redirects to it. Vercel deployment is retired and the GitHub-to-Dropbox backup workflow is not part of the architecture.
