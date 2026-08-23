import { execFileSync } from "node:child_process";
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

const stagingPublishWorkflow = await readFile(
  path.join(root, ".github/workflows/product-publish-staging.yml"),
  "utf8",
);
if (!stagingPublishWorkflow.includes("stagingWorkflowRunId: Number(process.env.GITHUB_RUN_ID)")) {
  failures.push("staging validation receipt no longer records its exact workflow run");
}
if (!stagingPublishWorkflow.includes("PRODUCT_IMPORT_RUN_ID")) {
  failures.push("staging publication no longer derives the exact product import run");
}
const stagingScopeFilters = stagingPublishWorkflow.match(/import_run_id='\$PRODUCT_IMPORT_RUN_ID'/g) ?? [];
if (stagingScopeFilters.length < 3) {
  failures.push("staging verification counts are not fully scoped to the exact release import run");
}

const interfaceCopy = await readFile(path.join(root, "lib/i18n.ts"), "utf8");
if (/\bliveData\b|Live source data|fuentes en vivo|fontes em tempo real|sources en direct/.test(interfaceCopy)) {
  failures.push("public interface copy still claims request-time live source data");
}

// Canonical route ownership must match the canonical URL. Historical localized
// aliases may remain, but they should be cheap redirects rather than a second
// implementation that can drift or create duplicate-content ambiguity.
const [calendarPage, legacyCalendarPage] = await Promise.all([
  readFile(path.join(root, "app/calendar/page.tsx"), "utf8"),
  readFile(path.join(root, "app/calendario/page.tsx"), "utf8"),
]);
for (const required of ["CalendarExplorer", "CalendarProductNav", "TraditionFeeds", 'canonical: "/calendar"']) {
  if (!calendarPage.includes(required)) {
    failures.push(`canonical /calendar route lost required implementation contract: ${required}`);
  }
}
if (calendarPage.includes('../calendario/page')) {
  failures.push("canonical /calendar route must not delegate implementation ownership to /calendario");
}
if (!legacyCalendarPage.includes("permanentRedirect") || !legacyCalendarPage.includes('"/calendar"')) {
  failures.push("legacy /calendario route must remain a permanent compatibility redirect to /calendar");
}
if (/CalendarExplorer|CalendarProductNav|TraditionFeeds|generateMetadata/.test(legacyCalendarPage)) {
  failures.push("legacy /calendario route must not retain a duplicate calendar implementation or metadata surface");
}
if (!legacyCalendarPage.includes("URLSearchParams") || !legacyCalendarPage.includes("Object.entries")) {
  failures.push("legacy /calendario redirect must preserve incoming query parameters");
}

// A calendar Observance is not automatically a standalone Person page. Both
// date surfaces must delegate public /saint URL eligibility to one reviewed
// biography gate, otherwise structured data can manufacture thin/false people.
const [entityLinks, dayPage, annualDatePage] = await Promise.all([
  readFile(path.join(root, "lib/public-entity-links.ts"), "utf8"),
  readFile(path.join(root, "app/day/[date]/page.tsx"), "utf8"),
  readFile(path.join(root, "app/date/[monthDay]/page.tsx"), "utf8"),
]);
if (!entityLinks.includes("getSaintBiographyRecord") || !entityLinks.includes("isSaintBiographyIndexable")) {
  failures.push("public saint profile link policy no longer requires a substantive indexable biography");
}
if (!entityLinks.includes("return null") || !entityLinks.includes("/saint/")) {
  failures.push("public saint profile link policy no longer fails closed for non-Person/thin observances");
}
for (const [label, source] of [["day", dayPage], ["annual date", annualDatePage]]) {
  if (!source.includes("publicSaintProfilePath(item.id, locale)")) {
    failures.push(`${label} structured data bypasses the shared Person profile link policy`);
  }
  if (/SITE_ORIGIN}\/saint\/\$\{encodeURIComponent\(item\.id\)}/.test(source)) {
    failures.push(`${label} structured data directly manufactures /saint URLs from observance ids`);
  }
  if (!source.includes("#observance-${encodeURIComponent(item.id)}")) {
    failures.push(`${label} structured data lost its non-Person observance fallback anchor`);
  }
}

try {
  execFileSync(process.execPath, ["scripts/discovery/test-reviewed-navigation-promotion.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
} catch {
  failures.push("reviewed saint navigation promotion boundary failed");
}

try {
  execFileSync(process.execPath, ["scripts/test-editorial-guides.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
} catch {
  failures.push("editorial guide publication boundary failed");
}

if (failures.length) {
  console.error(`Publication boundary failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Publication boundary passed: ${appFiles.length} public modules use approved canonical routes/read models, script-safe JSON-LD and explicit Person/editorial promotion gates.`,
);
