import fs from 'node:fs';
import path from 'node:path';
import { refreshDropboxAccessToken } from './oauth.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const source = argument('--source');
const remotePath = argument('--path');
if (!source || !remotePath) throw new Error('Usage: node scripts/dropbox/upload-exact-file.mjs --source <file> --path </Dropbox/path/file>');
if (!remotePath.startsWith('/Santos do Dia/02_Dados_Eclesiasticos/')) throw new Error('Remote path must stay inside the canonical ecclesiastical Dropbox root.');
const localPath = path.resolve(source);
if (!fs.existsSync(localPath) || !fs.statSync(localPath).isFile()) throw new Error(`Source file does not exist: ${source}`);

const token = await refreshDropboxAccessToken();

async function jsonResponse(response, operation) {
  const text = await response.text();
  let body = {};
  if (text) {
    try { body = JSON.parse(text); } catch { throw new Error(`${operation} returned invalid JSON (HTTP ${response.status}).`); }
  }
  if (!response.ok) {
    const summary = body.error_summary ?? body.error?.['.tag'] ?? body.error_description ?? 'unknown_error';
    throw new Error(`${operation} failed (HTTP ${response.status}): ${summary}`);
  }
  return body;
}

async function ensureFolder(folder) {
  if (!folder || folder === '/') return;
  const response = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: folder, autorename: false }),
  });
  if (response.status === 409) {
    const text = await response.text();
    if (/path\/conflict\/folder|path\/conflict/i.test(text)) return;
    throw new Error(`Dropbox create folder failed (HTTP 409): ${text.slice(0, 240)}`);
  }
  await jsonResponse(response, `Dropbox create folder ${folder}`);
}

const parent = remotePath.split('/').slice(0, -1).join('/') || '/';
const segments = parent.split('/').filter(Boolean);
let current = '';
for (const segment of segments) {
  current += `/${segment}`;
  await ensureFolder(current);
}

const bytes = fs.readFileSync(localPath);
if (bytes.length > 140 * 1024 * 1024) throw new Error('Exact product evidence uploader supports files up to 140 MB.');
const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/octet-stream',
    'Dropbox-API-Arg': JSON.stringify({
      path: remotePath,
      mode: 'overwrite',
      autorename: false,
      mute: true,
      strict_conflict: false,
    }),
  },
  body: bytes,
});
const metadata = await jsonResponse(response, `Dropbox upload ${remotePath}`);
if (Number(metadata.size ?? -1) !== bytes.length) throw new Error(`Dropbox upload size mismatch for ${remotePath}.`);
console.log(JSON.stringify({ uploaded: true, path: metadata.path_display ?? remotePath, size: metadata.size, contentHash: metadata.content_hash ?? null }, null, 2));
