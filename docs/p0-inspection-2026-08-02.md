# P0 inspection record — 2026-08-02

## Purpose

Record what was inspected during the P0 production-integrity pass, what was changed, and which checks remain unresolved.

## Repository inspection completed

- GitHub remains the code source of truth.
- Cloudflare Workers/OpenNext is the documented production runtime.
- The intended Cloudflare production branch is now documented as `main`.
- Vercel runtime and deployment dependencies are not part of the active application architecture.
- The GitHub-to-Dropbox workflow has been removed and remains outside the architecture.
- The previously empty dynamic source snapshot has been replaced with valid empty JSON without fabricating records.
- Curated-data auditing is enforced by `npm run check` and the Quality workflow.
- OpenAPI, README and filesystem route consistency is enforced by `npm run api:validate`.
- Automated observance, LitCal and translation workflows run the data audit before committing generated changes.
- Dynamically imported records pass through a publication policy before reaching public consumers.

## Data baseline completed

The initial curated baseline records:

- 46 observances;
- 12 catalogued sources;
- 8 Christian traditions;
- 10 interface locales;
- 5 records labelled verified;
- 40 labelled cross-checked;
- 1 review-required record;
- no curated `lastVerified` dates;
- five single-source records incorrectly carrying a cross-checked label.

Full details are maintained in `docs/data-quality-baseline.md`.

## External production inspection attempted

The following public targets were selected for read-only validation:

- `https://www.santosdodia.com/`
- `https://santosdodia.com/`
- `/api/v1/system/status`
- `/api/v1/today`
- `/api/v1/observances`
- `/api/v1/search`
- `/openapi.json`
- `/api/ical/all`

The inspection environment could not resolve `santosdodia.com` or `www.santosdodia.com`, and the web retrieval layer returned cache-miss or safe-open errors. This is an inspection-capability limitation and is not evidence that production is unavailable.

No deployment or release retry was performed.

## Remaining P0 checks

1. Confirm in the Cloudflare dashboard that Branch control actively deploys `main`.
2. Run and retain successful output for:
   - `npm run check`
   - `npm run cloudflare:build`
3. Validate canonical-domain and apex redirect behaviour from an environment with working DNS.
4. Exercise the documented REST, OpenAPI and ICS endpoints against production.
5. Populate the controlled source snapshot and retain source-health results.
6. Complete editorial review dates and source-status remediation for curated records.

## Release rule

P0 must remain open until the live checks above are evidenced. A crawler result, search-engine cache or successful repository commit is not a substitute for production HTTP verification.
