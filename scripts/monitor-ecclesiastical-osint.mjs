import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
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
        'accept': 'text/html,application/xhtml+xml',
        'user-agent': 'SantosDoDia-OSINT-Monitor/1.0 (+https://www.santosdodia.com/copyright)'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) throw new Error(`Response exceeds ${MAX_BYTES} bytes: ${url}`);
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

async function main() {
  const now = new Date();
  const year = String(process.env.OSINT_YEAR ?? now.getUTCFullYear());
  const month = String(process.env.OSINT_MONTH ?? now.getUTCMonth() + 1).padStart(2, '0');
  const indexUrl = `https://press.vatican.va/content/salastampa/en/bollettino/pubblico/${year}/${month}.html`;
  const fetchedAt = new Date().toISOString();
  const index = await fetchText(indexUrl);
  const links = bulletinLinks(index.text, indexUrl);
  const documents = [];
  const failures = [];

  for (const url of links) {
    try {
      const page = await fetchText(url);
      const sections = extractSections(page.text);
      documents.push({
        sourceId: 'holy-see-bulletin',
        url,
        publishedAt: dateFromUrl(url),
        fetchedAt,
        contentHash: sha256(page.text),
        etag: page.etag,
        lastModified: page.lastModified,
        contentType: page.contentType,
        sections
      });
    } catch (error) {
      failures.push({ url, error: error instanceof Error ? error.message : String(error) });
    }
  }

  const output = {
    schemaVersion: 1,
    sourceId: 'holy-see-bulletin',
    indexUrl,
    fetchedAt,
    indexHash: sha256(index.text),
    documentCount: documents.length,
    sectionCount: documents.reduce((sum, document) => sum + document.sections.length, 0),
    failureCount: failures.length,
    documents,
    failures
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  const filePath = path.join(OUTPUT_DIR, 'holy-see-latest.json');
  await writeFile(filePath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${filePath}: ${output.documentCount} documents, ${output.sectionCount} sections, ${output.failureCount} failures.`);

  if (!documents.length && links.length) process.exitCode = 2;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
