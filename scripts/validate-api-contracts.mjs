import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const appRoot = resolve(root, 'app');
const openApiRoute = resolve(appRoot, 'openapi.json/route.ts');
const readmePath = resolve(root, 'README.md');

async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(path));
    else output.push(path);
  }
  return output;
}

function routePath(file) {
  const relativePath = relative(appRoot, file).split(sep).join('/');
  if (!relativePath.endsWith('/route.ts')) return undefined;
  const directory = relativePath.slice(0, -'/route.ts'.length);
  return `/${directory}`.replace(/\[([^/]+)\]/g, '{$1}');
}

function documentedOpenApiPaths(source) {
  const matches = source.matchAll(/['"](\/api\/[^'"]+)['"]\s*:\s*\{/g);
  return new Set([...matches].map(match => match[1]));
}

function readmePaths(source) {
  return new Set([...source.matchAll(/`(\/api\/[^`]+|\/openapi\.json)`/g)].map(match => match[1]));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function routeMatches(template, candidate) {
  const pattern = `^${escapeRegex(template).replace(/\\\{[^/]+\\\}/g, '[^/]+')}$`;
  return new RegExp(pattern).test(candidate);
}

function hasMatchingPath(paths, candidate) {
  return [...paths].some(path => routeMatches(path, candidate) || routeMatches(candidate, path));
}

const [routeFiles, openApiSource, readme] = await Promise.all([
  filesUnder(appRoot),
  readFile(openApiRoute, 'utf8'),
  readFile(readmePath, 'utf8')
]);

const actualRoutes = new Set(routeFiles.map(routePath).filter(Boolean));
const openApiPaths = documentedOpenApiPaths(openApiSource);
const publicReadmePaths = readmePaths(readme);
const errors = [];
const warnings = [];

for (const path of openApiPaths) {
  if (!hasMatchingPath(actualRoutes, path)) errors.push(`OpenAPI documents a route that does not exist: ${path}`);
}

for (const path of publicReadmePaths) {
  if (!hasMatchingPath(actualRoutes, path)) errors.push(`README documents a route that does not exist: ${path}`);
  if (path.startsWith('/api/') && !path.startsWith('/api/v1/system/') && !hasMatchingPath(openApiPaths, path)) {
    warnings.push(`README route is not represented in OpenAPI: ${path}`);
  }
}

const publicApiRoutes = [...actualRoutes]
  .filter(path => path.startsWith('/api/v1/') || path.startsWith('/api/ical/'))
  .sort();

for (const path of publicApiRoutes) {
  if (path === '/api/v1/system/status') continue;
  if (!hasMatchingPath(openApiPaths, path)) warnings.push(`Public route is not represented in OpenAPI: ${path}`);
}

const report = {
  actualRouteCount: actualRoutes.size,
  publicApiRouteCount: publicApiRoutes.length,
  openApiPathCount: openApiPaths.size,
  readmePublicPathCount: publicReadmePaths.size,
  errors,
  warnings
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
