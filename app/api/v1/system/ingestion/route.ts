import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'generated', 'osint', 'holy-see-latest.json');
  try {
    const snapshot = JSON.parse(await readFile(filePath, 'utf8')) as {
      schemaVersion?: number;
      sourceId?: string;
      indexUrl?: string;
      fetchedAt?: string;
      contentFingerprint?: string;
      documentCount?: number;
      sectionCount?: number;
      failureCount?: number;
      documents?: Array<{ publishedAt?: string; sections?: unknown[] }>;
    };
    const publishedDates = (snapshot.documents ?? []).map(document => document.publishedAt).filter((value): value is string => Boolean(value)).sort();
    return Response.json({
      status: 'ok',
      available: true,
      sourceId: snapshot.sourceId,
      indexUrl: snapshot.indexUrl,
      fetchedAt: snapshot.fetchedAt,
      fingerprint: snapshot.contentFingerprint,
      documents: snapshot.documentCount ?? 0,
      candidateSections: snapshot.sectionCount ?? 0,
      failures: snapshot.failureCount ?? 0,
      coverage: {
        firstPublishedAt: publishedDates[0],
        lastPublishedAt: publishedDates.at(-1)
      },
      publicationState: 'candidate-only'
    }, {
      headers: { 'cache-control': 'no-store' }
    });
  } catch {
    return Response.json({
      status: 'ok',
      available: false,
      sourceId: 'holy-see-bulletin',
      publicationState: 'candidate-only',
      message: 'No generated official-source snapshot is present in this deployment.'
    }, {
      headers: { 'cache-control': 'no-store' }
    });
  }
}
