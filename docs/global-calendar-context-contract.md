# Global calendar context contract

Status: approved product direction from user instruction, 2026-10-18; implementation acceptance contract.
Scope: all SantosDia persons, traditions, research, editorial content, user preferences, public surfaces, APIs and feeds. This document does not certify that all runtime surfaces already satisfy the contract.

## Independent dimensions

| Dimension | Meaning | Must not imply |
|---|---|---|
| Interface locale | Language, translated labels and display formatting | Country, Church, rite, recognition or observance membership |
| Country | Geographic selection used to discover applicable supported calendars | A single Church, rite, timezone or national authority |
| Church body / tradition | Ecclesial context and competent authority | Language or civil nationality |
| Rite / liturgical use | Applicable liturgical practice within its Church | A calendar shared by every Church in that country |
| Jurisdiction and approved calendar | National/regional, diocesan, city, church/site, or institution-specific applicability | A ranking of the sanctity of persons |
| Religious institute | A separately evidenced institutional calendar, possibly spanning countries | A territorial child of one diocese in every case |
| Calendar system | Gregorian, Julian, Revised Julian or another supported date system | The set of celebrations or their liturgical rank |
| Timezone and selected date | Civil-day boundary and the requested date | A change of ecclesial recognition |

Country is a convenient selector, not an authority identifier. The mapping between country and calendars may be many-to-many. An episcopal conference can serve more than one civil territory; multiple Churches and rites can coexist within one country.

## Selection behavior

- Preserve explicit language, Church/rite and timezone choices when the country changes. Revalidate dependent diocese/site selections and visibly clear an incompatible selection; do not substitute another silently.
- Resolve the selected Church/rite and country to reviewed supported calendars. Where multiple calendars remain possible, present the relevant choice. Keep a documented general-calendar view visibly distinct from a verified national calendar.
- Changing only language changes presentation, not person IDs, observance membership, dates, rank or precedence. A missing translation gets a labelled language fallback; it never selects another country's calendar.
- Browser language and IP geography are suggestions only. They do not establish Church membership and must not overwrite an explicit saved choice.
- Unsupported national/local coverage must be labelled unavailable or incomplete. Do not invent a national calendar from the general one or use a shared language as a substitute.
- Every effective result displays enough context to identify its Church/rite, calendar jurisdiction and date.
- For unresolved source conflicts, retain evidence and mark the affected claim unresolved rather than choose the geographically most specific record blindly.

## Person and observance model

One reviewed person identity can have multiple recognition assertions, names and observances. Recognition is scoped to the Church and effective date, not inferred from a popular title or national origin. Historical identities must still be reviewed before cross-tradition merges.

An observance requires a stable identity, Church/rite, applicable calendar or jurisdiction, date rule and calendar system, rank in that context, authority/source, validity period, review state and provenance. It normally references one or more reviewed persons/subjects. When a competent authority explicitly defines an unenumerated collective commemoration, the Observance may instead be subjectless: it must use the dedicated `collective-commemoration` type, carry direct official evidence for the collective identity, and must not manufacture anonymous, placeholder or inferred Person/Recognition records. An officially attested commemoration of named non-human beings may likewise remain Observance-only: it uses a dedicated non-human type and stable `subjectlessKey`, preserves the official designation, and cannot coerce angels or other non-human beings into the human Person/Recognition model. Subjectless keys distinguish canonical Observances but do not create hidden subject entities. Preserve the original ecclesial term when ranks cannot be translated exactly.

Maintain national, diocesan, city/site and institutional applicability separately. They are resolved by the relevant Church's approved rules and decrees, including annual precedence and transfers. A simple geographical union, last-write-wins override, or universal rank attached to the person is insufficient.

Popular devotion, historical remembrance, recognition as saint/blessed, calendar membership, feast rank and legal holy-day obligation are separate assertions. Absence from a general calendar is not exclusion from the editorial catalogue. Worldwide popularity is not evidence of universal liturgical inscription.

## Source and authority policy

Apply the source competent for the exact claim, Church, jurisdiction and year. Prefer operative decrees and approved calendars/books. For Roman Catholic Portugal, use CEP/SNL and the relevant diocesan or institute proper; for other contexts, use their competent authorities.

Catholic Roman rules must not be imposed on Orthodox, Anglican, Eastern Catholic or other calendars. Their source selection and rank/precedence rules require separate validation. Language versions of the same publication are not independent corroborating sources.

OSINT news and reference databases can discover changes and corroborate identity. They cannot silently override a competent calendar. A calculated date alone does not prove an approved observance.

