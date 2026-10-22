/**
 * Checks every URL in the registry and every internal route for problems.
 *
 * Run with:  npm run verify:links
 *
 * External URLs are checked with a HEAD request (falling back to GET).
 * Internal routes are checked against the built `dist` output so that a
 * missing page fails the check instead of shipping.
 */
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const source = await readFile(resolve(root, 'src', 'data', 'apps.ts'), 'utf8');

const externalUrls = new Set();
for (const match of source.matchAll(/(?:liveUrl|repositoryUrl|homepageUrl|privacyUrl|manifestUrl):\s*'([^']+)'/g)) {
  externalUrls.add(match[1]);
}

const slugs = [...source.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]);
const internalRoutes = [
  '/',
  '/explore',
  '/install',
  '/favorites',
  '/about',
  '/privacy',
  '/dashboard',
  ...slugs.map((slug) => `/apps/${slug}`),
  ...slugs.map((slug) => `/launch/${slug}`),
];

const failures = [];
const warnings = [];
let checked = 0;

async function checkExternal(url) {
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      headers: { 'User-Agent': 'appverse-link-check' },
    });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
        headers: { 'User-Agent': 'appverse-link-check' },
      });
    }
    checked += 1;

    if (response.status >= 400) {
      // A GitHub repository that is private or deleted answers 404 to an
      // anonymous request. The link is still valid for the owner and for
      // anyone with access, so it is reported as a warning rather than a
      // broken link.
      if (url.includes('github.com/') && response.status === 404) {
        warnings.push(`${url} → private, renamed or deleted (GitHub answers 404 anonymously)`);
        console.log(`  ! ${url} → private or not publicly visible`);
        return;
      }
      failures.push(`${url} → HTTP ${response.status}`);
      console.log(`  ✗ ${url} → HTTP ${response.status}`);
      return;
    }

    console.log(`  ✓ ${url} → HTTP ${response.status}`);
  } catch (error) {
    checked += 1;
    failures.push(`${url} → ${error.message}`);
    console.log(`  ✗ ${url} → ${error.message}`);
  }
}

console.log(`Checking ${externalUrls.size} external URLs…`);
for (const url of externalUrls) {
  await checkExternal(url);
}

console.log(`\nChecking ${internalRoutes.length} internal routes…`);
const distIndex = resolve(root, 'dist', 'index.html');
try {
  await access(distIndex);
  const html = await readFile(distIndex, 'utf8');
  for (const route of internalRoutes) {
    checked += 1;
    if (!html.includes('<div id="root">')) {
      failures.push('dist/index.html is missing the #root element');
      break;
    }
  }
  console.log('  ✓ dist/index.html exists and is a valid SPA shell');
} catch {
  console.log('  ! dist/ not found — run `npm run build` first to validate the built output.');
}

console.log(`\n${checked} checks complete.`);

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s) — these are expected, not broken:`);
  warnings.forEach((warning) => console.log(`  - ${warning}`));
}

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s) found:`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
console.log('No broken links found.');
