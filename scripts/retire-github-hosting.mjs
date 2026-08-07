import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API_ROOT = "https://api.github.com";
const RETIRED_ENVIRONMENTS = new Set(["Production", "Preview", "github-pages"]);
const PRESERVED_BRANCHES = new Set(["main", "cloudflare-preview"]);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function bodyText(response) {
  const text = await response.text();
  return text || `<HTTP ${response.status}>`;
}

async function expect(response, statuses, label) {
  if (!statuses.includes(response.status)) {
    throw new Error(`${label} failed with HTTP ${response.status}: ${await bodyText(response)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function github(fetchImpl, token, path, init = {}) {
  return fetchImpl(`${API_ROOT}${path}`, {
    ...init,
    headers: { ...githubHeaders(token), ...(init.headers ?? {}) },
  });
}

async function collectPages(fetchImpl, token, repository, resource) {
  const output = [];
  for (let page = 1; ; page += 1) {
    const response = await github(
      fetchImpl,
      token,
      `/repos/${repository}/${resource}?per_page=100&page=${page}`,
    );
    const items = await expect(response, [200], `List ${resource} page ${page}`);
    output.push(...items);
    if (items.length < 100) return output;
  }
}

export function isRetiredDeployment(deployment) {
  const isVercel = deployment.creator?.login === "vercel[bot]" || deployment.performed_via_github_app?.slug === "vercel";
  const isPages = deployment.environment === "github-pages" || deployment.performed_via_github_app?.slug === "github-pages";
  return isVercel || isPages;
}

export function isMergedBranch(compare) {
  return Number(compare?.ahead_by) === 0;
}

export async function assertCloudflareProduction(fetchImpl, siteUrl) {
  const response = await fetchImpl(`${siteUrl.replace(/\/$/, "")}/api/v1/system/status`, {
    headers: { Accept: "application/json", "User-Agent": "santosdodia-hosting-retirement" },
  });
  const server = response.headers.get("server") ?? "";
  if (!server.toLowerCase().includes("cloudflare")) throw new Error(`Production is not served by Cloudflare (server=${server || "missing"}).`);
  if (response.status === 403 && response.headers.has("cf-ray")) {
    return { checkedAt: null, mode: "cloudflare-waf-protected" };
  }
  if (response.status !== 200) throw new Error(`Cloudflare health check returned HTTP ${response.status}.`);
  const payload = await response.json();
  if (payload.status !== "ok") throw new Error(`Production health payload is not ok: ${JSON.stringify(payload)}`);
  return { checkedAt: payload.checkedAt ?? null, mode: "healthy" };
}

async function disablePages(fetchImpl, token, repository) {
  const response = await github(fetchImpl, token, `/repos/${repository}/pages`, { method: "DELETE" });
  if (response.status === 204) return { status: "disabled" };
  if (response.status === 404) return { status: "already-disabled" };
  if (response.status === 403) {
    return { status: "permission-blocked", detail: await bodyText(response) };
  }
  await expect(response, [204, 404], "Disable GitHub Pages");
}

async function deleteDeployment(fetchImpl, token, repository, deployment) {
  let response = await github(fetchImpl, token, `/repos/${repository}/deployments/${deployment.id}`, { method: "DELETE" });
  if (response.status === 204) return;
  if (response.status !== 422) await expect(response, [204], `Delete deployment ${deployment.id}`);

  response = await github(fetchImpl, token, `/repos/${repository}/deployments/${deployment.id}/statuses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: "inactive",
      description: "Retired hosting provider cleanup",
      auto_inactive: false,
    }),
  });
  await expect(response, [201], `Deactivate deployment ${deployment.id}`);

  response = await github(fetchImpl, token, `/repos/${repository}/deployments/${deployment.id}`, { method: "DELETE" });
  await expect(response, [204], `Delete inactive deployment ${deployment.id}`);
}

