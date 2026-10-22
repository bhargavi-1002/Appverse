/**
 * Verifies the installability of every deployed application.
 *
 * The check runs here, on the server side, because a browser cannot fetch a
 * cross-origin manifest without CORS headers — most deployments do not send
 * them. The results are written to `src/data/manifest-cache.json` and read by
 * the application pages, so the site never makes a GitHub-style request for
 * every repository on every page load.
 *
 * Run with:  npm run verify:manifests
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(root, 'src', 'data', 'manifest-cache.json');

const MANIFEST_CANDIDATES = [
  '/manifest.json',
  '/manifest.webmanifest',
  '/site.webmanifest',
  '/manifest',
];

const source = await import('node:fs/promises').then((fs) =>
  fs.readFile(resolve(root, 'src', 'data', 'apps.ts'), 'utf8'),
);

const entries = [];
const regex = /slug:\s*'([a-z0-9-]+)'((?:(?!\{)[\s\S])*?)liveUrl:\s*'([^']+)'/g;
let match;
while ((match = regex.exec(source)) !== null) {
  entries.push({ slug: match[1], liveUrl: match[3] });
}

function parseIconSizes(icons) {
  if (!Array.isArray(icons)) return [];
  return icons
    .map((icon) => {
      if (!icon || typeof icon !== 'object') return 0;
      const sizes = icon.sizes;
      if (typeof sizes !== 'string') return 0;
      const numbers = sizes.match(/\d+/g);
      if (!numbers) return 0;
      return Math.max(...numbers.map((value) => Number.parseInt(value, 10)));
    })
    .filter((size) => Number.isFinite(size));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Check whether the deployment can actually be installed, using a real
 * browser.
 *
 * Chrome is the authority here: it fires `beforeinstallprompt` only when
 * every one of its install criteria is satisfied — a manifest with a name, a
 * start URL, a standalone display mode and 192px/512px icons, served over
 * HTTPS, with a registered service worker that has a fetch handler.
 *
 * Two things commonly fool a naive check, and both are handled here:
 *
 *  1. The service worker file exists but the app never registers it.
 *  2. The app registers it and then immediately unregisters it — which is
 *     exactly what the Create React App default does.
 */
async function verifyInBrowser(base, browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Capture the browser's own install signal before any app script runs.
  await page.addInitScript(() => {
    window.__appverseInstallPrompt = false;
    window.addEventListener('beforeinstallprompt', () => {
      window.__appverseInstallPrompt = true;
    });
  });

  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  } catch {
    await context.close();
    return {
      registered: false,
      promptFired: false,
      detail: 'The deployment could not be loaded, so its service worker could not be checked.',
    };
  }

  // Give the app time to register its service worker and for the browser to
  // decide whether an install prompt is possible.
  await page.waitForTimeout(6000);

  let registrations = [];
  try {
    registrations = await page.evaluate(async () => {
      const list = await navigator.serviceWorker.getRegistrations();
      return list.map((registration) => ({
        scope: registration.scope,
        active: registration.active?.scriptURL ?? null,
        waiting: registration.waiting?.scriptURL ?? null,
      }));
    });
  } catch {
    /* service workers are unavailable in some contexts */
  }

  const promptFired = await page.evaluate(() => window.__appverseInstallPrompt === true);
  const controlled = await page.evaluate(() => navigator.serviceWorker?.controller != null);

  await context.close();

  if (promptFired) {
    return {
      registered: true,
      promptFired: true,
      detail:
        'The browser offered its own install prompt, which means every install criterion is satisfied.',
    };
  }

  if (registrations.length === 0) {
    return {
      registered: false,
      promptFired: false,
      detail:
        'No service worker is registered, and browsers require one with a fetch handler before they will offer an install prompt.',
    };
  }

  const scope = registrations[0].scope ?? 'the site';
  return {
    registered: controlled,
    promptFired: false,
    detail: controlled
      ? `A service worker is registered for ${scope}, but the browser did not offer an install prompt, so another install criterion is still missing.`
      : `A service worker file is registered for ${scope} but it is not controlling the page, so the browser will not offer an install prompt.`,
  };
}

