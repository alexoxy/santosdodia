#!/usr/bin/env node

import assert from 'node:assert/strict';
import { finalizePortugalV2PolicyUpsert } from './finalize-portugal-v2-policy-upsert.mjs';

const legacy = "PRAGMA foreign_keys = ON;\nINSERT INTO jurisdiction_calendar_policies (id,church_id,jurisdiction_id,engine_id,fixed_date_policy,calendar_system,effective_from,effective_to,source_id,validation_status) VALUES ('roman-catholic-pt-2026-v2','roman-catholic','pt','snl-portugal-reviewed-overlay-v2','general-roman-plus-reviewed-portugal-overlay','gregorian','2026-01-01','2026-12-31','portugal-national-liturgy-secretariat','cross-checked') ON CONFLICT(id) DO UPDATE SET engine_id=excluded.engine_id,fixed_date_policy=excluded.fixed_date_policy,calendar_system=excluded.calendar_system,effective_from=excluded.effective_from,effective_to=excluded.effective_to,source_id=excluded.source_id,validation_status=excluded.validation_status;\nSELECT 1;\n";

const finalized = finalizePortugalV2PolicyUpsert(legacy);
assert.match(finalized, /UPDATE jurisdiction_calendar_policies/u);
assert.match(finalized, /COALESCE\(jurisdiction_id,''\)='pt'/u);
assert.match(finalized, /COALESCE\(effective_from,''\)='2026-01-01'/u);
assert.match(finalized, /INSERT INTO jurisdiction_calendar_policies[\s\S]*WHERE NOT EXISTS/u);
assert.doesNotMatch(finalized, /ON CONFLICT\(id\).*roman-catholic-pt-2026-v2/u);
assert.ok(finalized.endsWith('SELECT 1;\n'));

assert.throws(() => finalizePortugalV2PolicyUpsert('SELECT 1;'), /found 0/u);
assert.throws(() => finalizePortugalV2PolicyUpsert(`${legacy}${legacy}`), /found 2/u);

console.log('Portugal v2 policy finalizer upgrades the existing PT/2026 unique scope instead of colliding on a new policy id.');