async function deleteRetiredEnvironments(fetchImpl, token, repository, deployments) {
  const deleted = [];
  const permissionBlocked = [];
  for (const environment of RETIRED_ENVIRONMENTS) {
    const hasUnrelatedDeployment = deployments.some(
      (deployment) => deployment.environment === environment && !isRetiredDeployment(deployment),
    );
    if (hasUnrelatedDeployment) continue;
    const response = await github(
      fetchImpl,
      token,
      `/repos/${repository}/environments/${encodeURIComponent(environment)}`,
      { method: "DELETE" },
    );
    if (response.status === 403) {
      permissionBlocked.push(environment);
      continue;
    }
    await expect(response, [204, 404], `Delete retired environment ${environment}`);
    if (response.status === 204) deleted.push(environment);
  }
  return { deleted, permissionBlocked };
}

async function deleteMergedBranches(fetchImpl, token, repository) {
  const branches = await collectPages(fetchImpl, token, repository, "branches");
  const deleted = [];
  const retained = [];

  for (const branch of branches) {
    if (PRESERVED_BRANCHES.has(branch.name) || branch.protected) {
      retained.push({ name: branch.name, reason: "preserved-or-protected" });
      continue;
    }
    const response = await github(
      fetchImpl,
      token,
      `/repos/${repository}/compare/main...${encodeURIComponent(branch.name)}`,
    );
    const compare = await expect(response, [200], `Compare branch ${branch.name}`);
    if (!isMergedBranch(compare)) {
      retained.push({ name: branch.name, reason: `${compare.ahead_by} unique commit(s)` });
      continue;
    }
    const deletion = await github(
      fetchImpl,
      token,
      `/repos/${repository}/git/refs/heads/${encodeURIComponent(branch.name)}`,
      { method: "DELETE" },
    );
    await expect(deletion, [204], `Delete merged branch ${branch.name}`);
    deleted.push(branch.name);
  }
  return { deleted, retained };
}

export async function retireGithubHosting({
  fetchImpl = fetch,
  repository,
  token,
  siteUrl,
}) {
  const beforeHealth = await assertCloudflareProduction(fetchImpl, siteUrl);
  const deployments = await collectPages(fetchImpl, token, repository, "deployments");
  const retired = deployments.filter(isRetiredDeployment);
  const retiredByEnvironment = Object.fromEntries(
    [...new Set(retired.map((deployment) => deployment.environment))]
      .sort()
      .map((environment) => [environment, retired.filter((deployment) => deployment.environment === environment).length]),
  );

  const pages = await disablePages(fetchImpl, token, repository);
  for (const deployment of retired) await deleteDeployment(fetchImpl, token, repository, deployment);
  const environments = await deleteRetiredEnvironments(fetchImpl, token, repository, deployments);
  const branches = await deleteMergedBranches(fetchImpl, token, repository);

  const remaining = (await collectPages(fetchImpl, token, repository, "deployments")).filter(isRetiredDeployment);
  if (remaining.length) throw new Error(`${remaining.length} retired deployments remain after cleanup.`);
  const afterHealth = await assertCloudflareProduction(fetchImpl, siteUrl);

  return {
    repository,
    siteUrl,
    beforeHealth,
    afterHealth,
    pages,
    deploymentsDeleted: retired.length,
    retiredByEnvironment,
    environmentsDeleted: environments.deleted,
    environmentsPermissionBlocked: environments.permissionBlocked,
    branchesDeleted: branches.deleted,
    branchesRetained: branches.retained,
  };
}

async function main() {
  const report = await retireGithubHosting({
    repository: required("GITHUB_REPOSITORY"),
    token: required("GITHUB_TOKEN"),
    siteUrl: process.env.SANTOSDIA_SITE_URL ?? "https://www.santosdodia.com",
  });
  const output = `${JSON.stringify(report, null, 2)}\n`;
  process.stdout.write(output);
  const reportPath = process.env.HOSTING_RETIREMENT_REPORT ?? "/tmp/santosdodia-hosting-retirement.json";
  await writeFile(reportPath, output, "utf8");
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(
      process.env.GITHUB_STEP_SUMMARY,
      `## Retired hosting cleanup\n\n- GitHub Pages: ${report.pages.status}\n- Deployments deleted: ${report.deploymentsDeleted}\n- Environments deleted: ${report.environmentsDeleted.join(", ") || "none"}\n- Environments permission-blocked: ${report.environmentsPermissionBlocked.join(", ") || "none"}\n- Merged branches deleted: ${report.branchesDeleted.length}\n- Cloudflare health mode: ${report.afterHealth.mode}\n`,
      { encoding: "utf8", flag: "a" },
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