async function verify(app, browser) {
  const criteria = [];
  const base = app.liveUrl;

  const https = base.startsWith('https://');
  criteria.push({
    id: 'https',
    label: 'Served over HTTPS',
    passed: https,
    detail: https
      ? 'The deployment uses a secure origin, which browsers require for installation.'
      : 'Installation requires HTTPS. This deployment is not served over a secure origin.',
  });

  let manifest = null;
  let manifestUrl = null;

  for (const candidate of MANIFEST_CANDIDATES) {
    const url = new URL(candidate, base).toString();
    try {
      const response = await fetchWithTimeout(url, {
        headers: { 'User-Agent': 'appverse-manifest-check' },
        redirect: 'follow',
      });
      if (!response.ok) continue;
      const contentType = response.headers.get('content-type') ?? '';
      const body = await response.text();
      if (contentType.includes('text/html') || body.trimStart().startsWith('<')) continue;
      const parsed = JSON.parse(body);
      if (!parsed || typeof parsed !== 'object') continue;
      manifest = parsed;
      manifestUrl = url;
      break;
    } catch {
      /* try the next candidate */
    }
  }

  if (!manifest) {
    criteria.push({
      id: 'manifest',
      label: 'Web app manifest',
      passed: false,
      detail:
        'No web app manifest was found at the standard paths, so the browser will not offer an install prompt for this app.',
    });
  } else {
    criteria.push({
      id: 'manifest',
      label: 'Web app manifest',
      passed: true,
      detail: `A manifest was found at ${manifestUrl}.`,
    });

    const name = typeof manifest.name === 'string' ? manifest.name : undefined;
    const shortName = typeof manifest.short_name === 'string' ? manifest.short_name : undefined;
    criteria.push({
      id: 'name',
      label: 'Named application',
      passed: Boolean(name || shortName),
      detail:
        name || shortName
          ? `The manifest names the app "${name ?? shortName}".`
          : 'The manifest has no name or short_name.',
    });

    const startUrl = manifest.start_url;
    criteria.push({
      id: 'start-url',
      label: 'Start URL',
      passed: typeof startUrl === 'string' && startUrl.length > 0,
      detail:
        typeof startUrl === 'string' && startUrl.length > 0
          ? `The app starts from ${startUrl}.`
          : 'The manifest has no start_url.',
    });

    const display = typeof manifest.display === 'string' ? manifest.display : undefined;
    const displayOk = ['standalone', 'fullscreen', 'minimal-ui'].includes(display ?? '');
    criteria.push({
      id: 'display',
      label: 'Standalone display mode',
      passed: displayOk,
      detail: displayOk
        ? `The manifest requests "${display}" mode.`
        : display
          ? `The manifest requests "${display}" mode, which browsers do not treat as installable.`
          : 'The manifest does not declare a display mode, so it falls back to "browser".',
    });

    const sizes = parseIconSizes(manifest.icons);
    const has192 = sizes.some((size) => size >= 192);
    const has512 = sizes.some((size) => size >= 512);
    criteria.push({
      id: 'icons',
      label: 'Launcher icons (192px and 512px)',
      passed: has192 && has512,
      detail:
        has192 && has512
          ? 'The manifest ships both a 192px and a 512px icon.'
          : `The manifest icon sizes are ${
              sizes.length ? `${sizes.join(', ')}px` : 'not declared'
            } — browsers ask for at least 192px and 512px.`,
    });
  }

  const serviceWorker = await verifyInBrowser(base, browser);
  criteria.push({
    id: 'service-worker',
    label: 'Service worker and install prompt',
    passed: serviceWorker.promptFired,
    detail: serviceWorker.detail,
  });

  const failed = criteria.filter((criterion) => criterion.passed === false);
  const status = failed.length > 0 ? 'not-installable' : 'installable';

  return {
    status,
    manifestUrl,
    manifestName:
      (typeof manifest?.name === 'string' ? manifest.name : null) ??
      (typeof manifest?.short_name === 'string' ? manifest.short_name : null),
    manifestDisplay: typeof manifest?.display === 'string' ? manifest.display : null,
    criteria,
  };
}

async function main() {
  console.log(`Verifying the installability of ${entries.length} deployments…`);
  const result = { generatedAt: new Date().toISOString(), apps: {} };

  const browser = await chromium.launch();

  for (const entry of entries) {
    const report = await verify(entry, browser);
    result.apps[entry.slug] = report;
    console.log(
      `  ${report.status === 'installable' ? '✓' : '·'} ${entry.slug}: ${report.status}${
        report.manifestName ? ` (${report.manifestName})` : ''
      }`,
    );
  }

  await browser.close();

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${outFile.replace(root, '.')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
