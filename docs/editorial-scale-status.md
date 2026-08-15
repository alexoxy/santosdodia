# Editorial Scale status

_Last reviewed: 2026-08-15_

## Phase

Santos do Dia is in **Editorial Scale 1**: the product surface and calendar infrastructure are mature enough that the main growth constraint is now reviewed, publishable content rather than new unrelated features.

The expansion rule is content-first and evidence-first:

1. increase reviewed saint identities and observance links;
2. grow evergreen `/date/MM-DD` coverage only where public observance data exists;
3. turn independently verified profiles into substantive indexable biographies;
4. add evidence-backed thematic, place, Church and tradition hubs;
5. keep ambiguous, thin or single-source facts in staging/noindex state.

## Navigation corpus snapshot

The Dropbox navigation readiness snapshot observed on 2026-08-15 reported:

- 11,173 saint identity candidates in the global identity root;
- multilingual label coverage complete at entity level;
- 4,480 profile-enrichment records (40.1% of the identity root);
- 366 civil days represented in the Daily Saints sweep;
- global profile enrichment still incomplete;
- publication gate still closed for the broad staging corpus.

These numbers describe acquisition/enrichment readiness, not public editorial approval.

## First reviewed public-navigation pilot

The first publication ledger contains two identities whose Vatican News observances already have explicit cross-source review:

- `wikidata:Q43982` — 24 August;
- `wikidata:Q37278` — 26 August.

The public scope is deliberately **identity-observance-only**. The promotion pipeline may publish the reviewed identity/name/observance relationship, but it strips birth dates, death dates and places that currently originate only from profile enrichment before building the public navigation export.

A reviewed identity link and a publication decision are separate gates. Future additions require an explicit entry in `data/saint-navigation-publication.reviewed.json`; name matching never promotes content automatically.

## Monetization boundary

Editorial expansion must preserve the AdSense review state and the non-overlay product policy defined in `AGENTS.md` and `docs/monetization-status.md`. While AdSense remains **PREPARING**, serving stays disabled even though eligible page layouts are prepared for manual top + desktop content-rail units after approval.
