# Editorial review — single-source curated records

_Initial review: 2026-08-02 · remediated: 2026-08-07_

## Scope

This review covers five curated records labelled `cross-checked` while carrying only one source. The review separates the observance-name/date claim from patronage claims.

## Results

| Record | Date reviewed | Institutional corroboration | Date/name conclusion | Patronage treatment |
| --- | --- | --- | --- | --- |
| `our-lady-lourdes` | 11 February | Official Sanctuary of Lourdes | Corroborated | Withheld in the review queue |
| `fatima` | 13 May | Official Shrine of Fatima | Corroborated | Withheld in the review queue |
| `anthony-lisbon` | 13 June | Patriarchate of Lisbon diocesan calendar | Corroborated, including local solemnity in Lisbon | Withheld in the review queue |
| `our-lady-carmel` | 16 July | Order of Carmelites | Corroborated | Withheld in the review queue |
| `teresa-avila` | 15 October | Holy See Teresian reference | Corroborated | Withheld in the review queue |

## Remediation decision

The five institutional references are now catalogued as independent sources for the observance identity and date. All five records have a sourced English and Portuguese editorial summary and a recorded review date of 2026-08-07.

Patronage strings are not inferred from the observance sources. All 39 previously public patronage claims and five additional place/association candidates were removed from the public read model and preserved in `data/editorial-patronage-review-queue.json` with publication status `withheld-pending-claim-evidence`.

The same gate now covers the 20 profession, cause and place topic candidates (33 saint-topic associations). Their definitions remain available for editorial work, but the public topic collection, sitemap, discovery API and static route generation stay empty until claim-level evidence supports promotion.

The quality gate now requires:

- a valid `lastVerified` date for every curated record;
- English and Portuguese editorial summaries;
- claim-level summary sources that also belong to the record source set;
- at least two independent sources for `cross-checked` records;
- zero patronage claims or association-topic pages in the public read model until claim-specific evidence exists.
