# Data staging and promotion policy

_Last updated: 2026-08-03_

## Mandatory architecture

For external datasets used by Santos do Dia, the normal lifecycle is:

1. external source or API;
2. dated raw file archive in Dropbox;
3. checksum and provenance manifest;
4. normalized files in Dropbox;
5. validation queues in Dropbox;
6. transactional database migration or seed;
7. controlled load into the site's canonical database;
8. publication through the site's API and pages.

The Dropbox staging root for the ecclesiastical directory is:

`/Santos do Dia/02_Dados_Eclesiasticos`

The same pattern should be used for comparable imports when an external API is incomplete, unavailable, rate-limited, unstable or unsuitable for runtime use.

## Responsibilities

- GitHub contains code, schemas, parsers, validation rules and reproducible build logic.
- GitHub Actions may fetch bounded samples and generate private workflow artifacts, but it must not receive the user's Dropbox credentials.
- Dropbox is managed through the user's connected assistant access and acts as the archive, normalization and recovery checkpoint.
- The production database contains only approved canonical records and source assertions.
- The public site reads the production database, never Dropbox or third-party directories at request time.

## Required Dropbox layers

- `00_Fontes_Brutas`: immutable dated source responses, exact-byte recovery encodings and source manifests.
- `01_Dados_Normalizados`: parsed people, Churches, jurisdictions, offices and events.
- `02_Validacao`: approved, provisional, rejected and audit-report queues.
- `03_Base_Dados`: migrations, seeds, exports and backups.
- `04_Publicacao_Site`: promotion manifests and publication reports.
- `99_Manifestos`: source registry, checksums and provenance policy.

## Promotion gate

A dataset may be promoted to the site database only when all of the following are true:

- raw input is archived in Dropbox;
- source URL, retrieval time, content type and SHA-256 are recorded;
- parser output passes schema and semantic validation;
- false persons, vacancies, navigation labels and malformed office boundaries are rejected;
- encoding defects are resolved;
- reference-directory facts meet the corroboration threshold;
- SQL load is transactional and idempotent;
- rollback material is available;
- a publication manifest identifies exactly which records were inserted, updated, closed or withheld.

## Failure behaviour

- Unexpected response types, empty payloads, parser structure changes or partial coverage fail closed.
- A failed refresh never deletes or replaces the last approved dataset.
- Provisional and rejected data remain archived for audit but do not enter the public database.
- Conflicting claims remain separate assertions with independent provenance.

## Recovery objective

If a source disappears, changes format or removes historical records, Santos do Dia must be able to rebuild its canonical database from the Dropbox archive plus the repository's parsers, schemas and migration history.
