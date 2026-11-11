import { portableD1Statements, serializeSqlStatements, splitSqlStatements } from './sql-statement-list.mjs';

const source = `
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;
INSERT INTO example (value) VALUES ('a; b''s value');
UPDATE example SET value = 'done';
COMMIT;
`;

const split = splitSqlStatements(source);
if (split.length !== 5) throw new Error(`Expected 5 parsed statements, found ${split.length}.`);
if (!split[2].includes("a; b''s value")) throw new Error('Quoted semicolon or escaped quote was parsed incorrectly.');

const portable = portableD1Statements(source);
if (portable.length !== 2) throw new Error(`Expected 2 portable D1 statements, found ${portable.length}.`);
if (portable.some(statement => /^(?:PRAGMA|BEGIN|COMMIT|ROLLBACK)/i.test(statement))) {
  throw new Error('A transaction-control statement remained in the portable D1 list.');
}

const serialized = serializeSqlStatements(portable);
if (!serialized.endsWith(';\n') || !serialized.includes("'a; b''s value'")) {
  throw new Error('Portable SQL serialization changed statement content.');
}

console.log('SQL statement parsing and D1 control filtering tests passed.');
