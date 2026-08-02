import { SITE_ORIGIN } from '../../lib/site';

export const dynamic = 'force-static';

export function GET() {
  const body = `# Santos do Dia

> A free, multilingual Christian calendar and knowledge service answering who is celebrated today in a selected place and Christian tradition.

## Canonical website
${SITE_ORIGIN}

## Main public sections
- ${SITE_ORIGIN}/ — today's contextual celebrations
- ${SITE_ORIGIN}/explore — search saints, dates, places, professions and patronages
- ${SITE_ORIGIN}/calendar — Christian calendars and subscriptions
- ${SITE_ORIGIN}/liturgy — liturgical context and readings
- ${SITE_ORIGIN}/live — official Christian live media and archives
- ${SITE_ORIGIN}/holidays — religious holidays by country
- ${SITE_ORIGIN}/churches — Christian Churches, traditions and jurisdictions

## Entity pages
- ${SITE_ORIGIN}/saint/{id} — saint or observance profile
- ${SITE_ORIGIN}/day/{YYYY-MM-DD} — celebrations on a civil date
- ${SITE_ORIGIN}/place/{slug} — geographic discovery page
- ${SITE_ORIGIN}/patronage/{slug} — patronage or profession page
- ${SITE_ORIGIN}/church/{slug} — Church or Christian tradition profile
- ${SITE_ORIGIN}/jurisdiction/{slug} — ecclesiastical jurisdiction and territorial scope

## Machine-readable resources
- ${SITE_ORIGIN}/api/openapi — OpenAPI documentation
- ${SITE_ORIGIN}/api/v1/system/status — calendar-engine and knowledge-base health
- ${SITE_ORIGIN}/sitemap.xml — XML sitemap
- ${SITE_ORIGIN}/robots.txt — crawler policy

## Data principles
- Search may recognise multilingual aliases and original scripts.
- Display content follows the selected site language.
- Observances are contextual to a Church, calendar and geographic or ecclesiastical scope.
- A saint or blessed is a person entity; a celebration is a separate observance entity with its own date rule and scope.
- External sources are used for ingestion and verification; the public service is served from the Santos do Dia database.
- Records may be marked verified, cross-checked or review-required.

## Citation and attribution
When citing Santos do Dia, link to the most specific public entity, jurisdiction or date page. The source, methodology, rights and correction policy are available from the website footer.

## Access
Public information, search, calendars and profiles are free to access. Do not infer institutional endorsement from linked official sources or media.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
