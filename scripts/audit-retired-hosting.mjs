import { readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ACTIVE_SURFACES = [
  ".github/workflows",
  "app",
  "components",
  "config",
  "lib",
  "scripts",
  "next.config.ts",
  "open-next.config.ts",
  "package.json",
  "wrangler.jsonc",
];

const FORBIDDEN_FILES = new Set([
  ".nojekyll",
  "CNAME",
  "_config.yml",
  "_config.yaml",
  "vercel.json",
  ".vercelignore",
]);

const AUDIT_IMPLEMENTATION_FILES = new Set([
  ".github/workflows/retire-github-hosting.yml",
  "scripts/audit-retired-hosting.mjs",
  "scripts/retire-github-hosting.mjs",
  "scripts/test-retire-github-hosting.mjs",
  "scripts/test-retired-hosting-audit.mjs",
]);

const FORBIDDEN_PATTERNS = [
  { label: "Vercel package or runtime reference", pattern: /(?:@vercel\/|\bVERCEL_[A-Z0-9_]+|\bvercel\.app\b)/i },
  { label: "Vercel deployment action", pattern: /(?:amondnet\/vercel-action|vercel\/action|vercel deploy)/i },
  { label: "GitHub Pages deployment action", pattern: /actions\/(?:configure-pages|upload-pages-artifact|deploy-pages)@/i },
];

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
}

function isActiveSurface(file) {
  return ACTIVE_SURFACES.some((surface) => file === surface || file.startsWith(`${surface}/`));
}

export function auditRetiredHosting(files, readFile = (file) => readFileSync(file, "utf8")) {
  const failures = [];

  for (const file of files) {
    if (FORBIDDEN_FILES.has(file)) failures.push(`retired hosting file is forbidden: ${file}`);
    if (AUDIT_IMPLEMENTATION_FILES.has(file)) continue;
    if (!isActiveSurface(file)) continue;

    const source = readFile(file);
    for (const { label, pattern } of FORBIDDEN_PATTERNS) {
      if (pattern.test(source)) failures.push(`${label}: ${file}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

function main() {
  const files = trackedFiles().filter((file) => {
    try {
      return statSync(file).isFile();
    } catch {
      return false;
    }
  });
  const report = auditRetiredHosting(files);

  if (!report.ok) {
    console.error(`Retired hosting audit failed:\n- ${report.failures.join("\n- ")}`);
    process.exit(1);
  }

  console.log(`Retired hosting audit passed: ${files.length} tracked files contain no active Vercel or GitHub Pages configuration.`);
}

if (process.argv[1]?.endsWith("audit-retired-hosting.mjs")) main();
