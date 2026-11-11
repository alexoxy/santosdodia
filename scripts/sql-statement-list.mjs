export function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    current += character;

    if (character === "'") {
      if (inString && sql[index + 1] === "'") {
        current += sql[index + 1];
        index += 1;
      } else {
        inString = !inString;
      }
      continue;
    }

    if (character === ';' && !inString) {
      const statement = current.slice(0, -1).trim();
      if (statement) statements.push(statement);
      current = '';
    }
  }

  if (inString) throw new Error('Generated SQL contains an unterminated string literal.');
  if (current.trim()) throw new Error('Generated SQL contains a statement without a trailing semicolon.');
  return statements;
}

export function portableD1Statements(sql) {
  const control = /^(?:PRAGMA\s+foreign_keys\s*=\s*(?:ON|OFF|1|0)|BEGIN(?:\s+IMMEDIATE|\s+TRANSACTION)?|COMMIT|ROLLBACK)$/i;
  return splitSqlStatements(sql).filter(statement => !control.test(statement.trim()));
}

export function serializeSqlStatements(statements) {
  return `${statements.map(statement => `${statement};`).join('\n')}\n`;
}
