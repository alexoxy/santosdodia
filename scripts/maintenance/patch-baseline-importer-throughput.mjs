#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, 'utf8');
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${file}: patch anchor not found: ${before.slice(0, 120)}`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`${file}: patch anchor not unique.`);
  fs.writeFileSync(file, source.slice(0, first) + after + source.slice(first + before.length), 'utf8');
}

const workflow = '.github/workflows/import-saints-baseline-d1.yml';
replaceOnce(workflow, "    - cron: '7 6 * * *'", "    - cron: '7 * * * *'");
replaceOnce(workflow, "  D1_ENTITY_LIMIT: '200'", "  D1_ENTITY_LIMIT: '125'\n  D1_MAX_ROWS_PER_CHUNK: '2000'\n  D1_MAX_OPERATIONS_PER_DAY: '20'");
replaceOnce(workflow,
  "          node scripts/cloudflare-free-guardrails.mjs d1-batch --input staging/baseline-import/d1-batch.json > staging/baseline-import/cloudflare-estimate.json",
  "          node scripts/baseline/check-wikidata-baseline-d1-chunk.mjs --input staging/baseline-import/d1-batch.json > staging/baseline-import/cloudflare-estimate.json");
replaceOnce(workflow,
  "            --current-run-id \"${{ github.run_id }}\" \\\n            --token-env GITHUB_TOKEN \\",
  "            --current-run-id \"${{ github.run_id }}\" \\\n            --maximum \"$D1_MAX_OPERATIONS_PER_DAY\" \\\n            --token-env GITHUB_TOKEN \\");

const registry = 'config/automation-registry.json';
replaceOnce(registry,
  '"id":"saints-baseline-v1-importer","title":"Chunked rollback-safe Saints Baseline v1 D1 staging importer","owner":"data-operations","mode":"scheduled","workflow":".github/workflows/import-saints-baseline-d1.yml","crons":["7 6 * * *"]',
  '"id":"saints-baseline-v1-importer","title":"Chunked rollback-safe Saints Baseline v1 D1 staging importer","owner":"data-operations","mode":"scheduled","workflow":".github/workflows/import-saints-baseline-d1.yml","crons":["7 * * * *"]');

const pkg = 'package.json';
replaceOnce(pkg,
  'npm run saints:baseline-import-test && npm run saints:baseline-importer-audit && npm run temporal:test',
  'npm run saints:baseline-import-test && npm run saints:baseline-importer-audit && npm run saints:baseline-d1-guard-test && npm run temporal:test');
replaceOnce(pkg,
  '"saints:baseline-importer-audit": "node scripts/baseline/audit-wikidata-baseline-importer.mjs",',
  '"saints:baseline-importer-audit": "node scripts/baseline/audit-wikidata-baseline-importer.mjs",\n    "saints:baseline-d1-guard-test": "node scripts/baseline/test-wikidata-baseline-d1-chunk.mjs",');

const quality = '.github/workflows/quality.yml';
replaceOnce(quality,
  "      - name: Audit reviewed-only Saints Baseline D1 importer\n        run: npm run saints:baseline-importer-audit\n\n      - name: Test reviewed D1 chunk and withheld-name semantics",
  "      - name: Audit reviewed-only Saints Baseline D1 importer\n        run: npm run saints:baseline-importer-audit\n\n      - name: Test Saints Baseline D1 bootstrap row ceilings\n        run: npm run saints:baseline-d1-guard-test\n\n      - name: Test reviewed D1 chunk and withheld-name semantics");

console.log('Baseline importer throughput contract patched.');
