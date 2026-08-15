# Liturgical calendar product

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
