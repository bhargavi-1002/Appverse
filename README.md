# AppVerse

**Your apps. Your ecosystem. One destination.**

AppVerse is a personal application marketplace — a single, installable web app where every
project has its own page, a live demo, honest installation notes and a link back to its source.

Built by **Bhargavi**.

**Live site:** <https://appverse-rho.vercel.app> · **Repository:** <https://github.com/bhargavi-1002/Appverse>

---

## What it does

| Area | What you get |
| --- | --- |
| **Discover** | A premium home page with search, featured apps, recent updates, category shortcuts and real counts. |
| **Explore** | Full-text search across names, descriptions, tags and technologies, with category / platform / installation filters, three sort orders, grid and list layouts, and shareable URLs. |
| **Application pages** | One dedicated, shareable URL per app: screenshots, features, release notes, supported platforms, install instructions, permissions, troubleshooting, related apps, QR sharing and a verified installability report. |
| **Launch** | A confirmation screen with "open in a new tab", "open here" and an optional embedded preview that falls back gracefully when an app refuses to be framed. |
| **Installations** | A full guide for Android, iOS, Windows, macOS and Linux, plus a personal, local-only list of the apps you have chosen to install. |
| **PWA** | AppVerse itself installs as a Progressive Web App: valid manifest, maskable icons, a Workbox service worker, an offline page and a safe update flow. |
| **Owner dashboard** | A device-local registry editor with schema validation, URL checks, JSON import/export and the GitHub sync status table. |

### Honesty rules the codebase enforces

* **No invented metrics.** There are no fake download counts, ratings or user numbers. Every
  statistic on the site is counted from the registry itself.
* **No fake install buttons.** An "Install" action only appears when there is something real to
  install. A browser-only app says so and explains the manual route.
* **Installability is verified, not assumed.** `npm run verify:manifests` drives a real Chromium
  against every deployment and checks the criteria Chrome actually uses — including whether the
  app registers a service worker or immediately unregisters it.
* **Broken things are labelled.** A deployment that currently serves a starter template is marked
  as a placeholder, and the source is promoted instead.

---

## Stack

* **React 19** + **TypeScript** + **Vite 7**
* **React Router 7** — code-split routes
* **Tailwind CSS 4** with a custom token-driven design system (`src/index.css`)
* **Lucide** icons, **Zod** for schema validation, **qrcode** for share codes
* **vite-plugin-pwa** (Workbox) for the service worker and manifest
* **Vitest** + Testing Library for unit tests, **Playwright** for end-to-end checks

No database, no auth provider, no paid service. Public metadata lives in version-controlled
configuration, which is the right trade-off for a catalogue this size.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

### All commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Typecheck → validate the registry → build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint over the whole project. |
| `npm test` | Run the unit test suite. |
| `npm run icons` | Regenerate the PNG app icons and the social share image from `public/favicon.svg`. |
| `npm run sitemap` | Regenerate `public/sitemap.xml` from the registry. |
| `npm run capture` | Re-capture real screenshots of every deployment, then optimise them to WebP. |
| `npm run sync:github` | Refresh the GitHub metadata cache for the configured repositories. |
| `npm run verify:manifests` | Verify the real installability of every deployment. |
| `npm run verify:links` | Check every external URL and internal route for problems. |
| `node scripts/inspect-deployments.mjs` | Print the visible text of every live deployment, so descriptions stay accurate. |

---

## Adding a new application

Everything about an application lives in one record. Adding one means adding a record — no
component changes, no design changes.

**1. Create the icon.** Drop an SVG at `public/icons/<slug>.svg` (128×128 viewBox works well).

**2. Add the record** to `src/data/apps.ts`:

```ts
{
  id: 'my-app',                    // unique, kebab-case
  slug: 'my-app',                  // becomes /apps/my-app
  name: 'My App',
  shortDescription: 'One line, shown on cards and in search results.',
  fullDescription: 'Longer copy. Blank line between paragraphs.',
  icon: '/icons/my-app.svg',
  screenshots: ['/screenshots/my-app-1.webp'],
  category: 'Games',               // Games | Productivity | Utilities | Education | Communication | Developer Tools
  tags: ['arcade', 'canvas'],
  technologies: ['HTML5 Canvas', 'TypeScript'],

  liveUrl: 'https://my-app.vercel.app',
  repositoryUrl: 'https://github.com/bhargavi-1002/my-app',

  version: '1.0.0',
  lastUpdated: '2026-10-22',       // YYYY-MM-DD
  featured: true,
  featuredOrder: 10,               // lower comes first in the featured rail

  installationType: 'web',         // pwa | web | apk | desktop | github
  supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],

  features: ['What it does', 'Why it is good'],
  changelog: [{ version: '1.0.0', date: '2026-10-22', changes: ['First release.'] }],
  permissions: ['Notifications (with your permission)'],
  troubleshooting: [{ problem: 'Something is wrong', fix: 'Try this.' }],
  installationInstructions: [{ title: 'Android', steps: [{ title: '…', detail: '…' }] }],

  verificationStatus: 'verified',  // verified | partial | unverified | source-only
  verificationNotes: ['What exactly was checked.'],
  deploymentStatus: 'live',        // live | placeholder | unavailable
  sample: false,
  accent: '#7c5cff',
}
```

**3. Validate it.**

```bash
npm run typecheck      # the `satisfies AppEntry[]` clause checks every field
npm test               # validates the whole registry against the Zod schema
```

**4. Optional — capture screenshots and verify the deployment.**

```bash
npm run capture                 # real screenshots of the live deployment
npm run verify:manifests        # the real installability report
npm run sync:github             # refresh repository metadata
```

The build is green, the record is validated and the new application appears on the home page,
in Explore, in search and on its own detail page.

### Installation types

| Type | When to use it | What the site shows |
| --- | --- | --- |
| `pwa` | The deployment has a real manifest **and** a registered service worker. | An install prompt and a manifest checklist. |
| `web` | It runs in a browser. | "Open in browser" plus per-platform "Add to Home Screen" instructions. |
| `apk` | You publish an authentic Android package. | A download button with size, source and checksum — and Android's security warning explained. |
| `desktop` | You publish official installers per OS. | OS-specific download links with architecture and version. |
| `github` | Source only, no packaged build. | The repository, plus a note that source code is not a ready-to-install application. |

---

## GitHub integration

`src/data/apps.ts` is the source of truth. GitHub metadata is a **cache**, not a dependency.

```bash
GITHUB_TOKEN=ghp_xxx npm run sync:github
```

* Only repositories that are explicitly listed in the registry are ever requested.
* The token is read from the environment on the server side and is never bundled into the client.
* Missing metadata, deleted repositories, rate limits and network failures are all handled and
  reported — the script skips a record instead of failing the build.
* Manually written descriptions and icons always win over imported metadata.
* The result is written to `src/data/github-cache.json` and committed, so the site never makes a
  GitHub request while a visitor is browsing.
* Private repositories are never exposed by the sync script; the site links to the repository URL
  and lets GitHub handle the sign-in.

Without a token the script still works, using the anonymous 60 requests/hour limit.

---

## The owner dashboard

`/dashboard` is a **device-local** registry editor. It validates every change against the same
schema the build uses, checks that URLs are absolute http(s), previews the detail page, and
imports/exports the registry as JSON so a change can be pasted into `src/data/apps.ts`.

It is deliberately **not** password protected: no authentication backend is configured for this
deployment, so a local editor is the only honest option — it cannot be used to alter the published
site. Hiding the button in the frontend is not security, so the dashboard does not pretend to be
protected.

### Enabling a real, protected admin area

1. Add a server-side auth provider (or a simple signed session) behind the deployment.
2. Move the write path to an API route that checks the session before accepting a change.
3. Replace the dashboard's `localStorage` overlay with a fetch to that route.
4. Put the route behind `robots.txt` and a `noindex` meta tag, and protect it with the platform's
   deployment protection if available.

Until that exists, the dashboard stays local and the README keeps saying so.

---

## Deployment (Vercel)

The project is ready to deploy as-is.

* **Framework preset:** Vite
* **Build command:** `npm run build`
* **Output directory:** `dist`
* **Install command:** `npm install`

