# www.santosdodia.com

A free, global and multilingual Christian discovery service for saints, patronages, feast dates, official media and calendar subscriptions.

Production: https://www.santosdodia.com

## Product scope

- Find patron saints by profession, cause, place, date, name and Christian tradition
- Individual saint profiles with localized names, patronages, dates, traditions and traceable sources
- Curated multilingual saint histories stored in GitHub, with an attributed Wikimedia OSINT fallback where an editorial biography is not yet available
- Free virtual candles stored only on the visitor's device
- Catholic, Orthodox, Anglican and Oriental Orthodox calendar views
- Calendar feeds by tradition and individual annual saint feeds
- Official live-stream directories and media archives with editorial OSINT verification; external media pages are linked rather than embedded
- Public REST API, JSON responses, ICS feeds and OpenAPI specification
- Consolidated copyright, licensing and source-provenance page linked from the footer
- Browser-sensitive interface with English fallback

The current dataset is a curated beta. Dates and patronage associations may vary by Church, jurisdiction, rite, local tradition and calendar system.

## Development

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

Public endpoints: `/api/v1/discover`, `/api/v1/biography/{id}`, `/api/v1/today`, `/api/v1/observances`, `/api/v1/search`, `/api/ical/all`, `/api/ical/saint/{id}`, `/openapi.json`.

The `main` branch is connected to Vercel. Preview deployments are validated before production integration. The canonical production host is `www.santosdodia.com`; the apex host redirects to it.
