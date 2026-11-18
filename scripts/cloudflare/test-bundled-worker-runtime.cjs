/* eslint-disable @typescript-eslint/no-require-imports -- CJS host is required to reproduce the Worker bundle accurately. */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const openNextDirectory = path.join(root, '.open-next');
const outputDirectory = fs.mkdtempSync(path.join(openNextDirectory, 'runtime-test-'));
const wrangler = path.join(root, 'node_modules', '.bin', 'wrangler');

async function main() {
  assert.ok(fs.existsSync(path.join(openNextDirectory, 'worker.js')), 'Run cloudflare:build before cloudflare:runtime-test.');

  execFileSync(wrangler, ['deploy', '--dry-run', '--outdir', outputDirectory], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const { Miniflare, convertV4MiniflareOptions, kCurrentWorker } = await import('miniflare');
  const scriptPath = path.relative(root, path.join(outputDirectory, 'worker.js')).split(path.sep).join('/');
  const options = convertV4MiniflareOptions({
    rootPath: root,
    modules: true,
    modulesRoot: root,
    scriptPath,
    compatibilityDate: '2026-08-02',
    compatibilityFlags: ['nodejs_compat', 'global_fetch_strictly_public'],
    d1Databases: { CALENDAR_DB: 'santosdodia-runtime-test' },
    serviceBindings: { WORKER_SELF_REFERENCE: kCurrentWorker },
    assets: { directory: '.open-next/assets', binding: 'ASSETS' },
  });

  const miniflare = new Miniflare(options);
  try {
    const worker = await miniflare.getWorker();
    for (const pathname of ['/', '/api/v1/system/status', '/openapi.json']) {
      const response = await worker.fetch(`http://localhost${pathname}`);
      assert.equal(response.status, 200, `${pathname} returned HTTP ${response.status}`);
      if (pathname === '/api/v1/system/status') {
        const body = await response.json();
        assert.equal(body.status, 'ok', 'Worker status contract is not healthy.');
      }
    }
  } finally {
    await miniflare.dispose();
  }

  console.log('Bundled Cloudflare Worker runtime passed: homepage, status and OpenAPI returned HTTP 200.');
}

main()
  .finally(() => fs.rmSync(outputDirectory, { recursive: true, force: true }))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
