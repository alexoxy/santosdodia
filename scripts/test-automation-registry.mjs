import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  discoverAutomationInventory,
  isAtMostMonthlyCron,
  isAtMostWeeklyCron,
  validateAutomationRegistry
} from './audit-automation-registry.mjs';

const registry = JSON.parse(fs.readFileSync('config/automation-registry.json', 'utf8'));
const inventory = discoverAutomationInventory();
const baseline = validateAutomationRegistry(registry, inventory);
assert.equal(baseline.ok, true, baseline.errors.join('\n'));
assert.equal(isAtMostWeeklyCron('17 5 * * 1'), true);
assert.equal(isAtMostWeeklyCron('17 3 1 * *'), true);
assert.equal(isAtMostWeeklyCron('2 * * * *'), false);
assert.equal(isAtMostWeeklyCron('13,28,43,58 * * * *'), false);
assert.equal(isAtMostWeeklyCron('11 9 * * *'), false);
assert.equal(isAtMostMonthlyCron('17 3 1 * *'), true);
assert.equal(isAtMostMonthlyCron('17 5 * * 1'), false);
assert.equal(isAtMostMonthlyCron('17 3 1 * 1'), false);
assert.equal(isAtMostMonthlyCron('17 3 * * *'), false);

const withUnregisteredSchedule = structuredClone(inventory);
withUnregisteredSchedule.workflows.set('.github/workflows/unregistered.yml', { crons: ['7 7 * * *'] });
assert.match(validateAutomationRegistry(registry, withUnregisteredSchedule).errors.join('\n'), /Scheduled workflow is not registered/);

const wrongCron = structuredClone(registry);
wrongCron.tasks.find((task) => task.id === 'observance-refresh').crons = ['0 0 * * *'];
assert.match(validateAutomationRegistry(wrongCron, inventory).errors.join('\n'), /cron mismatch/);

const tooFrequent = structuredClone(registry);
const tooFrequentInventory = structuredClone(inventory);
const frequentTask = tooFrequent.tasks.find((task) => task.id === 'observance-refresh');
frequentTask.crons = ['0 * * * *'];
tooFrequentInventory.workflows.set(frequentTask.workflow, { crons: ['0 * * * *'] });
assert.match(validateAutomationRegistry(tooFrequent, tooFrequentInventory).errors.join('\n'), /exceeds the at-most-weekly cadence/);

const monthlyExceeded = structuredClone(registry);
const monthlyExceededInventory = structuredClone(inventory);
const monthlyTask = monthlyExceeded.tasks.find((task) => task.id === 'observance-refresh');
monthlyTask.crons = ['15 5 * * 1'];
monthlyExceededInventory.workflows.set(monthlyTask.workflow, { crons: ['15 5 * * 1'] });
assert.match(validateAutomationRegistry(monthlyExceeded, monthlyExceededInventory).errors.join('\n'), /exceeds the monthly static-acquisition cadence/);

const rogueWeeklyException = structuredClone(registry);
rogueWeeklyException.policy.weeklyExceptionTaskIds.push('observance-refresh');
assert.match(validateAutomationRegistry(rogueWeeklyException, inventory).errors.join('\n'), /Unapproved weekly cadence exception/);

const cadencePolicyDisabled = structuredClone(registry);
cadencePolicyDisabled.policy.scheduledTasksAtMostWeekly = false;
assert.match(validateAutomationRegistry(cadencePolicyDisabled, inventory).errors.join('\n'), /Recurring scheduled tasks must remain at most weekly/);

const unsafePublication = structuredClone(registry);
unsafePublication.tasks.find((task) => task.id === 'observance-refresh').publicationMode = 'automatic-production';
assert.match(validateAutomationRegistry(unsafePublication, inventory).errors.join('\n'), /forbidden publicationMode/);

const unsafeGeneratedPath = structuredClone(registry);
unsafeGeneratedPath.tasks.find((task) => task.id === 'live-stream-curator').generatedPaths = ['app/page.tsx'];
assert.match(validateAutomationRegistry(unsafeGeneratedPath, inventory).errors.join('\n'), /not policy-approved/);

const unownedGeneratedPath = structuredClone(registry);
unownedGeneratedPath.policy.automaticGeneratedRegistryWrites.push('data/generated/unowned.json');
assert.match(validateAutomationRegistry(unownedGeneratedPath, inventory).errors.join('\n'), /has no registered owner task/);

const requestTimeFetch = structuredClone(registry);
requestTimeFetch.policy.requestTimeExternalAcquisition = true;
assert.match(validateAutomationRegistry(requestTimeFetch, inventory).errors.join('\n'), /Request-time external acquisition/);

const missingProducer = structuredClone(registry);
missingProducer.tasks.find((task) => task.id === 'source-freshness').producerScripts = ['scripts/missing-producer.mjs'];
assert.match(validateAutomationRegistry(missingProducer, inventory).errors.join('\n'), /references missing producer/);

console.log(`Automation registry passed: ${baseline.summary.scheduledTasks} schedules, ${baseline.summary.producerScripts} producer entrypoints and ${baseline.summary.generatedPublicationPaths} generated publication path(s).`);
