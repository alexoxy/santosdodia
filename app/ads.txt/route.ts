import { adsenseSellerId } from '../../lib/adsense';

export const dynamic = 'force-dynamic';

export async function GET() {
  const seller = adsenseSellerId();
  if (!seller) {
    return new Response('# Advertising seller not configured\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(`google.com, ${seller}, DIRECT, f08c47fec0942fa0\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
