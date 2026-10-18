# Calendar routes

## Global context acceptance

All calendar surfaces follow [the global calendar context contract](../../docs/global-calendar-context-contract.md). Country, language, Church/rite, jurisdiction/institute, calendar system and timezone must be resolved independently. Language changes preserve observance membership; country changes preserve language and use the appropriate supported calendar. Apply the Joana acceptance case and equivalent-context parity for Today, Calendar, API and ICS. These are acceptance requirements, not a claim that every existing route already complies.

- `/calendar` — browse the canonical liturgical calendar.
- `/calendar/subscribe` — build a persistent ICS/webcal subscription or annual ICS snapshot.
- `/calendar/api` — JSON and OpenAPI integration guide.

These routes are product surfaces over the same reviewed calendar read model. Do not fork calendar data or create separate calendars per UI surface.
