# SantosDia — Perennial Liturgical Calendar Engine

Status: R1 autonomous calculation architecture  
Initial public kernel: Roman Catholic  
Initial jurisdiction policies: General Roman + Portugal

## Purpose

SantosDia must not require a human to upload or rewrite the next year's liturgical calendar. The normal annual case is deterministic:

`civil/calendar mathematics → Church/tradition kernel → jurisdiction policy → temporal candidates → precedence → annual occurrences → localized projections`

Official annual calendars remain essential evidence, but their normal role is **validation and change detection**, not request-time computation.

This makes the engine useful in three ways:

1. the SantosDia website can calculate future years without annual editorial work;
2. JSON/ICS/API consumers can request future liturgical structure directly;
3. external AI agents can use a stable, documented, language-neutral calculation surface.

## Source hierarchy

The machine-readable registry is `data/liturgical-rule-sources.json`.

### Normative authority

- Holy See / universal liturgical norms: structure and authority of the Roman liturgical year;
- competent territorial liturgical authority: jurisdictional calendar, transfers and local precedence;
- for Portugal, the Secretariado Nacional de Liturgia is the principal national reference used by this kernel.

### Cross-check and learning sources

The user-provided sources are deliberately retained because they expose useful computational or pedagogical structure:

- RJTX Computus: computus, epacts, Golden Number, movable feasts, Temporale/Sanctorale and historical calendar mechanics;
- Dehonianos: future-year calendar presentation, Ordinary Time week numbering, A/B/C labels and even/odd weekday-cycle examples;
- Diocese de Montenegro and Canção Nova: explanations of cycles and liturgical seasons;
- Grupo Santo Anselmo: explanatory liturgical-calendar material;
- Ghiorzi: perpetual civil-calendar cross-checking;
- Father Alexander: learning material for a future Byzantine/Orthodox kernel.

These references never override competent Church authority.

## Architectural rule: one interface, multiple kernels

A global Christian product cannot treat the Roman calendar as a universal template.

The common interface is:

```text
CalendarMath
  + TraditionKernel
  + JurisdictionPolicy
  + PrecedenceResolver
  = AnnualOccurrenceSet
```

Examples of future kernels:

```text
roman-catholic
byzantine-orthodox
coptic-orthodox
ethiopian-orthodox
armenian-apostolic
anglican-common-worship
```

They may reuse low-level calendar mathematics while preserving their own ecclesial logic.

## Roman kernel — perennial rules

### Liturgical year boundary

The Roman liturgical year begins on the First Sunday of Advent, i.e. the Sunday falling between 27 November and 3 December.

A civil year therefore contains portions of two liturgical years. Example:

- 1 November 2026 belongs to liturgical year 2026;
- 1 December 2026 belongs to liturgical year 2027.

The engine must expose this distinction explicitly.

### Sunday Lectionary cycle A/B/C

The Sunday cycle is attached to the liturgical year, not blindly to the civil year.

The deterministic mapping is:

```text
liturgicalYear mod 3 = 1 → A
liturgicalYear mod 3 = 2 → B
liturgicalYear mod 3 = 0 → C
```

Thus:

```text
2024 → B
2025 → C
2026 → A
2027 → B
```

The cycle changes on the First Sunday of Advent.

### Weekday cycle I/II

The Roman weekday Lectionary cycle follows civil-year parity:

```text
odd civil year  → I
even civil year → II
```

This means that after Advent begins in December, a date can legitimately have:

```text
Sunday cycle = new liturgical year's A/B/C
Weekday cycle = current civil year's I/II
```

The API must keep both values rather than collapsing them into a single `yearCycle` field.

## Paschal computus

Gregorian Easter is calculated locally by `lib/knowledge/calendar-engine.ts`. It is a mathematical anchor, not an annual lookup.

From Easter the Roman kernel derives, among others:

```text
Ash Wednesday      = Easter - 46 days
First Sunday Lent  = Easter - 42
Palm Sunday        = Easter - 7
Holy Thursday      = Easter - 3
Good Friday        = Easter - 2
Holy Saturday      = Easter - 1
Pentecost          = Easter + 49
Trinity Sunday     = Easter + 56
Sacred Heart       = Easter + 68
```

