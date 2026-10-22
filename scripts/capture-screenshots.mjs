/**
 * Captures real screenshots of each deployed application listed in
 * `src/data/apps.ts` so the marketplace shows the actual product rather than
 * placeholder art.
 *
 * Raw PNGs are written to `.screenshots-raw/` at the repository root, then
 * `node scripts/optimise-screenshots.mjs` converts them to WebP inside
 * `public/screenshots/`.
 *
 * Run with:  node scripts/capture-screenshots.mjs [--only <slug>]
 *
 * This script is intentionally NOT part of the build: it needs network access
 * and a Chromium download. The optimised results are committed.
 */
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, '.screenshots-raw');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800, isMobile: false },
  { name: 'mobile', width: 414, height: 896, isMobile: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(page, url, file, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(1200);
  // Give client-side routing / hydration a moment, then let the page settle.
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(3000);
  await page.screenshot({ path: file, animations: 'disabled' });
  console.log(`  ✓ ${file.replace(root, '.')}`);
}

async function main() {
  const onlyIndex = process.argv.indexOf('--only');
  const only = onlyIndex > -1 ? process.argv[onlyIndex + 1] : null;

  const source = await readFile(resolve(root, 'src', 'data', 'apps.ts'), 'utf8');
  const liveUrls = new Map();
  // Only match within a single record — never let a slug borrow the liveUrl
  // of the next object.
  const regex = /slug:\s*'([a-z0-9-]+)'((?:(?!\{)[\s\S])*?)liveUrl:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    liveUrls.set(match[1], match[3]);
  }

  if (liveUrls.size === 0) {
    console.error('No liveUrl entries found in src/data/apps.ts');
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  for (const [slug, url] of liveUrls) {
    if (only && slug !== only) continue;
    console.log(`Capturing ${slug} — ${url}`);
    try {
      await capture(page, url, resolve(outDir, `${slug}-1.png`), VIEWPORTS[0]);
      await capture(page, url, resolve(outDir, `${slug}-2.png`), VIEWPORTS[1]);
    } catch (error) {
      console.warn(`  ! skipped ${slug}: ${error.message}`);
    }
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
