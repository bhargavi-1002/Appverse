/**
 * Generates the PNG app icons + social share image for AppVerse from the
 * hand-authored SVG sources in `public/`.
 *
 * Run with:  npm run icons
 */
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'public');

const readSvg = async (name) => readFile(resolve(publicDir, name), 'utf8');

async function png(sourceSvg, size, outFile) {
  await sharp(Buffer.from(sourceSvg))
    .resize(size, size, { fit: 'contain', background: '#070912' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(publicDir, outFile));
  console.log(`  ✓ ${outFile} (${size}x${size})`);
}

async function generateOgImage() {
  const logo = await readSvg('favicon.svg');
  const logoData = Buffer.from(logo).toString('base64');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d1d"/>
      <stop offset="55%" stop-color="#06070f"/>
      <stop offset="100%" stop-color="#100c26"/>
    </linearGradient>
    <radialGradient id="glowA" cx="18%" cy="8%" r="62%">
      <stop offset="0%" stop-color="#7c5cff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#7c5cff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="88%" cy="92%" r="58%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="type" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#c9bcff"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glowA)"/>
  <rect width="1200" height="630" fill="url(#glowB)"/>

  <g transform="translate(88 150)">
    <image href="data:image/svg+xml;base64,${logoData}" x="0" y="0" width="150" height="150"/>
  </g>

  <text x="88" y="390" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="104" font-weight="700" letter-spacing="-4" fill="url(#type)">AppVerse</text>
  <text x="88" y="452" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="34" font-weight="500" fill="#9aa1c4">Your apps. Your ecosystem. One destination.</text>

  <g transform="translate(88 500)">
    <rect x="0" y="0" width="330" height="56" rx="28" fill="#7c5cff" fill-opacity="0.16" stroke="#7c5cff" stroke-opacity="0.45"/>
    <text x="165" y="36" text-anchor="middle" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="22" font-weight="600" fill="#c9bcff">Browse  ·  Open  ·  Install</text>
  </g>

  <text x="1112" y="580" text-anchor="end" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="#6f769b">Built by Bhargavi</text>
</svg>`;

  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(resolve(publicDir, 'og-image.png'));
  console.log('  ✓ og-image.png (1200x630)');
}

async function main() {
  console.log('Generating AppVerse icons…');
  await mkdir(resolve(publicDir, 'icons'), { recursive: true });

  const standard = await readSvg('favicon.svg');
  const maskable = await readSvg('favicon-maskable.svg');

  await png(standard, 192, 'icon-192.png');
  await png(standard, 512, 'icon-512.png');
  await png(standard, 180, 'apple-touch-icon.png');
  await png(maskable, 192, 'icon-maskable-192.png');
  await png(maskable, 512, 'icon-maskable-512.png');
  await generateOgImage();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