Ascension and Corpus Christi are calculated through jurisdiction policy because competent authorities may retain the traditional weekday or transfer the celebration.

## Jurisdiction policy

The algorithm and territorial policy are separate.

### General Roman policy

Initial general policy:

```text
Epiphany       → 6 January
Ascension      → Easter +39 (Thursday)
Corpus Christi → Easter +60 (Thursday)
```

### Portugal policy

Validated Portugal policy:

```text
Epiphany       → Sunday between 2 and 8 January
Ascension      → Easter +42 (VII Sunday of Easter)
Corpus Christi → Easter +60 (Thursday)
```

The Baptism of the Lord is then resolved from the actual Epiphany policy. When a transferred Epiphany falls on 7 or 8 January, the Baptism is celebrated on the following Monday; otherwise the Sunday after Epiphany is used.

This policy model is how additional countries must be added. Do not fork the computus for each country.

## Fixed Sanctorale and scope inheritance

The Sanctorale is not an annual list copied into runtime. A reviewed fixed observance is represented by a perennial rule with:

- a stable canonical `Observance` identity;
- fixed month/day, without an embedded year;
- an ecclesial scope such as General Roman, Europe or Portugal;
- liturgical rank and an explicit precedence class;
- claim-specific competent-authority evidence;
- verification date and stable rule ID.

A jurisdiction policy composes scopes from least to most specific. Portugal currently inherits:

```text
general-roman → europe → portugal
```

A more specific rule for the same Observance overrides the less specific one; it never creates a duplicate celebration. Evidence URLs must belong to the competent authority domains declared by the policy. Unknown scopes, duplicate jurisdiction policies, duplicate override slots, inconsistent rank/solemnity flags and untrusted evidence fail closed.

The current shadow set proves twenty-two fixed observances across those three scopes. Saint Joseph follows the complete Person → Recognition → Observance → annual Occurrence → perennial rule chain, including the real 2023 transfer from a Lent Sunday to 20 March. Saints Benedict and Bridget independently prove that Europe-scoped patronal feasts materialise into Portugal without collapsing Church, jurisdiction or locale. Saints Mark, Thomas, Mary Magdalene and James the Greater prove that several independently evidenced General Roman feasts can move through the same canonical pipeline as one reviewed batch without weakening identity, authority or publication gates. The apostolic batch adds Matthias, Bartholomew and Andrew as independent person commemorations, while Simon and Jude remain two Persons and two Recognitions joined by one multi-person Observance. Lawrence of Rome and Stephen the Protomartyr add two independently evidenced General Roman martyr feasts as complete individual Person → Recognition → Observance → annual Occurrence → perennial rule chains. Mary of Nazareth proves a different invariant: one canonical Person and one Roman Catholic Recognition can support three independent Observances — Divine Maternity, Assumption and Immaculate Conception — without merging their theological identities or leaking annual dates and ranks into Person or Observance. The set regenerates 2023, 2025 and 2026 through the same annual precedence/transfer engine and remains `publicationAllowed: false`. This is an architectural proof, not a public calendar switch. New rules are added only from canonical Observances and competent evidence, and the old production read model remains authoritative until full Portugal 2026 semantic equivalence is demonstrated.

## Source-bound Temporale and movable/transfer reconciliation

The Portugal 2026 reconciliation ledger consumes five reviewed TemporalRule shadow mappings: Ash Wednesday, the First Sunday of Lent, Easter Sunday, Pentecost Sunday and the First Sunday of Advent. It also consumes 47 precedence-surviving weekday members from the reviewed Lent and Easter TemporalRuleFamilies. A row is classified as `temporale` only when the canonical rule or family has competent Holy See evidence, its Gregorian computation resolves to the exact approved annual date, the read-only mapping remains bound to the approved Portugal release artifact and its legacy, canonical and source occurrence identities are unique. Every one of the 66 family candidates must have exactly one outcome: an exact source-bound occurrence or an explicit precedence suppression. Collisions with fixed Sanctorale bindings, unknown rules, mismatched years or dates, duplicate mappings, incomplete suppression partitions and untrusted authority evidence fail closed.

