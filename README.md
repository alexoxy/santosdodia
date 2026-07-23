# www.santosdodia.com

A free, global and multilingual Christian calendar focused on Catholic and Orthodox saints, feasts and commemorations.

Production: https://www.santosdodia.com

## Product scope

- Browser-sensitive interface with English fallback
- Catholic, Orthodox and combined calendar views
- Search by name, patronage, country, category and tradition
- Daily pages and calendar subscriptions for Apple, Google and Outlook
- Public REST API, JSON responses, ICS feeds and OpenAPI specification
- Source provenance and translation status embedded in the data model

The current dataset is a curated beta. Dates may vary by Church, jurisdiction, rite and calendar system.

## Development

```bash
npm install
npm run dev
npm run build
```

Public endpoints: `/api/v1/today`, `/api/v1/observances`, `/api/v1/search`, `/api/ical/all`, `/openapi.json`.

The `main` branch is connected to Vercel. Preview deployments are generated for pull requests before production integration. The canonical production host is `www.santosdodia.com`; the apex host redirects to it.
