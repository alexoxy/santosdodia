# Liturgical calendar product

## Country, language and Church selection — 2026-10-18

The [global calendar context contract](global-calendar-context-contract.md) is the required behavior for all delivery surfaces. Country selects applicable supported calendar options within the chosen Church/rite; language only selects presentation. Keep religious-institute and local-jurisdiction refinements explicit. Equivalent effective contexts must yield matching observance membership in Today, Calendar, JSON and ICS. A general-calendar fallback must be labelled and must never impersonate verified national coverage. Existing diocese/institute support still requires implementation verification; this document does not claim that rollout is complete.

The liturgical calendar is a core Santos do Dia product, not only a browsing page.

## One canonical calendar, three delivery surfaces

1. **Explore** — `/calendar`
   - human calendar browser;
   - Today/day/date pages consume the same canonical observance IDs.
2. **Sync** — `/calendar/subscribe`
   - persistent ICS/webcal subscription without `year=`;
   - current + following civil year are served on every refresh;
   - Apple Calendar, Google Calendar and Outlook entry points;
   - optional Church/tradition, country and category filters;
   - fixed annual ICS snapshot by adding `year=`.
3. **API** — `/calendar/api`
   - JSON observance API using the same filters;
   - OpenAPI contract at `/openapi.json`;
   - intended for apps, agents, websites and integrations.

## Product invariants

- Church/tradition identity is never silently merged.
- Country filters refine published observances; they do not rewrite canonical identity.
- Calendar-system provenance remains on the underlying observance data.
- Subscriptions use stable URLs and all-day VEVENT records.
- A subscription without `year=` is rolling; a request with `year=` is a fixed snapshot.
- ICS and JSON must resolve from the same approved public read model.
- External calendar clients control their own actual refresh cadence; the ICS feed advertises a six-hour refresh interval.
- Calendar sync remains useful independently of advertising and must never require an ad interaction.

## Next extensions

- canonical jurisdiction/diocese filter once jurisdiction-to-calendar membership is publication-ready;
- user-saved calendar presets without changing the public feed contract;
- stronger acceptance vectors asserting identical results across Today, Calendar, JSON and ICS;
- calendar subscription discovery from saint, Church and jurisdiction pages.
