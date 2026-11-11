import assert from 'node:assert/strict';
import { assessVaticanRobots } from './check-vatican-reference-policy.mjs';

const allowed = `
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
User-agent: GPTBot
Disallow: /
`;
assert.deepEqual(assessVaticanRobots(allowed), {
  ok: true,
  allowsRoot: true,
  searchAllowed: true,
  referenceUse: true,
  trainingBlocked: true,
  globalBlock: false
});

const training = allowed.replace('ai-train=no', 'ai-train=yes');
assert.equal(assessVaticanRobots(training).ok, false);
const noReference = allowed.replace('use=reference', 'use=full');
assert.equal(assessVaticanRobots(noReference).ok, false);
const blocked = `User-agent: *\nDisallow: /\nContent-Signal: search=yes,ai-train=no,use=reference\n`;
assert.equal(assessVaticanRobots(blocked).ok, false);

console.log('Vatican reference-use policy tests passed.');
