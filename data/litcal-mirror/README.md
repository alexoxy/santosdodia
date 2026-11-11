# LitCal operational mirror

This directory contains versioned responses from the upstream Liturgical Calendar API used by Santos do Dia.

## Retention model

- The previous calendar year, current year and following two years are mirrored.
- The General Roman Calendar is mirrored in every LitCal locale directly used by Santos do Dia.
- Every national and diocesan calendar announced by the upstream `/calendars` endpoint is mirrored in its native locale(s).
- The calendar catalogue, OpenAPI schema and decree catalogue are retained.
- If an upstream request fails, the last valid file remains in place and is marked stale in `manifest.json`.
- Historical years can be regenerated from the mirrored Apache-2.0 calculation engine in `vendor/litcal-api`.

## Source hierarchy

1. Live upstream LitCal API.
2. Exact response stored in this directory.
3. Locally mirrored LitCal calculation engine.
4. Curated Santos do Dia fallback and independent validation sources.

The files are not editorial rewrites. They preserve the upstream JSON response to make provenance and later reprocessing possible.
