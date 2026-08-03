import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const policy = JSON.parse(fs.readFileSync(path.join(root, 'data/calendar-engine-policy.json'), 'utf8'));
const expected = {
  'roman-catholic': {
    engine: 'western-gregorian',
    publicationStatuses: ['calculated']
  },
  anglican: {
    engine: 'western-gregorian',
    publicationStatuses: ['calculated']
  },
  'greek-orthodox': {
    engine: 'byzantine-paschalion',
    publicationStatuses: ['calculated-with-jurisdiction-warning']
  },
  'eastern-orthodox': {
    engine: 'byzantine-paschalion',
    publicationStatuses: ['calculated-with-jurisdiction-warning']
  },
  'coptic-orthodox': {
    engine: 'coptic-native-and-paschalion',
    publicationStatuses: ['staging-only']
  },
  'armenian-apostolic': {
    engine: 'armenian-mother-see-calendar',
    publicationStatuses: ['staging-only']
  },
  'ethiopian-orthodox': {
    engine: 'ethiopian-native-and-bahire-hasab',
    publicationStatuses: ['staging-only']
  },
  'syriac-orthodox': {
    engine: 'syriac-paschalion-and-annual-source',
    publicationStatuses: ['staging-only']
  }
};
const errors = [];

for (const [tradition, requirement] of Object.entries(expected)) {
  const entry = policy[tradition];
  if (!entry) {
    errors.push(`Missing calendar engine policy for ${tradition}`);
    continue;
  }
  if (entry.engine !== requirement.engine) {
    errors.push(`${tradition} must use ${requirement.engine}, found ${entry.engine ?? '<missing>'}`);
  }
  if (!entry.fixedDatePolicy) errors.push(`Missing fixed-date policy for ${tradition}`);
  if (!Array.isArray(entry.sourceIds) || !entry.sourceIds.length) errors.push(`Missing source IDs for ${tradition}`);
  if (!requirement.publicationStatuses.includes(entry.publicationStatus)) {
    errors.push(`${tradition} has invalid publication status ${entry.publicationStatus ?? '<missing>'}`);
  }
}

const unknown = Object.keys(policy).filter(tradition => !expected[tradition]);
if (unknown.length) errors.push(`Unknown calendar policy traditions: ${unknown.join(', ')}`);

const oriental = ['coptic-orthodox', 'armenian-apostolic', 'ethiopian-orthodox', 'syriac-orthodox'];
for (const tradition of oriental) {
  const engine = policy[tradition]?.engine ?? '';
  if (/byzantine-paschalion|western-gregorian/.test(engine)) {
    errors.push(`${tradition} must not inherit a generic Byzantine or Western engine`);
  }
}

if (errors.length) {
  console.error(`Calendar engine policy audit failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Calendar engine policy audit passed for ${Object.keys(expected).length} traditions.`);
