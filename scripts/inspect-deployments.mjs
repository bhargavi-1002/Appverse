/**
 * Prints the visible text of each deployed application so the registry
 * descriptions can be written against what visitors actually see.
 *
 * Run with:  node scripts/inspect-live.mjs
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const source = await readFile(resolve(root, 'src', 'data', 'apps.ts'), 'utf8');
const regex = /slug:\s*'([a-z0-9-]+)'((?:(?!\{)[\s\S])*?)liveUrl:\s*'([^']+)'/g;
const entries = [];
let match;
while ((match = regex.exec(source)) !== null) entries.push([match[1], match[3]]);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

for (const [slug, url] of entries) {
  console.log(`\n======== ${slug} :: ${url} ========`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(3500);
    const text = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const out = [];
      let node = walker.nextNode();
      while (node) {
        const value = node.textContent?.trim();
        if (value && value.length > 1 && value.length < 140) out.push(value);
        node = walker.nextNode();
      }
      return [...new Set(out)].join(' | ');
    });
    console.log(text.slice(0, 2200));
    const title = await page.title();
    console.log(`--- title: ${title}`);
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
  }
}

await browser.close();
