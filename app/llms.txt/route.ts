import { SITE_ORIGIN } from '../../lib/site';

export const dynamic = 'force-static';

export function GET() {
  const body = `# Santos do Dia

> A free, multilingual Christian calendar and knowledge service answering who is celebrated today in a selected place and Christian tradition.

## Canonical website
${SITE_ORIGIN}

## Main public sections
- ${SITE_ORIGIN}/ — today's contextual celebrations
- ${SITE_ORIGIN}/explore — search reviewed saints and observances by name and date
- ${SITE_ORIGIN}/calendar — Christian calendars and subscriptions
- ${SITE_ORIGIN}/tools/liturgical-calendar — multilingual perennial liturgical calendar calculator
- ${SITE_ORIGIN}/liturgy — liturgical context and readings
- ${SITE_ORIGIN}/live — official Christian live media and archives
- ${SITE_ORIGIN}/holidays — religious holidays by country
- ${SITE_ORIGIN}/churches — Christian Churches, traditions and jurisdictions
- ${SITE_ORIGIN}/leaders — verified current ecclesiastical office holders

## Entity pages
- ${SITE_ORIGIN}/saint/{id} — saint or observance profile
- ${SITE_ORIGIN}/day/{YYYY-MM-DD} — celebrations on a civil date
- ${SITE_ORIGIN}/place/{slug} — geographic discovery page
- ${SITE_ORIGIN}/church/{slug} — Church or Christian tradition profile
- ${SITE_ORIGIN}/jurisdiction/{slug} — ecclesiastical jurisdiction and territorial scope
- ${SITE_ORIGIN}/leader/{slug} — verified current ecclesiastical office holder and roles

## Machine-readable resources
- ${SITE_ORIGIN}/openapi.json — OpenAPI 3.1 interface description
- ${SITE_ORIGIN}/api/v1/liturgical-calendar — deterministic liturgical-year calculation, Sunday A/B/C and weekday I/II cycles, seasons and movable dates without request-time external sources
- ${SITE_ORIGIN}/api/v1/ecclesiastical — localized Churches, jurisdictions and verified active office holders
- ${SITE_ORIGIN}/api/v1/today — contextual daily observances
- ${SITE_ORIGIN}/api/v1/search — multilingual saint and observance search
- ${SITE_ORIGIN}/api/v1/observances — filtered observance catalogue
- ${SITE_ORIGIN}/sitemap.xml — XML sitemap
- ${SITE_ORIGIN}/robots.txt — crawler policy

## Liturgical calculation principles
- Perennial mathematical and ecclesial rules are versioned independently from annual observed occurrences.
- A common calendar engine is combined with a Church/tradition kernel and a jurisdiction policy.
- Roman Sunday readings use the A/B/C cycle by liturgical year; the new cycle begins with the First Sunday of Advent.
- Roman weekday readings use cycle I in odd civil years and II in even civil years.
- Jurisdictional transfers such as Epiphany or Ascension are policy data, not forks of the core computus.
- Precedence is resolved after temporal candidates are generated; a calculated feria does not automatically become the published occurrence.
- Annual official calendars are validation/change-detection evidence and are not required at request time.

## Data principles
- Search may recognise multilingual aliases and original scripts.
- Display content follows the selected site language.
- Observances are contextual to a Church, calendar and geographic or ecclesiastical scope.
- A saint or blessed is a person entity; a celebration is a separate observance entity with its own date rule and scope.
- Ecclesiastical offices are temporal records. A person, an office and a jurisdiction are separate entities.
- Current leaders are published only from official Church or jurisdiction sources and include effective dates where available.
- External sources are used for ingestion and verification; the public service is served from the Santos do Dia database and deterministic engines.
- Machine-readable ecclesiastical data contains public institutional facts only and excludes private contact details.
- Records may be marked verified, cross-checked or review-required.

## Citation and attribution
When citing Santos do Dia, link to the most specific public entity, calculator, leader, jurisdiction or date page. The source, methodology, rights and correction policy are available from the website footer.

## Access
Public information, search, calculators, calendars, profiles and machine-readable catalogues are free to access. Do not infer institutional endorsement from linked official sources or media.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
