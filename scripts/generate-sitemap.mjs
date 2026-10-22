/**
 * Generates `public/sitemap.xml` from the application registry.
 *
 * Run with:  npm run sitemap   (also runs automatically before `npm run build`)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = (process.env.VITE_SITE_URL || 'https://appverse.vercel.app').replace(/\/$/, '');

const source = await readFile(resolve(root, 'src', 'data', 'apps.ts'), 'utf8');
const slugs = [...source.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]);

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/explore', priority: '0.9', changefreq: 'weekly' },
  { path: '/install', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
  { path: '/favorites', priority: '0.3', changefreq: 'monthly' },
];

const today = new Date().toISOString().slice(0, 10);

const entries = [
  ...staticRoutes.map(
    (route) =>
      `  <url>\n    <loc>${siteUrl}${route.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`,
  ),
  ...slugs.map(
    (slug) =>
      `  <url>\n    <loc>${siteUrl}/apps/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${monthlyOrWeekly(slug)}</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  ),
];

function monthlyOrWeekly() {
  return 'monthly';
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

await writeFile(resolve(root, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`✓ public/sitemap.xml (${entries.length} URLs)`);