## Reference case: Joana of Portugal, 12 May 2026

| Calendar context | Documented rank |
|---|---|
| Portugal, Roman Catholic national context | Optional memorial |
| City of Aveiro | Solemnity |
| Other churches of the Diocese of Aveiro | Feast |
| Order of Preachers | Obligatory memorial |

Source: [SNL agenda, 12 May 2026](https://www.liturgia.pt/liturgiadiaria/dia.php?data=2026-5-12).
The SNL identifies her as blessed. Preserve the documented devotional name Santa Joana Princesa separately. These are four contextual observances of one candidate person, not four people. This example establishes no automatic identity binding or publication approval.

## Required propagation

| Surface | Acceptance requirement |
|---|---|
| Today, calendar, search and profiles | Consistent effective context; local and institutional observances labelled; profile can explain several contexts |
| Preferences and navigation | Language/country/Church are independent; incompatible dependent selections handled visibly |
| Research and editorial review | Scope, recognition, rank, authority and validity checked independently |
| Ingestion and staging | Retain every supported contextual assertion and provenance; reject unsupported scope widening |
| D1/public read model | Keep contextual distinctions through publication; no global rank on a person |
| JSON API and ICS | Same approved observance membership for equivalent effective context; persistent subscription semantics |
| HTML and structured data | Agree with the effective calendar; no claim of national coverage from language alone |
| Cache and URL handling | Include all result-affecting calendar dimensions; separate presentation locale; avoid cross-context contamination |
| Analytics | Measure context coverage without constructing religious advertising audiences |

## Acceptance examples for all future changes

1. Portugal / Roman Catholic / Portuguese to English: same approved observances, identity and rank, different presentation.
2. Portugal to another country with language fixed: resolve the supported calendar for the unchanged Church/rite; preserve language; do not reuse Portugal's national proper.
3. Changing Church with country fixed: resolve that Church's supported calendar; retain language and label unavailability.
4. Joana on 12 May 2026: national MF, Aveiro city solemnity, other diocesan churches feast, Dominican MO.
5. Choosing a religious institute does not silently replace country, language or Church; conflicts follow its documented calendar rules.
6. Unknown national coverage: show the gap, not an asserted official national result.
7. Equal effective contexts agree across Today, Calendar, API, ICS and structured data.
8. Changing timezone can change Today at a civil-day boundary; it does not change identity or rank for the same requested date/context.
9. A recognized local blessed remains discoverable in the editorial catalogue while liturgical placement follows reviewed scope.
10. A canonized person is not automatically assigned an obligatory universal calendar entry.

## Implementation audit and remaining work

Reviewed existing files: `lib/knowledge/jurisdiction-resolver.ts`, `app/api/v1/context/route.ts`, `lib/public-calendar-runtime.ts`, and calendar/product documentation.

Existing groundwork: jurisdiction matching is Church-scoped; context API returns country and locale separately; the public runtime passes country and tradition separately. This is not an end-to-end compliance result.

The inspected jurisdiction resolver expresses territorial specificity but its context does not expose a religious-institute dimension. The product document lists canonical diocese filtering as a next extension. Verify preferences, complete calendar membership, institute resolution, cache keys, API/ICS parity and the nine-case identity queue before claiming global implementation.

This change propagates the specification and review requirements. No application code, D1 schema/data, reviewed registry, public calendar, indexing or production deployment is changed.

## Normative and official references

- [SNL / General Instruction of the Roman Missal, chapter IX](https://www.liturgia.pt/docs/igmr_9.php): national or wider regional calendars and particular appendices.
- [Calendaria particularia, §§8–18, official Order of Preachers copy](https://www.op.org/wp-content/uploads/2026/05/Calendaria-Particularia-ENG.pdf): territorial and institutional calendars. Historical instruction; apply with current approved calendars and decrees.
- [Holy See, beatification/canonization distinction](https://www.vatican.va/roman_curia/congregations/csaints/documents/rc_con_csaints_doc_20050929_saraiva-martins-beatif_po.html).
- [Holy See, Roman Martyrology presentation](https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2001/10/02/0544/01548.html): canonization and universal calendar obligation are distinct.
- [USCCB calendar methodology](https://www.usccb.org/resources/liturgical-calendar-dioceses-united-states-america): general Roman calendar plus approved national proper.
- [SNL Joana profile](https://liturgia.pt/santos/santo_v.php?cod_santo=69).

Retrieval: 2026-10-18. Some SNL direct opens returned 403; indexed official content was available. No claim of unrestricted direct source access is made.