Eleven additional principal movable or transferred celebrations are kept in a separate annual shadow bound to the same immutable Portugal 2026 artifact. Palm Sunday, Holy Thursday, Good Friday, Holy Saturday, Trinity Sunday, Corpus Christi, the Sacred Heart and Christ the King must resolve directly from their universal TemporalRules. Epiphany, Ascension and the Immaculate Heart must first resolve to their universal base dates and then reproduce the exact Portugal destination through a reviewed `date-transfer` decision present in the explicit non-production overlay approval. The destination and the replacement at origin are both tied to their exact SNL source rows. A transfer cannot be inferred from labels, annual dates or proximity.

Those eleven rules are also exercised as 55 calculation vectors across the operational rolling window 2025-2029. Universal base calculation and Portugal jurisdiction-policy projection are separate assertions. Only the eleven 2026 vectors may claim annual equivalence because only that year is bound to the exact approved annual artifact; the other 44 results are calculation acceptance in shadow mode and create no annual Occurrence, source binding or migration coverage. The Immaculate Heart remains an annual-precedence candidate rather than a principal-day policy date. In 2028 its base date collides with the source-backed solemnity of the Nativity of Saint John the Baptist: the reduced precedence model proves that the feast is impeded on 24 June, but no destination or final annual disposition is invented without competent annual evidence.

Every fixed Sanctorale anchor is now also bound to the exact approved `build.json` row through `sourceOccurrenceId` and `sourceRecordHash` in the read-only fixed Sanctorale shadow. The ledger rejects missing mappings, artifact drift, date/rank disagreement, duplicate source identities and unreviewed memorial refinements. This closes the provenance gap between official annual evidence, canonical Occurrence, perennial rule and the immutable source artifact.

The current reconciliation therefore contains 52 `temporale` rows, 11 `movable-or-transfer` rows and 22 exact fixed Sanctorale rows: 85 source-bound days and 280 explicit unresolved days. Canonical migration coverage is likewise 85/389, leaving 304 legacy occurrences outside the canonical shadow. The 19 suppressed weekday candidates and the three replacement rows at transfer origins are evidence, not additional coverage. `publicationAllowed` and migration promotion both remain `false`; neither the public read path nor D1 production changes before complete semantic equivalence.

## Seasons

For a civil-date query the first Roman kernel resolves:

```text
Advent
Christmas Time
Ordinary Time (first segment)
Lent
Easter Time
Ordinary Time (second segment)
```

The engine also exposes structural days such as Ash Wednesday, Palm Sunday, Holy Thursday, Good Friday, Easter, Ascension, Pentecost and Christ the King.

### Paschal Triduum nuance

The liturgical day is not always identical to a midnight-to-midnight civil day. The Paschal Triduum begins with the Evening Mass of the Lord's Supper on Holy Thursday; Sundays and solemnities may begin with First Vespers on the preceding evening.

The v1 calculator is intentionally a **civil-date context calculator** and states this boundary in its API metadata. A future time-aware liturgical-day resolver may add local clock/timezone semantics without changing the annual kernel.

## Ordinary Time week numbering

Ordinary Time is discontinuous.

The first segment begins after the Baptism of the Lord and stops before Ash Wednesday. The second segment resumes after Pentecost.

The second segment must not be numbered by simply counting forward from Pentecost. It is anchored against the end of the year, with Christ the King as the 34th Sunday of Ordinary Time. This is why the engine can correctly reproduce examples such as:

```text
1 June 2026 → IX Week of Ordinary Time
7 June 2026 → 10th Sunday of Ordinary Time
```

without storing those dates in a 2026 table.

## Candidate generation is not publication

A recurring temporal family creates **candidates**, not automatically published occurrences.

Example:

```text
Lent weekday rule
  ↓
19 March candidate feria
  ↓
precedence resolver
  ↓
St Joseph wins
```

