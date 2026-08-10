#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, 'utf8');
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${file}: patch anchor missing: ${before.slice(0,120)}`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`${file}: patch anchor not unique.`);
  fs.writeFileSync(file, source.slice(0, first) + after + source.slice(first + before.length), 'utf8');
}

const audit = 'scripts/baseline/audit-saints-baseline-plan.mjs';
replaceOnce(audit,
  "if (wikidataEpoch.adapterVersion !== '1.2') errors.push('Active Wikidata baseline adapterVersion must remain aligned with query epoch recognition-v1.');",
  "if (wikidataEpoch.adapterVersion !== '1.3') errors.push('Active Wikidata baseline adapterVersion must remain aligned with resilient recognition-v1 acquisition.');");
replaceOnce(audit,
  "if (wikidataEpoch.policy?.resumeOnlySameQueryVersion !== true || wikidataEpoch.policy?.startNewVersionAtPageZero !== true || wikidataEpoch.policy?.legacyEpochsRemainAuditOnly !== true || wikidataEpoch.policy?.productionPublication !== false) {",
  "if (wikidataEpoch.policy?.resumeOnlySameQueryVersion !== true || wikidataEpoch.policy?.startNewVersionAtPageZero !== true || wikidataEpoch.policy?.legacyEpochsRemainAuditOnly !== true || wikidataEpoch.policy?.transientSourceFailuresRetryWithoutCursorAdvance !== true || wikidataEpoch.policy?.productionPublication !== false) {");
replaceOnce(audit,
  "if (!wikidataAdapter.includes(\"String(page).padStart(4, '0')\")) errors.push('Wikidata page archive naming must remain compatible with the current normalizer.');",
  "if (!wikidataAdapter.includes(\"String(page).padStart(4, '0')\")) errors.push('Wikidata page archive naming must remain compatible with the current normalizer.');\nif (!wikidataAdapter.includes('fetchPageWithRetry')) errors.push('Wikidata adapter must retain bounded per-page retry handling.');\nif (!wikidataAdapter.includes('isRetryableStatus')) errors.push('Wikidata adapter must distinguish retryable transient HTTP failures.');\nif (!wikidataAdapter.includes(\"summary.nextPage = page + 1\")) errors.push('Wikidata adapter must advance its cursor only after a successful page response.');\nif (!wikidataAdapter.includes(\"statuses: ['429', '5xx']\")) errors.push('Wikidata adapter retry policy must remain bounded to transient HTTP classes.');");

const baselineTest = 'scripts/baseline/test-saints-baseline-tools.mjs';
replaceOnce(baselineTest,
  "  console.log('Saints Baseline v1 query-epoch resume/finalize tests passed.');",
  "  execFileSync(process.execPath, [path.join(root, 'scripts/osint/test-wikidata-adapter-retry.mjs')], { cwd: root, stdio: 'inherit' });\n  console.log('Saints Baseline v1 query-epoch resume/finalize and Wikidata retry tests passed.');");

const workflow = '.github/workflows/build-saints-baseline-wikidata.yml';
replaceOnce(workflow,
  "      - config/saints-baseline-wikidata.json\n      - .github/workflows/build-saints-baseline-wikidata.yml",
  "      - config/saints-baseline-wikidata.json\n      - scripts/osint/adapters/wikidata-saints.mjs\n      - scripts/osint/test-wikidata-adapter-retry.mjs\n      - .github/workflows/build-saints-baseline-wikidata.yml");
replaceOnce(workflow,
  "          npm run saints:baseline-audit\n          npm run autonomy:lanes-audit",
  "          npm run saints:baseline-audit\n          npm run saints:baseline-test\n          npm run autonomy:lanes-audit");
replaceOnce(workflow,
  "          OSINT_WIKIDATA_DELAY_MS: '12000'",
  "          OSINT_WIKIDATA_DELAY_MS: '12000'\n          OSINT_WIKIDATA_RETRY_ATTEMPTS: '4'\n          OSINT_WIKIDATA_RETRY_BASE_MS: '5000'\n          OSINT_WIKIDATA_RETRY_MAX_MS: '60000'");

console.log('Wikidata retry contract patched into baseline audit/tests/workflow.');
