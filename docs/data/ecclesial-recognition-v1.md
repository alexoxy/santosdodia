# Ecclesial Recognition v1

Status: SantosDia v2 canonical data contract  
Effective: 2026-08-22

## Purpose

`Recognition` answers a narrower question than a saint page or a calendar:

> How does a specific Church or competent jurisdiction recognise this canonical Person?

It does **not** answer when the person is commemorated. It does **not** imply that the person appears in every calendar of that Church. It does **not** allow one Church's authority to establish another Church's recognition.

## Entity boundaries

### Person

A language-neutral historical identity. One Person can have zero, one or many Church-scoped Recognitions.

### Recognition

A current Church/jurisdiction-scoped state or assertion about a Person, for example `saint`, `blessed`, `venerable`, `servant-of-god` or an explicitly modelled equivalent.

Recognition carries its own evidence and authority scope.

### RecognitionEvent

A historical event that changed or formally declared recognition, for example a beatification or canonisation. This is temporal history, not the current state itself.

The existing D1 table `sanctity_recognition_events` is therefore retained as an event model. SantosDia must not insert current Recognition state into that table merely because the names are similar.

### Observance

A Church/jurisdiction/calendar-scoped liturgical commemoration or feast.

A Recognition does not create an Observance automatically.

### Occurrence

A dated instance of an Observance after calendar-system, jurisdiction, transfer and precedence rules have been applied.

Recognition never owns occurrence dates.

## Canonical Recognition fields

The v1 canonical release uses:

- `recognitionId`
- `personId`
- `churchId`
- `jurisdictionId`
- `recognizedAs`
- `recognitionBasis`
- `ecclesialTitles[]`
- `scope`
- `evidence[]`
- `verifiedAt`
- `resolutionStatus`
- `deletionPolicy`

The following are explicitly forbidden from canonical Recognition state:

- feast/month/day/date;
- calendar system;
- liturgical rank;
- precedence;
- transfer rules.

Those belong to Observance/Occurrence.

## `recognizedAs` versus ecclesial titles

`recognizedAs` represents the recognition state. Titles/roles are separate.

Examples:

- Matthew: `recognizedAs = saint`; titles `apostle`, `evangelist`;
- Thomas Aquinas: `recognizedAs = saint`; titles `priest`, `doctor-of-the-church`.

This prevents `apostle`, `martyr`, `doctor-of-the-church`, `equal-to-the-apostles` and similar descriptors from being misused as substitutes for a Church-specific recognition state.

## Authority isolation

Every Recognition is scoped to one `churchId` and one `jurisdictionId`.

Examples:

- Holy See / Vatican evidence may support Roman Catholic Recognition claims within its competence;
- OCA evidence may support an Eastern Orthodox/OCA Recognition claim;
- GOARCH evidence may support the Greek Orthodox/GOARCH context it actually represents;
- Church of England evidence supports the represented Anglican context;
- none of these sources automatically establishes another Church's Recognition.

The canonical Person remains the bridge that allows the product to show that different Recognitions concern the same historical person.

## Evidence rules

Canonical Recognition requires competent ecclesial evidence. Discovery data is insufficient.

Wikidata recognition-status candidates remain discovery assertions until Church scope and competent evidence are resolved. They must never become canonical Recognition solely because Wikidata classifies an entity as a saint, blessed or equivalent.

Machine translation cannot create Recognition. A translated label may only project an already resolved canonical state.

## Bootstrap release

The first release is intentionally small and review-heavy. It includes only source-backed records already reviewed in the repository, including a deliberate multi-Church example for Matthew.

This is not a claim that all 13 current Person anchors have completed Recognition modelling. Missing Recognition is preferable to inferred Recognition.

## Future D1 projection

Do not reuse `sanctity_recognition_events` as the current-state store.

When runtime/D1 consumption becomes necessary, introduce an explicit current-state projection (for example `ecclesial_recognitions`) whose key includes Person + Church + jurisdiction + recognised state, while preserving `sanctity_recognition_events` as temporal history.

The migration must be additive first, with read-model equivalence tests before any legacy field is retired.
