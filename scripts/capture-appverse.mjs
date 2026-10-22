import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const out = resolve(root, '.screenshots-raw');
const PORT = 4322;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  let filePath = join(dist, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(dist)) return void res.writeHead(403).end();
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath) || !statSync(filePath).isFile()) filePath = join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const shots = [
  { path: '/', name: 'home-desktop', width: 1440, height: 1000 },
  { path: '/explore', name: 'explore-desktop', width: 1440, height: 1000 },
  { path: '/apps/cyber-runner', name: 'detail-desktop', width: 1440, height: 1200 },
  { path: '/install', name: 'install-desktop', width: 1440, height: 1200 },
  { path: '/', name: 'home-mobile', width: 390, height: 900 },
  { path: '/explore', name: 'explore-mobile', width: 390, height: 900 },
];

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 1, colorScheme: 'dark' });
const page = await context.newPage();

for (const shot of shots) {
  await page.setViewportSize({ width: shot.width, height: shot.height });
  await page.goto(`http://localhost:${PORT}${shot.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(out, `appverse-${shot.name}.png`) });
  console.log(`  ✓ appverse-${shot.name}.png`);
}

await browser.close();
server.close();