The current Portugal 2026 shadow migration proves this with Lent and Easter weekday families:

```text
66 mathematical candidates
47 survive as temporal occurrences
19 are suppressed by selected/higher-precedence celebrations
```

This separation is mandatory for any future autonomous annual generator.

## Precedence

Precedence is a first-class domain model, not a post-processing patch.

The Portuguese SNL precedence table and universal Roman norms distinguish, among other classes:

- Paschal Triduum;
- Christmas, Epiphany, Ascension and Pentecost;
- Sundays of Advent, Lent and Easter;
- Ash Wednesday and Holy Week weekdays;
- solemnities;
- feasts of the Lord;
- Sundays of Christmas and Ordinary Time;
- feasts and memories;
- ferial days.

The autonomous engine must generate candidates first, rank them through the applicable Church/jurisdiction table, and retain evidence for both the selected occurrence and suppressed candidates.

## Annual autonomy

Normal yearly operation must be:

```text
1. select Church/tradition kernel
2. select jurisdiction policy
3. calculate mathematical anchors
4. generate temporal candidates
5. load fixed Observances from the canonical graph
6. apply scope/jurisdiction
7. resolve precedence and transfers
8. emit Occurrences
9. project locale labels
10. generate HTML / JSON / JSON-LD / ICS
11. compare against available official annual evidence
12. publish automatically if all deterministic acceptance gates pass
```

No human should be required merely because 31 December became 1 January.

Human review remains required for **rule changes or ambiguous canonical changes**, not for routine application of known rules.

## Change monitoring

`data/liturgical-rule-sources.json` marks normative sources for periodic change detection.

The intended behavior is:

```text
source unchanged → no work
source formatting changed but semantic hash unchanged → archive receipt only
normative semantic change detected → freeze affected automatic promotion + review queue
new annual official calendar agrees with kernel → validation receipt
annual official calendar disagrees → fail closed + diff report
```

The last-known-good kernel remains available during source outages.

## Public human tool

Canonical surface:

`/tools/liturgical-calendar`

Initial public languages:

- Portuguese;
- English;
- Spanish;
- Italian.

The interface allows selection of year/date and Roman jurisdiction policy and shows:

- liturgical-year span;
- Sunday A/B/C cycle;
- weekday I/II cycle for a selected date;
- season and week;
- structural movable dates;
- API equivalent.

More locales should use the standard SantosDia locale readiness gate rather than machine-only publication.

## Public machine interface

Endpoint:

`/api/v1/liturgical-calendar`

Examples:

```text
/api/v1/liturgical-calendar?year=2035&jurisdiction=PT&locale=pt
/api/v1/liturgical-calendar?date=2026-12-01&jurisdiction=PT&locale=pt
/api/v1/liturgical-calendar?year=2050&jurisdiction=GLOBAL&locale=en
```

The response includes:

- engine/version;
- Church and jurisdiction IDs;
- liturgical year start/end;
- A/B/C Sunday cycle;
- I/II weekday cycle for date queries;
- season/week;
- structural dates;
- policy/authority metadata;
- explicit statement that no request-time external source is used.

The endpoint is CORS-enabled and cacheable so other AI systems can use it directly.

## Supported range

The initial public Roman kernel deliberately exposes Gregorian years 1584–4099. This is a software validation boundary, **not an annual maintenance horizon**. No year-specific file is required inside that range.

Future versions may widen the numerical range after replacing remaining JavaScript `Date` arithmetic with pure proleptic civil-date arithmetic and adding historical-calendar policy where needed.

## Next kernels

The Father Alexander material is evidence that the Byzantine year must not be forced into Roman concepts. A future Byzantine kernel should model its own:

- Paschalion;
- movable/fixed cycles;
- Triodion;
- Pentecostarion;
- Octoechos/eight-tone cycle where applicable;
- fasting rules;
- jurisdiction/calendar-style differences.

It will share calendar-conversion primitives and API shape, but not Roman A/B/C or Roman precedence semantics.
