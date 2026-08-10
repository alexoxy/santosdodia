#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function assessVaticanRobots(text) {
  const normalized = String(text).replace(/\r\n?/gu, '\n');
  const globalBlock = /user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*(?:\n|$)/iu.test(normalized);
  const allowsRoot = /user-agent:\s*\*[\s\S]*?allow:\s*\/\s*(?:\n|$)/iu.test(normalized);
  const contentSignal = normalized.match(/content-signal:\s*([^\n]+)/iu)?.[1]?.toLowerCase() ?? '';
  const searchAllowed = /(?:^|,)\s*search=yes(?:,|$)/u.test(contentSignal);
  const referenceUse = /(?:^|,)\s*use=reference(?:,|$)/u.test(contentSignal);
  const trainingBlocked = /(?:^|,)\s*ai-train=no(?:,|$)/u.test(contentSignal);
  return {
    ok: !globalBlock && allowsRoot && searchAllowed && referenceUse && trainingBlocked,
    allowsRoot,
    searchAllowed,
    referenceUse,
    trainingBlocked,
    globalBlock
  };
}

async function main() {
  const response = await fetch('https://www.vaticannews.va/robots.txt', {
    headers: { 'User-Agent': 'SantosDoDia-ReferenceIndexer/1.0 (+https://www.santosdodia.com)' },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error(`Unable to verify Vatican News robots policy: HTTP ${response.status}.`);
  const assessment = assessVaticanRobots(await response.text());
  process.stdout.write(`${JSON.stringify(assessment, null, 2)}\n`);
  if (!assessment.ok) throw new Error('Vatican News reference-use policy is no longer compatible with the metadata-only harvester.');
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
