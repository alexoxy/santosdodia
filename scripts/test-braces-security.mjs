import assert from 'node:assert/strict';
import braces from 'braces';

assert.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c']);
assert.throws(() => braces('{a,'.repeat(2000) + 'b' + '}'.repeat(2000)), { name: 'SyntaxError', message: /maximum nesting depth/ });
assert.throws(() => braces('{a,{b,c}}', { maxDepth: 1 }), { name: 'SyntaxError', message: /maximum nesting depth/ });
assert.doesNotThrow(() => braces.expand('{a,{b,c}}', { maxDepth: 10 }));
console.log('PASS braces dependency depth guard');
