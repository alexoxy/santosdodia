#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const relative = file => path.relative(root, file).split(path.sep).join('/');
const walk = directory => fs.existsSync(directory)
  ? fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    })
  : [];

const failures = [];
const codeFiles = walk(path.join(root, 'app')).filter(file => /\.(?:[cm]?[jt]sx?|css)$/u.test(file));
const allowedIframeFile = 'app/components/VaticanLiveFeature.tsx';
const forbiddenElement = /<(?:img|picture|video|audio|canvas|object|embed|svg)\b/iu;
const iframeElement = /<iframe\b/iu;
const nextImageImport = /from\s+['"]next\/image['"]/u;
const fetchedCssAsset = /(?:background(?:-image)?|content|src)\s*:[^;{}]*url\s*\(/iu;
const remoteFont = /@font-face\b|@import\s+url\s*\(/iu;

for (const file of codeFiles) {
  const name = relative(file);
  const text = fs.readFileSync(file, 'utf8');

  if (forbiddenElement.test(text)) failures.push(name + ': first-party visual/audio media element is forbidden');
  if (iframeElement.test(text) && name !== allowedIframeFile) failures.push(name + ': iframe is allowed only in the verified livestream component');
  if (nextImageImport.test(text)) failures.push(name + ': next/image is outside the text-first product contract');
  if (name.endsWith('.css') && fetchedCssAsset.test(text)) failures.push(name + ': CSS must not fetch visible media assets');
  if (name.endsWith('.css') && remoteFont.test(text)) failures.push(name + ': remote/font-face CSS is forbidden');
}

const allowedBrowserMetadata = new Set(['app/favicon.ico', 'app/icon.svg']);
const mediaAsset = /\.(?:avif|bmp|gif|jpe?g|png|webp|apng|mp3|m4a|ogg|wav|flac|mp4|m4v|mov|webm)$/iu;
for (const file of [...walk(path.join(root, 'app')), ...walk(path.join(root, 'public'))]) {
  const name = relative(file);
  if (mediaAsset.test(name) && !allowedBrowserMetadata.has(name)) {
    failures.push(name + ': tracked first-party media asset is forbidden');
  }
}
for (const file of walk(path.join(root, 'app'))) {
  const name = relative(file);
  if (/\.svg$/iu.test(name) && !allowedBrowserMetadata.has(name)) {
    failures.push(name + ': visible SVG asset is forbidden');
  }
}

const live = fs.readFileSync(path.join(root, allowedIframeFile), 'utf8');
assert.match(live, /youtube-nocookie\.com/u, 'Livestream embed must use the privacy-enhanced YouTube host.');
assert.match(live, /loading="lazy"/u, 'Livestream iframe must remain lazy.');
assert.match(live, /enabled\?<iframe/u, 'Livestream iframe must remain behind explicit activation state.');
assert.match(live, /onClick=\{\(\)=>setEnabled\(true\)\}/u, 'Livestream requires an explicit user action.');
assert.doesNotMatch(live, /<img\b|poster=/iu, 'Livestream must not add a thumbnail asset.');

const contract = JSON.parse(fs.readFileSync(path.join(root, 'config/product-platform-contract.json'), 'utf8'));
assert.equal(contract.humanSurface?.deliveryModel, 'text-first');
assert.equal(contract.humanSurface?.firstPartyImagesAllowed, false);
assert.equal(contract.humanSurface?.firstPartyAudioAllowed, false);
assert.equal(contract.humanSurface?.nonLiveFirstPartyVideoAllowed, false);
assert.equal(contract.humanSurface?.liveStreamIsOnlyAudiovisualContent, true);
assert.equal(contract.humanSurface?.liveEmbedRequiresExplicitUserActivation, true);
assert.equal(contract.humanSurface?.remoteFontsAllowed, false);
assert.ok(contract.strategicMoat?.includes('perennial-calculation'));
assert.ok(contract.strategicMoat?.includes('autonomous-maintenance'));

const strategy = fs.readFileSync(path.join(root, 'docs/product/global-liturgical-intelligence-v2.1.md'), 'utf8');
assert.match(strategy, /### Text-first delivery contract/u);
assert.match(strategy, /Verified livestream is the sole first-party audiovisual content type/u);
assert.match(strategy, /Its sophistication belongs in the evidence, algorithms, source governance, calendar engine, localisation and automation/u);

if (failures.length) {
  throw new Error('Text-first surface contract failed:\n- ' + failures.join('\n- '));
}

console.log('Text-first surface passed: ' + codeFiles.length + ' app code/style files contain no first-party media; verified livestream remains user-activated and privacy-enhanced.');
