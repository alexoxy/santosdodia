import { NextRequest } from 'next/server';
import { localeFromAcceptLanguage } from '../../../../lib/i18n';
import { countryFromHeaders, regionFromHeaders } from '../../../../lib/request-geo';

export async function GET(request: NextRequest) {
  return Response.json(
    {
      country: countryFromHeaders(request.headers),
      region: regionFromHeaders(request.headers),
      locale: localeFromAcceptLanguage(request.headers.get('accept-language'))
    },
    { headers: { 'Cache-Control': 'private, max-age=300' } }
  );
}
