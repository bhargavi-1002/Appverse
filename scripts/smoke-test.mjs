/**
 * End-to-end smoke test for the built site.
 *
 * Serves `dist/` with SPA fallback, then drives a real Chromium browser
 * through the primary user flows at desktop and mobile widths.
 *
 * Run with:  node scripts/smoke-test.mjs
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const PORT = 4319;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const results = [];
let failures = 0;

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function serve() {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    let filePath = join(dist, decodeURIComponent(url.pathname));

    if (!filePath.startsWith(dist)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      // SPA fallback — this is what the Vercel rewrite does in production.
      filePath = join(dist, 'index.html');
    }

    const type = MIME[extname(filePath)] ?? 'application/octet-stream';
    const immutable = filePath.includes(`${'assets'}\\`) || filePath.includes('/assets/');
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    createReadStream(filePath).pipe(res);
  });

  return new Promise((resolveServer) => {
    server.listen(PORT, () => resolveServer(server));
  });
}

const ROUTES = [
  { path: '/', name: 'home', heading: 'AppVerse' },
  { path: '/explore', name: 'explore', heading: 'Explore applications' },
  { path: '/install', name: 'installations', heading: 'Install anything' },
  { path: '/favorites', name: 'favourites', heading: 'Your favourites' },
  { path: '/about', name: 'about', heading: 'One home for everything' },
  { path: '/privacy', name: 'privacy', heading: 'Nothing is collected' },
  { path: '/dashboard', name: 'dashboard', heading: 'Owner dashboard' },
  { path: '/apps/cyber-runner', name: 'app detail', heading: 'Cyber Runner' },
  { path: '/launch/cyber-runner', name: 'launch', heading: 'Cyber Runner' },
  { path: '/this-route-does-not-exist', name: '404', heading: '404' },
];

async function main() {
  if (!existsSync(join(dist, 'index.html'))) {
    console.error('dist/ not found — run `npm run build` first.');
    process.exit(1);
  }

  const server = await serve();
  const base = `http://localhost:${PORT}`;
  console.log(`Serving dist/ on ${base}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

  console.log('Routes');
  for (const route of ROUTES) {
    const response = await page.goto(`${base}${route.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(700);
    const status = response?.status() ?? 0;
    const body = await page.textContent('body');
    const ok = status === 200 && body?.includes(route.heading);
    record(`${route.path} → ${route.name}`, ok, ok ? '' : `status ${status}, heading "${route.heading}" missing`);
  }

  console.log('\nAssets and PWA');
  for (const asset of [
    '/manifest.webmanifest',
    '/sw.js',
    '/icon-192.png',
    '/icon-512.png',
    '/icon-maskable-512.png',
    '/offline.html',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.svg',
    '/icons/cyber-runner.svg',
  ]) {
    const response = await page.request.get(`${base}${asset}`);
    record(asset, response.ok(), response.ok() ? '' : `status ${response.status()}`);
  }

  console.log('\nSearch and filters');
  await page.goto(`${base}/explore`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const search = page.getByRole('searchbox', { name: 'Search applications' });
  await search.fill('snake');
  await page.waitForTimeout(600);
  const snakeVisible = await page.getByText('Neon Snake Pro').first().isVisible();
  record('search finds "Neon Snake Pro"', snakeVisible);

  await search.fill('zzzz-not-a-real-app');
  await page.waitForTimeout(600);
  const emptyState = await page.getByText('No applications match those filters').isVisible();
  record('empty state appears for a non-matching search', emptyState);

  await search.fill('');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Games', exact: false }).first().click();
  await page.waitForTimeout(500);
  const filteredUrl = page.url();
  record('category filter is written to the URL', filteredUrl.includes('category=Games'), filteredUrl);

  console.log('\nKeyboard navigation');
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.keyboard.press('/');
  await page.waitForTimeout(500);
  const dialogVisible = await page.getByRole('dialog', { name: 'Search applications' }).isVisible();
  record('"/" opens the search dialog', dialogVisible);
  await page.keyboard.type('snake');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  record('Enter opens the highlighted result', page.url().includes('/apps/snake-game'), page.url());

  console.log('\nFavourites');
  await page.goto(`${base}/apps/cyber-runner`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Save' }).first().click();
  await page.waitForTimeout(400);
  await page.goto(`${base}/favorites`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const favouriteListed = await page.getByText('Cyber Runner').first().isVisible();
  record('a saved application appears on the favourites page', favouriteListed);

  console.log('\nTheme toggle');
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.getByRole('radio', { name: 'Light theme' }).click();
  await page.waitForTimeout(400);
  const isLight = await page.evaluate(() => document.documentElement.classList.contains('light'));
  record('light theme applies to the document root', isLight);
  await page.getByRole('radio', { name: 'Dark theme' }).click();
  await page.waitForTimeout(300);

  console.log('\nResponsive layout');
  for (const width of [320, 360, 390, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    record(`no horizontal overflow at ${width}px`, overflow <= 1, `overflow ${overflow}px`);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${base}/explore`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const exploreOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  record('no horizontal overflow on /explore at 320px', exploreOverflow <= 1, `overflow ${exploreOverflow}px`);

  console.log('\nAccessibility spot checks');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const h1Count = await page.locator('h1').count();
  record('exactly one h1 on the home page', h1Count === 1, `found ${h1Count}`);
  const imagesWithoutAlt = await page.evaluate(
    () => Array.from(document.querySelectorAll('img')).filter((img) => !img.hasAttribute('alt')).length,
  );
  record('every image has an alt attribute', imagesWithoutAlt === 0, `${imagesWithoutAlt} missing`);
  const externalLinksUnsafe = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[target="_blank"]')).filter(
      (a) => !(a.getAttribute('rel') ?? '').includes('noopener'),
    ).length,
  );
  record('external links use rel="noopener"', externalLinksUnsafe === 0, `${externalLinksUnsafe} unsafe`);
  const lang = await page.getAttribute('html', 'lang');
  record('html element declares a language', Boolean(lang), lang ?? 'missing');

  console.log('\nConsole');
  const realErrors = consoleErrors.filter(
    (message) =>
      !message.includes('favicon') &&
      !message.includes('Failed to load resource: the server responded with a status of 404'),
  );
  record('no console errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

  await browser.close();
  server.close();

  console.log(
    `\n${results.length - failures}/${results.length} checks passed${failures ? ` — ${failures} FAILED` : ''}`,
  );
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
