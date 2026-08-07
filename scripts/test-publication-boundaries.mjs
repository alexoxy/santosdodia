import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(target)));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(target);
  }
  return files;
}

const appFiles = await filesUnder(path.join(root, "app"));
const rawGetterPattern =
  /import\s*{[\s\S]*?\b(?:getAllObservances|getMonthlyObservances|getObservancesForDate|searchObservances)\b[\s\S]*?}\s*from\s*["'][^"']*data\/observances["']/m;

for (const file of appFiles) {
  const source = await readFile(file, "utf8");
  const relative = path.relative(root, file);
  if (rawGetterPattern.test(source))
    failures.push(`${relative} imports an unfiltered observance getter`);
  if (
    /\b(?:church-sources|live-sources|expanded-church-sources)\b/.test(source)
  )
    failures.push(`${relative} imports a runtime acquisition adapter`);
  if (/live(?:=|\s*:\s*)["']?1\b/.test(source))
    failures.push(`${relative} enables live acquisition from a public request`);
  if (/__html\s*:\s*JSON\.stringify/.test(source))
    failures.push(
      `${relative} serializes JSON-LD without script-safe escaping`,
    );
}

for (const removed of [
  "lib/church-sources.ts",
  "lib/live-sources.ts",
  "lib/expanded-church-sources.ts",
]) {
  try {
    await access(path.join(root, removed));
    failures.push(`${removed} must remain absent from the public runtime`);
  } catch {
    // Expected: acquisition is implemented by scheduled scripts and workflows.
  }
}

const serializer = await readFile(
  path.join(root, "lib/structured-data.ts"),
  "utf8",
);
for (const escape of ["\\\\u0026", "\\\\u003c", "\\\\u003e"]) {
  if (!serializer.includes(escape))
    failures.push(`structured-data serializer is missing ${escape}`);
}

const interfaceCopy = await readFile(path.join(root, "lib/i18n.ts"), "utf8");
if (/\bliveData\b|Live source data|fuentes en vivo|fontes em tempo real|sources en direct/.test(interfaceCopy)) {
  failures.push("public interface copy still claims request-time live source data");
}

if (failures.length) {
  console.error(`Publication boundary failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Publication boundary passed: ${appFiles.length} public modules use approved read models and script-safe JSON-LD.`,
);
