import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const crawler = fs.readFileSync(path.join(root, 'scripts/osint/adapters/causesanti-site.mjs'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/acquire-causesanti-site.yml'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!crawler.includes('process.exitCode = 2'), 'A bounded partial crawl must not fail the workflow before raw evidence is archived.');
assert(crawler.includes("archiveEligible"), 'Crawler summary must state whether raw evidence is eligible for immutable archive.');
assert(crawler.includes("promotionEligible"), 'Crawler summary must independently state whether downstream promotion is eligible.');
assert(crawler.includes("partial-with-errors") && crawler.includes("partial-limit"), 'Partial crawl states must remain explicit in receipts.');
assert(workflow.includes('if: always()'), 'Dropbox archive step must run after a partial/failing crawl when evidence exists.');
assert(workflow.includes('No CauseSanti crawl evidence to archive'), 'Workflow must safely no-op when a fatal crawl produced no evidence directory.');
assert(workflow.includes('sources/causesanti-va/raw'), 'Raw CauseSanti evidence must remain in the immutable raw stream.');
assert(!workflow.includes('production') || workflow.includes('publication:boundary-test'), 'CauseSanti acquisition must not gain an implicit production publication path.');

console.log('CauseSanti archive policy passed: partial evidence is preserved, promotion remains independently gated.');
