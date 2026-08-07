#!/usr/bin/env node

const TARGETS = new Map([
  ['agent/biography-fallback-rebased', '557584abf1b997543a1cf70a1243e70a7cd78265'],
  ['agent/calendar-read-model', '21feea53aec5af25621044966d25bb512df2278c'],
  ['agent/fix-live-localization-biographies', '53e3e8f50e34c22cf7304f1bc8bafae14b6ceda3'],
  ['agent/osint-data-platform-foundation', '5f3513a206b7604eb45ae523e2b633ea09f6c7e0'],
  ['agent/osint-wikidata-normalization-phase2', 'cd3d93a35195e1fce5f49b0d1c55ce997f191060'],
  ['agent/production-hardening', '738026d8f7d86428510d0d1bc49f542fcbd09095'],
  ['agent/security-litcal-hardening', '9ab5b49639a1b3de6ddfaea9835b555ccdceba04'],
  ['agent/wikidata-pilot-archive', '773b0007c54411299673baad54e1a0fc549f3041'],
  ['automation/osint-candidates', 'ddc1955aae9e2d3884c6db7e5f602b8c0fedb21f'],
  ['codex/evaluate-all-code-in-main', 'fc968741b90563e12a396786444c27381b137a9f'],
]);

async function json(response, label) {
  const body = await response.text();
  const value = body ? JSON.parse(body) : null;
  if (!response.ok) throw new Error(`${label} failed (${response.status}): ${body}`);
  return value;
}

export async function retireReviewedBranches({ fetchImpl, token, repository, expectedMainSha }) {
  if (!token || !repository || !expectedMainSha) throw new Error('token, repository and expectedMainSha are required.');
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  const api = (path, init = {}) => fetchImpl(`https://api.github.com${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const main = await json(await api(`/repos/${repository}/git/ref/heads/main`), 'Read main ref');
  if (main?.object?.sha !== expectedMainSha) throw new Error(`main moved: expected ${expectedMainSha}, found ${main?.object?.sha ?? '<missing>'}`);

  const owner = repository.split('/')[0];
  const deleted = [];
  const alreadyAbsent = [];
  for (const [branch, expectedSha] of TARGETS) {
    const encodedBranch = branch.split('/').map(encodeURIComponent).join('/');
    const readRefPath = `/repos/${repository}/git/ref/heads/${encodedBranch}`;
    const deleteRefPath = `/repos/${repository}/git/refs/heads/${encodedBranch}`;
    const refResponse = await api(readRefPath);
    if (refResponse.status === 404) {
      alreadyAbsent.push(branch);
      continue;
    }
    const ref = await json(refResponse, `Read ${branch}`);
    if (ref?.object?.sha !== expectedSha) throw new Error(`${branch} moved: expected ${expectedSha}, found ${ref?.object?.sha ?? '<missing>'}`);
    const pulls = await json(await api(`/repos/${repository}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}&per_page=1`), `Check open PRs for ${branch}`);
    if (pulls.length) throw new Error(`${branch} has an open pull request and will not be deleted.`);
    const response = await api(deleteRefPath, { method: 'DELETE' });
    if (response.status !== 204) await json(response, `Delete ${branch}`);
    deleted.push(branch);
  }
  return { deleted, alreadyAbsent };
}

async function main() {
  const report = await retireReviewedBranches({
    fetchImpl: fetch,
    token: process.env.GITHUB_TOKEN,
    repository: process.env.GITHUB_REPOSITORY,
    expectedMainSha: process.env.GITHUB_SHA,
  });
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1]?.endsWith('/retire-reviewed-obsolete-branches.mjs')) {
  main().catch((error) => {
    console.error(`Reviewed branch retirement failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
