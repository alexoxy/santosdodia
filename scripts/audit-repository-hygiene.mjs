import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

const MIB = 1024 * 1024;
const limits = {
  trackedFiles: 1500,
  trackedBytes: 50 * MIB,
  singleFileBytes: 5 * MIB,
  generatedFiles: 250,
};

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const failures = [];
let totalBytes = 0;
let generatedFiles = 0;
const fileSizes = [];

const forbiddenPrefixes = [
  'vendor/litcal-api/',
  'artifacts/',
  'staging/',
  'tmp/',
  'data/generated/ecclesiastical-directory/snapshots/',
  'data/generated/calendar-staging/',
];

const forbiddenGeneratedExtensions = /\.(?:html?|pdf|zip|gz|tar|tgz|sqlite|db|sql)$/i;

for (const file of files) {
  const size = statSync(file).size;
  totalBytes += size;
  fileSizes.push({ file, size });

  if (file.startsWith('data/generated/')) generatedFiles += 1;

  if (forbiddenPrefixes.some((prefix) => file.startsWith(prefix))) {
    failures.push(`tracked transient or mirrored content is forbidden: ${file}`);
  }

  if (file.startsWith('data/generated/') && forbiddenGeneratedExtensions.test(file)) {
    failures.push(`raw or database artifact must be staged in Dropbox, not Git: ${file}`);
  }

  if (size > limits.singleFileBytes) {
    failures.push(`tracked file exceeds ${limits.singleFileBytes / MIB} MiB: ${file} (${(size / MIB).toFixed(2)} MiB)`);
  }
}

if (files.length > limits.trackedFiles) {
  failures.push(`tracked file count ${files.length} exceeds limit ${limits.trackedFiles}`);
}
if (totalBytes > limits.trackedBytes) {
  failures.push(`tracked working-tree size ${(totalBytes / MIB).toFixed(2)} MiB exceeds limit ${limits.trackedBytes / MIB} MiB`);
}
if (generatedFiles > limits.generatedFiles) {
  failures.push(`generated data file count ${generatedFiles} exceeds limit ${limits.generatedFiles}`);
}

const largest = fileSizes
  .sort((a, b) => b.size - a.size)
  .slice(0, 20)
  .map(({ file, size }) => `${file} (${(size / MIB).toFixed(2)} MiB)`);

console.log(`Repository hygiene: ${files.length} tracked files, ${(totalBytes / MIB).toFixed(2)} MiB, ${generatedFiles} generated data files.`);
console.log(`Largest tracked files:\n- ${largest.join('\n- ')}`);

if (failures.length) {
  console.error(`Repository hygiene failed with ${failures.length} issue(s):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Repository hygiene passed.');