`vercel.json` already contains:

* an SPA rewrite that serves `index.html` for client-side routes while leaving static assets alone;
* long-lived immutable caching for `/assets/*` and a `no-cache` policy for `sw.js`;
* `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` and HSTS.

> **Do not enable `cleanUrls`.** With `cleanUrls` on, Vercel serves a 404 for every client-side
> route and the rewrite is silently dropped — the site works on `/` and breaks everywhere else.
> This was found by deploying and checking every route, not by reading the docs.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SITE_URL` | Production | The canonical origin, used for canonical URLs, Open Graph tags and the sitemap. Defaults to `https://appverse-rho.vercel.app`. |
| `GITHUB_TOKEN` | No | Server-side only. Raises the GitHub API rate limit for `npm run sync:github`. |

Copy `.env.example` to `.env.local` for local development. **Never commit real values** — `.env*`
is git-ignored apart from `.env.example`.

### PWA requirements in production

Service workers and install prompts require **HTTPS**. Vercel provides it automatically. The
manifest, the 192px/512px icons, the maskable variants and the offline page are all generated at
build time and served from the same origin as the site.

---

## Accessibility and performance

* Semantic HTML, one `h1` per page, a skip link, labelled controls and visible focus rings.
* All interactive targets are at least 44px.
* `prefers-reduced-motion` is respected throughout.
* Every filter is URL-encoded, so any filtered view can be bookmarked and shared.
* The search dialog is fully keyboard driven (`/` or `Ctrl`/`⌘`+`K` to open, arrows to move,
  `Enter` to open, `Escape` to close).
* No horizontal overflow at 320, 360, 390 or 768px — checked automatically.
* Routes are code-split; Zod and the QR generator are only downloaded when they are needed.
* Screenshots are WebP, fonts are self-hosted Latin subsets, and images are lazy-loaded with
  fixed dimensions so nothing shifts as the page loads.

---

## Testing

```bash
npm test                      # 54 unit tests
node scripts/smoke-test.mjs   # 37 end-to-end checks in a real browser
npm run verify:links          # every external URL and internal route
```

`scripts/smoke-test.mjs` serves the production build, then drives Chromium through the routes,
the PWA assets, search, filters, keyboard navigation, favourites, the theme toggle, four mobile
widths and a set of accessibility spot checks.

---

## Project layout

```
src/
  data/          types.ts (no dependencies), schema.ts (Zod), apps.ts (the registry), caches
  lib/           seo, storage, install, search, github, manifests, utils
  hooks/         useTheme, useExploreFilters, useLocalLists
  components/    Logo, AppCard, AppIcon, AppInstallPanel, SearchDialog, ShareDialog, …
  pages/         Home, Explore, AppDetail, Launch, Installations, Favorites, About, Privacy, Dashboard, NotFound
scripts/         generate-icons, generate-sitemap, capture-screenshots, optimise-screenshots,
                 sync-github, verify-manifests, verify-links, inspect-deployments, smoke-test
public/          favicon, PWA icons, fonts, app icons, screenshots, offline.html, robots.txt
```

---

## Troubleshooting

**The install button never appears.**
Browsers only offer it for sites served over HTTPS that publish a valid manifest *and* run a
registered service worker. Run `npm run verify:manifests` to see exactly which criterion a given
deployment fails.

**A deployment shows the wrong app.**
Set `deploymentStatus: 'placeholder'` on the record. The site then shows a clear warning and
promotes the repository instead of sending visitors to a scaffold.

**GitHub sync reports "not found or not public".**
The repository is private or has been deleted. Set a `GITHUB_TOKEN` to read metadata for
repositories you own, or leave the record as it is — the site still links to the repository and
lets GitHub handle the sign-in.

**The service worker serves an old version.**
The update banner appears when a new version is ready; reload when you are ready. To reset
everything, unregister the service worker in DevTools → Application → Service Workers.

---

## Credits

Inter and Space Grotesk are used under the SIL Open Font License 1.1 — the licence texts are in
`public/fonts/`.

Built by **Bhargavi**.
