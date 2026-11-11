# Global ecclesiastical directory

_Last updated: 2026-08-03_

## Product objective

Allow a visitor to discover current Christian leaders by Church, country, region and jurisdiction, open a source-traceable profile, and understand the office currently held.

The directory is not limited to heads of Churches. It is designed for primates, patriarchs, catholicoi, metropolitans, archbishops, diocesan and auxiliary bishops, apostolic administrators, exarchs, vicars and equivalent current office holders.

## Source hierarchy

1. Official Church, patriarchate, province, diocese or jurisdiction directory.
2. Official appointment, resignation or succession bulletin.
3. Academic directory maintained by a recognised institution.
4. Specialist independent reference directory.
5. Corroborated open-source research.

A specialist directory can create or update a provisional assertion, but it cannot silently replace a conflicting authoritative assertion.

## Initial source network

### Catholic

- Holy See Press Office: authoritative appointment and resignation events.
- Catholic-Hierarchy: worldwide current and historical bishops and dioceses; reference source.
- GCatholic: jurisdictions, leaders, regional indexes and appointment events; reference source.
- National episcopal conferences and diocesan websites: authoritative current local office holders.

### Eastern and Oriental Orthodox

- Orthodoxia, maintained through the University of Fribourg ecosystem: academic worldwide bishops directory.
- Official patriarchate, autocephalous Church and autonomous Church directories.
- Orthodox Church in America world-Church directory.
- Greek Orthodox Archdiocese annual directory.
- Official Coptic, Armenian, Ethiopian and Syriac Church directories.

### Anglican

- Anglican Communion Office member-Church and province records.
- Official province and diocesan directories for primates and bishops.

## Dropbox staging architecture

All external data passes through the policy defined in [`docs/data-staging-policy.md`](data-staging-policy.md).

The ecclesiastical directory staging root is:

`/Santos do Dia/02_Dados_Eclesiasticos`

The mandatory flow is:

1. external source;
2. immutable dated raw archive in Dropbox;
3. checksums and provenance manifest;
4. normalized files in Dropbox;
5. approved, provisional or rejected validation queue;
6. transactional database migration or seed;
7. controlled load into the site's canonical database;
8. publication through the site API and pages.

GitHub does not receive the user's Dropbox credentials. GitHub Actions may generate a temporary audited staging artifact, but it does not commit generated source data to `main` and does not publish it to the site. The archive and normalization checkpoint is managed through the user's connected Dropbox access.

## Data retained locally

The Santos do Dia data estate retains:

- canonical Church and jurisdiction identifiers;
- geographic hierarchy: global Church, continent, country, region, province and diocese;
- people, aliases and source-specific identifiers;
- current and historical offices with appointment, installation and end dates;
- each source assertion independently;
- retrieval date, source URL, HTTP metadata and content hash;
- exact or recoverable source snapshots in Dropbox where permitted;
- normalized files and validation decisions in Dropbox;
- database migrations, seeds, exports and backups;
- sync-run status and parser failures.

This means that the public product does not require an external directory, API or Dropbox to be online at request time. External sources refresh the staged archive; only the approved canonical database renders a user request.

## Conflict and publication rules

- A current office is publishable with one authoritative source or two independent corroborating sources.
- An independent directory alone is labelled provisional until corroborated.
- Conflicting claims remain separate assertions; the most authoritative current assertion is selected for display.
- Resignation, death, transfer and succession events close the previous office rather than deleting it.
- Historical facts are retained even when the source page later disappears.
- Every public profile exposes source links, last verification date and confidence state.
- No source response can move directly from a parser into the public database.

## Import sequence

1. Archive each bounded source response and checksum in Dropbox.
2. Complete the source registry and database schema.
3. Correct and validate each parser against archived samples.
4. Import the Catholic jurisdiction graph by country and region into normalized Dropbox files.
5. Import current Catholic office holders, then corroborate changes against Holy See bulletins.
6. Promote only approved Catholic records into the canonical database.
7. Import Orthodox and Oriental Orthodox Church structures and bishops through Orthodoxia plus official Church directories.
8. Import Anglican provinces, dioceses, primates and bishops from Communion and province sources.
9. Add source-specific incremental monitors for appointments, resignations, deaths and jurisdiction changes.
10. Run duplicate resolution using source identifiers, normalized names, birth dates and office history.
11. Publish only records that meet the verification threshold.

## Operational constraints

- Respect robots directives, source terms, explicit crawl restrictions and reasonable request rates.
- Use a descriptive Santos do Dia user agent and contact/copyright page.
- Prefer incremental refreshes and conditional requests over full repeated crawling.
- Stop a source adapter when page structure changes materially; never publish parser guesses.
- Unexpected content types, empty responses and partial imports fail closed.
- A failed refresh never replaces the last approved Dropbox dataset or public database state.
- Do not copy third-party editorial biographies verbatim. Store factual fields, source assertions and short normalized descriptions written independently.

## User experience

The public directory provides:

- full-text search by person, title, Church or jurisdiction;
- filters by Church, country and region;
- Church-specific colour treatment consistent with calendars and observances;
- leader profiles with office history and source evidence;
- jurisdiction pages linking the local hierarchy and current office holders;
- API access to the same verified canonical data.
