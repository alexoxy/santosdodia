import { SUPPORTED_LOCALES } from "../../lib/i18n";
import { CATEGORIES, TRADITIONS } from "../../data/observances";
import { SITE_ORIGIN } from "../../lib/site";

export async function GET() {
  const filterParameters = [
    {
      name: "locale",
      in: "query",
      schema: { type: "string", enum: SUPPORTED_LOCALES },
    },
    {
      name: "tradition",
      in: "query",
      schema: { type: "string", enum: TRADITIONS },
    },
    {
      name: "category",
      in: "query",
      schema: { type: "string", enum: CATEGORIES },
    },
    {
      name: "country",
      in: "query",
      schema: { type: "string", minLength: 2, maxLength: 2 },
    },
  ];
  const document = {
    openapi: "3.1.0",
    info: {
      title: "Santos do Dia machine interface",
      version: "3.10.0",
      description:
        "Machine-readable saints, Christian Church calendars, a deterministic perennial liturgical calculator, verified official live media, ecclesiastical jurisdictions and religious leaders with traceable source tiers. Liturgical calendar filters are shared by JSON and subscribable ICS interfaces.",
    },
    servers: [{ url: SITE_ORIGIN }],
    paths: {
      "/api/v1/discover": {
        get: {
          summary:
            "Discover reviewed saints and observances by date or name",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            { name: "year", in: "query", schema: { type: "integer" } },
            {
              name: "locale",
              in: "query",
              schema: { type: "string", enum: SUPPORTED_LOCALES },
            },
            {
              name: "tradition",
              in: "query",
              schema: { type: "string", enum: TRADITIONS },
            },
          ],
          responses: {
            "200": {
              description: "Matching discovery topics and saint observances",
            },
          },
        },
      },
      "/api/v1/today": {
        get: {
          summary: "Observances for today or a selected date",
          parameters: [
            {
              name: "date",
              in: "query",
              schema: { type: "string", format: "date" },
            },
            ...filterParameters,
          ],
          responses: {
            "200": {
              description: "Approved observances for the selected date",
            },
          },
        },
      },
      "/api/v1/observances": {
        get: {
          summary:
            "List Church observances from curated, official and reference source tiers",
          parameters: [
            { name: "year", in: "query", schema: { type: "integer" } },
            {
              name: "month",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 12 },
            },
            {
              name: "date",
              in: "query",
              schema: { type: "string", format: "date" },
            },
            ...filterParameters,
          ],
          responses: {
            "200": {
              description:
                "Filtered observance list from the approved repository read model",
            },
          },
        },
      },
      "/api/v1/search": {
        get: {
          summary:
            "Search localized saint names, regions and traditions",
          parameters: [
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "year", in: "query", schema: { type: "integer" } },
            ...filterParameters,
          ],
          responses: { "200": { description: "Localized search results" } },
        },
      },
      "/api/v1/live": {
        get: {
          summary: "List verified official Christian live and media endpoints",
          description:
            "Returns the active generated registry maintained from reviewed official Church sources. Live URLs may change; canonical IDs, tradition, official source URLs, languages and verification dates are preserved for machine consumers.",
          parameters: [
            {
              name: "tradition",
              in: "query",
              schema: { type: "string", enum: TRADITIONS },
            },
          ],
          responses: {
            "200": {
              description:
                "Verified official Christian live/media registry and generation metadata",
            },
          },
        },
      },
      "/api/v1/religious-holidays": {
        get: {
          summary:
            "Religious public holidays and calculated Church dates by country and year",
          parameters: [
            {
              name: "country",
              in: "query",
              schema: {
                type: "string",
                minLength: 2,
                maxLength: 2,
                default: "PT",
              },
            },
            {
              name: "year",
              in: "query",
              schema: { type: "integer", minimum: 1970, maximum: 2100 },
            },
            {
              name: "locale",
              in: "query",
              schema: { type: "string", enum: SUPPORTED_LOCALES },
            },
            {
              name: "tradition",
              in: "query",
              schema: { type: "string", enum: ["all", ...TRADITIONS] },
            },
            {
              name: "mode",
              in: "query",
              schema: { type: "string", enum: ["countries"] },
            },
          ],
          responses: {
            "200": {
              description:
                "Country public holidays and fixed or movable liturgical dates",
            },
          },
        },
      },
      "/api/v1/liturgy": {
        get: {
          summary: "Complete Roman Catholic liturgy for any date",
          description:
            "Returns LitCal fields and falls back to the exact local LitCal mirror.",
          parameters: [
            {
              name: "date",
              in: "query",
              required: true,
              schema: { type: "string", format: "date" },
            },
            {
              name: "locale",
              in: "query",
              schema: { type: "string", enum: SUPPORTED_LOCALES },
            },
            {
              name: "kind",
              in: "query",
              schema: {
                type: "string",
                enum: ["general", "nation", "diocese"],
                default: "general",
              },
            },
            { name: "calendar", in: "query", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Complete daily liturgy and source metadata",
            },
          },
        },
      },
      "/api/v1/liturgical-calendar": {
        get: {
          summary: "Calculate Roman liturgical years, vestment colours and future movable dates from perennial rules",
          description:
            "Deterministic SantosDia calculation with no request-time external source. Returns the liturgical-year boundary, Sunday A/B/C cycle, weekday I/II cycle for date queries, season/week context, structural movable dates and Roman vestment-colour guidance. Stable colour codes are white, red, green, violet, black and rose; final colour is not inferred from season alone when the actual winning observance is not yet resolved. Jurisdiction policy is applied separately from the core computus.",
          parameters: [
            {
              name: "year",
              in: "query",
              description: "Liturgical year to calculate. If date is supplied without year, the liturgical year is derived from the date and First Sunday of Advent.",
              schema: { type: "integer", minimum: 1584, maximum: 4099 },
            },
            {
              name: "date",
              in: "query",
              description: "Optional civil date for season, week, liturgical-year, Lectionary-cycle and vestment-colour context.",
              schema: { type: "string", format: "date" },
            },
            {
              name: "church",
              in: "query",
              schema: { type: "string", enum: ["roman-catholic"], default: "roman-catholic" },
            },
            {
              name: "jurisdiction",
              in: "query",
              description: "Initial public jurisdiction policies: PT and GLOBAL.",
              schema: { type: "string", enum: ["PT", "GLOBAL"], default: "PT" },
            },
            {
              name: "locale",
              in: "query",
              description: "Localized labels are currently public in English, Portuguese, Spanish and Italian. Stable machine codes are language-neutral.",
              schema: { type: "string", enum: ["en", "pt", "es", "it"], default: "en" },
            },
          ],
          responses: {
            "200": {
              description: "Perennial Roman liturgical calculation, vestment-colour guidance and source-policy metadata",
            },
            "400": {
              description: "Unsupported jurisdiction, Church, date or year",
            },
          },
        },
      },
      "/api/v1/litcal/calendars": {
        get: {
          summary: "Discover LitCal general, national and diocesan calendars",
          responses: {
            "200": {
              description: "Calendar catalogue from LitCal or the local mirror",
            },
          },
        },
      },
      "/api/v1/ecclesiastical": {
        get: {
          summary:
            "List Churches, jurisdictions and verified active ecclesiastical office holders",
          description:
            "Served from the Santos do Dia canonical database without a runtime dependency on external directories. Filter leaders by Church, country or regional jurisdiction.",
          parameters: [
            {
              name: "entity",
              in: "query",
              schema: {
                type: "string",
                enum: ["all", "churches", "jurisdictions", "leaders"],
                default: "all",
              },
            },
            {
              name: "locale",
              in: "query",
              schema: { type: "string", enum: SUPPORTED_LOCALES },
            },
            {
              name: "church",
              in: "query",
              description:
                "Canonical Church identifier such as church:roman-catholic.",
              schema: { type: "string" },
            },
            {
              name: "country",
              in: "query",
              description: "ISO 3166-1 alpha-2 country code.",
              schema: { type: "string", minLength: 2, maxLength: 2 },
            },
            {
              name: "region",
              in: "query",
              description:
                "Canonical province or regional jurisdiction identifier, or stored geographic region code.",
              schema: { type: "string" },
            },
            {
              name: "limit",
              in: "query",
              description:
                "Maximum number of records returned per selected entity collection.",
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 50,
              },
            },
            {
              name: "offset",
              in: "query",
              description:
                "Zero-based offset applied to each selected entity collection.",
              schema: { type: "integer", minimum: 0, default: 0 },
            },
          ],
          responses: {
            "200": {
              description:
                "Localized, paginated Church, jurisdiction and active-office catalogue with source and geographic metadata",
            },
          },
        },
      },
      "/api/v1/context": {
        get: {
          summary: "Resolve request country, region and preferred locale",
          responses: {
            "200": {
              description: "Request context derived from trusted headers",
            },
          },
        },
      },
      "/api/v1/system/ingestion": {
        get: {
          summary: "Inspect the deployed OSINT candidate snapshot",
          responses: {
            "200": {
              description:
                "Candidate-only ingestion status; this endpoint never promotes content",
            },
          },
        },
      },
      "/api/ical/{feed}": {
        get: {
          summary: "Subscribable ICS liturgical calendar feed by Christian tradition",
          description:
            "Without year= the endpoint is a persistent rolling subscription serving the previous civil year, the current year and the next three years (Y-1 through Y+3), with a six-hour refresh hint. With year= it acts as a fixed annual snapshot. Locale, tradition, category and country filters mirror the JSON calendar API.",
          parameters: [
            {
              name: "feed",
              in: "path",
              required: true,
              schema: { type: "string", enum: ["all", ...TRADITIONS] },
            },
            {
              name: "year",
              in: "query",
              description: "Optional fixed snapshot year. Omit for an autonomous Y-1 through Y+3 rolling subscription.",
              schema: { type: "integer", minimum: 1900, maximum: 2200 },
            },
            ...filterParameters,
          ],
          responses: { "200": { description: "Subscribable or annual ICS calendar feed" } },
        },
      },
      "/api/ical/saint/{id}": {
        get: {
          summary: "ICS calendar feed for one saint or observance",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "locale",
              in: "query",
              schema: { type: "string", enum: SUPPORTED_LOCALES },
            },
          ],
          responses: {
            "200": { description: "Individual annual saint calendar" },
            "404": { description: "Saint not found" },
          },
        },
      },
    },
  };
  return Response.json(document, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
