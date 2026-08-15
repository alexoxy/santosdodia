# Google Search Console setup

## Ownership

Preferred: add `santosdodia.com` as a **Domain property** and verify it with the DNS TXT record supplied by Google Search Console.

Fallback: use an HTML-tag property verification token and configure:

`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>`

The root metadata emits the corresponding Google verification tag after the normal protected deployment.

## Discovery

Submit:

`https://www.santosdodia.com/sitemap.xml`

The sitemap deliberately separates useful daily calendar pages from editorial saint profiles. Minimal saint profiles remain reachable through the product but stay `noindex` until they receive a reviewed biography.

## Operating loop

- inspect homepage and new editorial profiles after publication;
- monitor indexing exclusions and crawl errors;
- monitor Core Web Vitals and mobile usability;
- review queries/pages/countries to decide which saints and traditions deserve deeper editorial coverage;
- use query data as editorial demand evidence, not as permission for keyword stuffing or low-value page generation;
- request indexing only for meaningful new or materially improved pages;
- keep canonical URLs, structured data and visible text consistent.

Search Console measures and diagnoses organic discovery; it does not guarantee rankings. The durable growth lever is a larger corpus of original, sourced, internally linked saint and calendar content.
