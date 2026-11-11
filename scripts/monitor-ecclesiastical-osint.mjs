import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_HOSTS = new Set(['press.vatican.va']);
const MAX_BYTES = 3_000_000;
const TIMEOUT_MS = 20_000;
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'generated', 'osint');

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&rsquo;/gi, '’')
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&agrave;/gi, 'à')
    .replace(/&egrave;/gi, 'è')
    .replace(/&eacute;/gi, 'é');
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function htmlToParagraphs(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const paragraphs = [];
  for (const match of cleaned.matchAll(/<(?:p|h1|h2|h3|h4|li)[^>]*>([\s\S]*?)<\/(?:p|h1|h2|h3|h4|li)>/gi)) {
    const text = stripTags(match[1]);
    if (text) paragraphs.push(text);
  }
  return paragraphs;
}

function isChangeHeading(value) {
  return value.length <= 260 && /^(?:Resignation|Appointment|Succession|Transfer|Election|Erection|Suppression|Renaming|Death|Creation of Cardinals|Resignation and|Appointment and)/i.test(value);
}

function extractSections(html) {
  const paragraphs = htmlToParagraphs(html);
  const sections = [];
  let current;
  for (const paragraph of paragraphs) {
    if (isChangeHeading(paragraph)) {
      if (current?.body.length) sections.push(current);
      current = { heading: paragraph, body: [] };
      continue;
    }
    if (current) current.body.push(paragraph);
  }
  if (current?.body.length) sections.push(current);

  const seen = new Set();
  return sections
    .map(section => ({ heading: section.heading, body: section.body.join(' ').replace(/\s+/g, ' ').trim() }))
    .filter(section => {
      const key = sha256(`${section.heading}\n${section.body}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return section.body.length >= 40;
    });
}

async function readLimitedBody(response, url) {
  const declaredLength = Number(response.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BYTES) throw new Error(`Declared response exceeds ${MAX_BYTES} bytes: ${url}`);
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new Error(`Response exceeds ${MAX_BYTES} bytes: ${url}`);
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks, total);
}

async function fetchText(url) {
  const parsed = new URL(url);
  if (!ALLOWED_HOSTS.has(parsed.hostname)) throw new Error(`Host not allowed: ${parsed.hostname}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(parsed, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'SantosDoDia-OSINT-Monitor/1.0 (+https://www.santosdodia.com/copyright)'
      }
    });
    const finalUrl = new URL(response.url);
    if (!ALLOWED_HOSTS.has(finalUrl.hostname)) throw new Error(`Redirected host not allowed: ${finalUrl.hostname}`);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const buffer = await readLimitedBody(response, url);
    return {
      text: buffer.toString('utf8'),
      etag: response.headers.get('etag') ?? undefined,
      lastModified: response.headers.get('last-modified') ?? undefined,
      contentType: response.headers.get('content-type') ?? 'text/html'
    };
  } finally {
    clearTimeout(timeout);
  }
}

function bulletinLinks(indexHtml, indexUrl) {
  const links = [];
  for (const match of indexHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = stripTags(match[2]);
    if (!/Resignations and Appointments/i.test(label)) continue;
    const url = new URL(match[1], indexUrl);
    if (ALLOWED_HOSTS.has(url.hostname)) links.push(url.toString());
  }
  return [...new Set(links)];
}

function dateFromUrl(url) {
  const match = url.match(/\/pubblico\/(\d{4})\/(\d{2})\/(\d{2})\//);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined;
}

function targetMonths(now) {
  if (process.env.OSINT_YEAR && process.env.OSINT_MONTH) {
    return [{ year: String(process.env.OSINT_YEAR), month: String(process.env.OSINT_MONTH).padStart(2, '0') }];
  }
  return [-1, 0].map(offset => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    return { year: String(date.getUTCFullYear()), month: String(date.getUTCMonth() + 1).padStart(2, '0') };
  });
}

function contentFingerprint(indexes, documents, failures) {
  return sha256(JSON.stringify({
    indexes: indexes.map(index => ({ url: index.url, contentHash: index.contentHash })),
    documents: documents.map(document => ({
      url: document.url,
      publishedAt: document.publishedAt,
      contentHash: document.contentHash,
      sections: document.sections
    })),
    failures
  }));
}

async function existingFingerprint(filePath) {
  try {
    const existing = JSON.parse(await readFile(filePath, 'utf8'));
    return typeof existing.contentFingerprint === 'string' ? existing.contentFingerprint : undefined;
  } catch {
    return undefined;
  }
}

async function main() {
  const now = new Date();
  const fetchedAt = now.toISOString();
  const indexes = [];
  const allLinks = [];
  const failures = [];

  for (const target of targetMonths(now)) {
    const url = `https://press.vatican.va/content/salastampa/en/bollettino/pubblico/${target.year}/${target.month}.html`;
    try {
      const index = await fetchText(url);
      indexes.push({ url, contentHash: sha256(index.text), etag: index.etag, lastModified: index.lastModified });
      allLinks.push(...bulletinLinks(index.text, url));
    } catch (error) {
      failures.push({ url, stage: 'index', error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (!indexes.length) throw new Error('No official source index could be fetched.');
  const documents = [];
  for (const url of [...new Set(allLinks)]) {
    try {
      const page = await fetchText(url);
      documents.push({
        sourceId: 'holy-see-bulletin',
        url,
        publishedAt: dateFromUrl(url),
        contentHash: sha256(page.text),
        etag: page.etag,
        lastModified: page.lastModified,
        contentType: page.contentType,
        sections: extractSections(page.text)
      });
    } catch (error) {
      failures.push({ url, stage: 'document', error: error instanceof Error ? error.message : String(error) });
    }
  }

  indexes.sort((a, b) => a.url.localeCompare(b.url));
  documents.sort((a, b) => a.url.localeCompare(b.url));
  failures.sort((a, b) => `${a.url}:${a.stage}`.localeCompare(`${b.url}:${b.stage}`));
  const fingerprint = contentFingerprint(indexes, documents, failures);
  await mkdir(OUTPUT_DIR, { recursive: true });
  const filePath = path.join(OUTPUT_DIR, 'holy-see-latest.json');
  const previousFingerprint = await existingFingerprint(filePath);
  if (previousFingerprint === fingerprint) {
    console.log('No official source changes detected across the monitored month boundary.');
    return;
  }

  const output = {
    schemaVersion: 2,
    sourceId: 'holy-see-bulletin',
    indexUrls: indexes.map(index => index.url),
    fetchedAt,
    contentFingerprint: fingerprint,
    indexes,
    documentCount: documents.length,
    sectionCount: documents.reduce((sum, document) => sum + document.sections.length, 0),
    failureCount: failures.length,
    documents,
    failures
  };

  await writeFile(filePath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${filePath}: ${output.documentCount} documents, ${output.sectionCount} sections, ${output.failureCount} failures.`);
  if (!documents.length && allLinks.length) process.exitCode = 2;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
