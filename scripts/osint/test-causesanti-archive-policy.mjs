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
assert(workflow.includes('refusing a receipt-less success'), 'Workflow must fail closed when a crawl produces no archivable summary.');
assert(workflow.includes('exit 1'), 'Receipt-less CauseSanti runs must return a failing status instead of silently succeeding.');
assert(workflow.includes("github.event_name == 'push' && '60' || '6000'"), 'Pushes must run a bounded canary while scheduled/manual acquisition retains the full crawl.');
assert(workflow.includes('sources/causesanti-va/canary'), 'Push canary evidence must use an isolated Dropbox stream.');
assert(workflow.includes('sources/causesanti-va/raw'), 'Full raw CauseSanti evidence must remain in the authoritative immutable stream.');
assert(workflow.includes('--stream "$CAUSESANTI_ARCHIVE_STREAM"'), 'Dropbox archival must select the event-specific evidence stream explicitly.');
assert(!workflow.includes('production') || workflow.includes('publication:boundary-test'), 'CauseSanti acquisition must not gain an implicit production publication path.');

console.log('CauseSanti archive policy passed: bounded canary evidence is isolated, full acquisition remains scheduled, and promotion stays gated.');
