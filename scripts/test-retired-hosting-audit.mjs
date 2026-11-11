import assert from "node:assert/strict";
import { auditRetiredHosting } from "./audit-retired-hosting.mjs";

const clean = auditRetiredHosting(
  ["docs/cloudflare-production.md", "wrangler.jsonc"],
  (file) => file.startsWith("docs/") ? "Vercel is retired." : '{"name":"santosdodia"}',
);
assert.equal(clean.ok, true);

const vercelRuntime = auditRetiredHosting(["package.json"], () => '{"dependencies":{"@vercel/analytics":"latest"}}');
assert.match(vercelRuntime.failures.join("\n"), /Vercel package or runtime reference/);

const pagesWorkflow = auditRetiredHosting([".github/workflows/pages.yml"], () => "uses: actions/deploy-pages@v4");
assert.match(pagesWorkflow.failures.join("\n"), /GitHub Pages deployment action/);

const forbiddenFile = auditRetiredHosting(["vercel.json"], () => "{}");
assert.match(forbiddenFile.failures.join("\n"), /retired hosting file is forbidden/);

console.log("Retired hosting guardrails passed.");
