# Multi-Church calendar pipeline

## Objective

Build reliable Roman Catholic, Anglican, Byzantine Orthodox, Coptic Orthodox, Armenian Apostolic, Ethiopian Orthodox Tewahedo and Syriac Orthodox calendars without making the public site depend directly on a third-party API or website.

## Authoritative flow

```text
Official/reference source
  → dated Dropbox raw snapshot and source manifest
  → normalized Dropbox staging package
  → validation report and approval state
  → guarded SQL promotion package
  → D1 staging tables
  → public calendar/API/ICS queries
```

The Dropbox layer is mandatory. A source response must never be written directly to the production database.

## Source hierarchy

1. Official Church source.
2. Official patriarchate, synod, archdiocese or jurisdiction source.
3. Official local Church source.
4. Maintained calculation engine.
5. Reference directory.
6. OSINT corroboration.

Reference directories and OSINT may detect changes or fill a documented gap, but cannot silently override an official calendar.

## Dropbox layout

```text
/Santos do Dia/02_Dados_Eclesiasticos/
├── 00_Fontes_Brutas/Fontes_Oficiais/Calendarios_Igrejas/YYYY-MM-DD/
├── 01_Dados_Normalizados/calendarios/
├── 01_Dados_Normalizados/regras_datas_moveis/
├── 02_Validacao/provisorios/
├── 02_Validacao/aprovados/
├── 02_Validacao/rejeitados/
├── 02_Validacao/relatorios/
├── 03_Base_Dados/migrations/
├── 03_Base_Dados/seeds/
└── 99_Manifestos/
```

Each run retains source URLs, retrieval timestamps, checksums, authority tier, usage/copyright notes and the validation report that governed promotion.

## Calendar engines

### Western Gregorian

Used for Roman Catholic and Anglican movable dates. Gregorian Easter is the anchor. Jurisdictional transfers and omissions remain explicit policies and must not be folded into the universal rule.

### Byzantine Paschalion

Used for Greek and Eastern Orthodox Pascha-dependent events. Fixed-date policy is jurisdiction-specific: some Churches use Revised Julian/Gregorian fixed dates and others retain Julian fixed dates.

### Coptic native calendar

Coptic dates must be stored as native month/day values and converted per civil year. A generic Byzantine calculation is not acceptable. Coptic leap-year effects and the Alexandrian Paschal cycle need dedicated tests.

### Ethiopian native calendar

Ethiopian dates must retain native month/day and year-cycle context. The Ammonius movable cycle requires a separate engine. Ethiopian saints' dates must not be inferred from the Coptic calendar.

### Armenian annual source

The official Mother See annual calendar is the initial source of truth. Reusable rules are generalized only after multiple official years agree.

### Syriac annual source

Official annual or jurisdictional calendars are used first. Universal rules are generalized only after current patriarchal and jurisdictional practice is reconciled.

## Database model

Migration `db/migrations/0001_multichurch_calendar.sql` creates:

- `calendar_import_runs`: Dropbox manifest and validation lineage;
- `calendar_sources`: source authority and usage policy;
- `jurisdiction_calendar_policies`: engine and fixed-date policy by Church/jurisdiction;
- `calendar_rules`: fixed, movable, native-calendar and transfer rules;
- `calendar_occurrences`: materialized dates for a civil year;
- `calendar_occurrence_labels`: multilingual names and translation status.

The database is not configured in `wrangler.jsonc` yet. Adding the D1 binding and running the migration are separate controlled deployment steps.

## Staging contract

`data/schema/calendar-staging.schema.json` defines the normalized package. The package contains a run record, sources, policies, rules, occurrences and labels.

Generate SQL with:

```bash
npm run calendar:sql -- \
  --input /path/to/dropbox-export/calendar-staging.json \
  --output /path/to/calendar-staging.sql
```

The generator rejects:

- a package outside the approved Dropbox staging root;
- broken source/rule/occurrence references;
- duplicate identifiers;
- publishable records below `cross-checked` validation;
- publishable data from a run that is not `validated`;
- publishable occurrences without accepted English and Portuguese labels;
- labels marked missing or rejected.

Generated SQL uses one immediate transaction and preserves the Dropbox manifest path and checksum.

## Publication gate

An occurrence is public only when all conditions hold:

1. the source snapshot is archived in Dropbox;
2. the source and record provenance are complete;
3. the Church/jurisdiction calendar policy is known;
4. the date is official, cross-checked or produced by a verified engine;
5. conflicts and transfers are resolved or visible;
6. the canonical event identity is stable;
7. English and Portuguese labels are accepted;
8. other requested language labels pass their own quality checks;
9. the run is marked `validated`;
10. the occurrence is explicitly marked `publishable`.

No general release may convert provisional records into public records implicitly.

## Copyright boundary

Store factual dates, identifiers, source metadata, short factual descriptors and permitted source snapshots. Do not reproduce saints' lives, icons, readings or substantial liturgical text unless the source licence or permission expressly allows it.

## Delivery sequence

1. Validate the engine-policy branch.
2. Export the first approved Dropbox staging package.
3. Generate and inspect SQL locally/CI.
4. Add the Cloudflare D1 database and binding.
5. Apply the migration to staging, not production.
6. Build a read adapter for calendar/API/ICS.
7. Compare database output with the current calculated calendar.
8. Promote one Church/jurisdiction at a time.
9. Publish only after language and date regression tests pass.
