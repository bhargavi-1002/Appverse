/**
 * Converts the captured screenshots to WebP at a sensible display size.
 *
 * Run with:  node scripts/optimise-screenshots.mjs
 *
 * Keeping the originals as PNG in `public/screenshots/raw/` means the
 * capture script can always be re-run without losing quality.
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = resolve(root, '.screenshots-raw');
const shotsDir = resolve(root, 'public', 'screenshots');

const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTH = 828;

async function main() {
  await mkdir(shotsDir, { recursive: true });
  await mkdir(rawDir, { recursive: true });

  const files = (await readdir(rawDir)).filter((file) => file.endsWith('.png'));
  if (files.length === 0) {
    console.log('No raw screenshots found — run `npm run capture` first.');
    return;
  }

  let before = 0;
  let after = 0;

  for (const file of files) {
    const input = resolve(rawDir, file);
    const output = resolve(shotsDir, file.replace(/\.png$/, '.webp'));
    const isMobile = file.endsWith('-2.png');
    const width = isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH;

    before += (await stat(input)).size;

    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(output);

    after += (await stat(output)).size;

    console.log(`  ✓ ${file} → ${file.replace(/\.png$/, '.webp')} (${Math.round((await stat(output)).size / 1024)} KB)`);
  }

  console.log(
    `\n${Math.round(before / 1024)} KB of PNG → ${Math.round(after / 1024)} KB of WebP (${Math.round((1 - after / before) * 100)}% smaller)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
