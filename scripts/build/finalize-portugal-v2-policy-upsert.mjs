#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LEGACY_POLICY_INSERT = /INSERT INTO jurisdiction_calendar_policies \(id,church_id,jurisdiction_id,engine_id,fixed_date_policy,calendar_system,effective_from,effective_to,source_id,validation_status\) VALUES \('roman-catholic-pt-2026-v2','roman-catholic','pt','snl-portugal-reviewed-overlay-v2','general-roman-plus-reviewed-portugal-overlay','gregorian','2026-01-01','2026-12-31','portugal-national-liturgy-secretariat','cross-checked'\) ON CONFLICT\(id\) DO UPDATE SET engine_id=excluded\.engine_id,fixed_date_policy=excluded\.fixed_date_policy,calendar_system=excluded\.calendar_system,effective_from=excluded\.effective_from,effective_to=excluded\.effective_to,source_id=excluded\.source_id,validation_status=excluded\.validation_status;/gu;

const SCOPE_SAFE_UPSERT = `UPDATE jurisdiction_calendar_policies
SET engine_id='snl-portugal-reviewed-overlay-v2',
    fixed_date_policy='general-roman-plus-reviewed-portugal-overlay',
    calendar_system='gregorian',
    effective_to='2026-12-31',
    source_id='portugal-national-liturgy-secretariat',
    validation_status='cross-checked'
WHERE church_id='roman-catholic'
  AND COALESCE(jurisdiction_id,'')='pt'
  AND COALESCE(effective_from,'')='2026-01-01';
INSERT INTO jurisdiction_calendar_policies (id,church_id,jurisdiction_id,engine_id,fixed_date_policy,calendar_system,effective_from,effective_to,source_id,validation_status)
SELECT 'roman-catholic-pt-2026-v2','roman-catholic','pt','snl-portugal-reviewed-overlay-v2','general-roman-plus-reviewed-portugal-overlay','gregorian','2026-01-01','2026-12-31','portugal-national-liturgy-secretariat','cross-checked'
WHERE NOT EXISTS (
  SELECT 1 FROM jurisdiction_calendar_policies
  WHERE church_id='roman-catholic'
    AND COALESCE(jurisdiction_id,'')='pt'
    AND COALESCE(effective_from,'')='2026-01-01'
);`;

export function finalizePortugalV2PolicyUpsert(sql) {
  const source = String(sql ?? '');
  const matches = [...source.matchAll(LEGACY_POLICY_INSERT)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one Portugal v2 policy INSERT to finalize, found ${matches.length}.`);
  }
  const output = source.replace(LEGACY_POLICY_INSERT, SCOPE_SAFE_UPSERT);
  if (/ON CONFLICT\(id\).*roman-catholic-pt-2026-v2/su.test(output)) {
    throw new Error('Portugal v2 policy still relies on primary-key-only conflict handling.');
  }
  if (!output.includes("WHERE church_id='roman-catholic'\n  AND COALESCE(jurisdiction_id,'')='pt'\n  AND COALESCE(effective_from,'')='2026-01-01'")) {
    throw new Error('Portugal v2 policy finalizer did not emit the unique scope predicate.');
  }
  return output;
}

function main() {
  const inputIndex = process.argv.indexOf('--input');
  const outputIndex = process.argv.indexOf('--output');
  const input = inputIndex >= 0 ? process.argv[inputIndex + 1] : null;
  const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : input;
  if (!input || !output) throw new Error('Usage: --input <release.sql> [--output <release.sql>]');
  const inputPath = path.resolve(input);
  const outputPath = path.resolve(output);
  const finalized = finalizePortugalV2PolicyUpsert(fs.readFileSync(inputPath, 'utf8'));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, finalized, 'utf8');
  console.log(JSON.stringify({ finalized: true, input: inputPath, output: outputPath, policyScope: 'roman-catholic/pt/2026-01-01' }, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exit(1); }
}
