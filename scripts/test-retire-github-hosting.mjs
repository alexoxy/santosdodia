import assert from "node:assert/strict";
import {
  assertCloudflareProduction,
  isMergedBranch,
  isRetiredDeployment,
  retireGithubHosting,
} from "./retire-github-hosting.mjs";

assert.equal(isRetiredDeployment({ creator: { login: "vercel[bot]" }, environment: "Production" }), true);
assert.equal(isRetiredDeployment({ performed_via_github_app: { slug: "vercel" }, environment: "Preview" }), true);
assert.equal(isRetiredDeployment({ performed_via_github_app: { slug: "github-pages" }, environment: "github-pages" }), true);
assert.equal(isRetiredDeployment({ performed_via_github_app: { slug: "github-actions" }, environment: "dropbox-archive" }), false);
assert.equal(isRetiredDeployment({ performed_via_github_app: { slug: "github-actions" }, environment: "d1-staging" }), false);

assert.equal(isMergedBranch({ ahead_by: 0 }), true);
assert.equal(isMergedBranch({ ahead_by: 1 }), false);
assert.equal(isMergedBranch({}), false);

const wafProtected = await assertCloudflareProduction(
  async () => new Response("blocked", {
    status: 403,
    headers: { server: "cloudflare", "cf-ray": "test-LIS" },
  }),
  "https://www.santosdodia.com",
);
assert.deepEqual(wafProtected, { checkedAt: null, mode: "cloudflare-waf-protected" });

await assert.rejects(
  () => assertCloudflareProduction(
    async () => new Response("forbidden", { status: 403, headers: { server: "cloudflare" } }),
    "https://www.santosdodia.com",
  ),
  /HTTP 403/,
);

const deployments = [
  { id: 1, creator: { login: "vercel[bot]" }, environment: "Production" },
  { id: 2, performed_via_github_app: { slug: "github-pages" }, environment: "github-pages" },
  { id: 3, performed_via_github_app: { slug: "github-actions" }, environment: "d1-staging" },
];
const requests = [];
let pagesDeploymentDeleteAttempts = 0;

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function fakeFetch(url, init = {}) {
  const method = init.method ?? "GET";
  const parsed = new URL(url);
  requests.push(`${method} ${parsed.pathname}${parsed.search}`);

  if (parsed.hostname === "www.santosdodia.com") {
    return json({ status: "ok", checkedAt: "2026-08-07T12:00:00Z" }, 200, { server: "cloudflare" });
  }
  if (method === "GET" && parsed.pathname.endsWith("/deployments")) return json(deployments);
  if (method === "DELETE" && parsed.pathname.endsWith("/pages")) return new Response(null, { status: 204 });
  if (method === "DELETE" && parsed.pathname.endsWith("/deployments/1")) {
    deployments.splice(deployments.findIndex((item) => item.id === 1), 1);
    return new Response(null, { status: 204 });
  }
  if (method === "DELETE" && parsed.pathname.endsWith("/deployments/2")) {
    pagesDeploymentDeleteAttempts += 1;
    if (pagesDeploymentDeleteAttempts === 1) return json({ message: "Deployment is active" }, 422);
    deployments.splice(deployments.findIndex((item) => item.id === 2), 1);
    return new Response(null, { status: 204 });
  }
  if (method === "POST" && parsed.pathname.endsWith("/deployments/2/statuses")) {
    return json({ state: "inactive" }, 201);
  }
  if (method === "DELETE" && parsed.pathname.includes("/environments/")) return new Response(null, { status: 204 });
  if (method === "GET" && parsed.pathname.endsWith("/branches")) {
    return json([
      { name: "main", protected: true },
      { name: "cloudflare-preview", protected: false },
      { name: "agent/merged", protected: false },
      { name: "agent/unique", protected: false },
    ]);
  }
  if (method === "GET" && parsed.pathname.endsWith("/compare/main...agent%2Fmerged")) return json({ ahead_by: 0 });
  if (method === "GET" && parsed.pathname.endsWith("/compare/main...agent%2Funique")) return json({ ahead_by: 2 });
  if (method === "DELETE" && parsed.pathname.endsWith("/git/refs/heads/agent%2Fmerged")) {
    return new Response(null, { status: 204 });
  }
  return json({ message: `Unexpected request: ${method} ${parsed.pathname}${parsed.search}` }, 500);
}

const report = await retireGithubHosting({
  fetchImpl: fakeFetch,
  repository: "alexoxy/santosdodia",
  token: "test-token",
  siteUrl: "https://www.santosdodia.com",
});
assert.equal(report.deploymentsDeleted, 2);
assert.deepEqual(report.beforeHealth, { checkedAt: "2026-08-07T12:00:00Z", mode: "healthy" });
assert.deepEqual(report.afterHealth, { checkedAt: "2026-08-07T12:00:00Z", mode: "healthy" });
assert.deepEqual(report.retiredByEnvironment, { Production: 1, "github-pages": 1 });
assert.deepEqual(report.branchesDeleted, ["agent/merged"]);
assert.match(report.branchesRetained.find((item) => item.name === "agent/unique").reason, /2 unique/);
assert.equal(deployments.some((item) => item.id === 3), true);
assert.equal(requests.some((request) => request.includes("deployments/3")), false);
assert.equal(requests.some((request) => request.includes("heads/agent%2Funique")), false);
assert.equal(pagesDeploymentDeleteAttempts, 2);

console.log("Retired deployment and merged-branch selectors passed.");
