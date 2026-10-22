/**
 * Plain types and label maps for the AppVerse registry.
 *
 * This module deliberately contains no runtime dependencies. The Zod schemas
 * in `schema.ts` derive from the same constants, so the two can never drift
 * apart — and because nothing here imports a validation library, the whole
 * registry can be bundled without pulling Zod into every page.
 */

/** Platforms an application can realistically be used on. */
export const PLATFORMS = [
  'web',
  'android',
  'ios',
  'windows',
  'macos',
  'linux',
] as const;

export type Platform = (typeof PLATFORMS)[number];

/**
 * How an application is delivered to a visitor.
 *
 * - `pwa`      — the deployment exposes a valid web app manifest and can be
 *                installed by the browser.
 * - `web`      — a browser-only application. It can be used in a tab and may
 *                be added to the home screen, but it is not a native install.
 * - `apk`      — an authentic Android package is published for download.
 * - `desktop`  — official installers / release assets exist per OS.
 * - `github`   — source code is published; there may be no packaged build.
 */
export const INSTALLATION_TYPES = ['pwa', 'web', 'apk', 'desktop', 'github'] as const;

export type InstallationType = (typeof INSTALLATION_TYPES)[number];

/** How confident we are that the recorded install path actually works. */
export const VERIFICATION_STATUSES = [
  'verified',
  'partial',
  'unverified',
  'source-only',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/**
 * State of the public deployment for an app.
 *
 * - `live`        — the URL serves the actual application.
 * - `placeholder` — the URL resolves but currently serves a scaffold or
 *                   starter template rather than the real app. The UI warns
 *                   about this and promotes the source instead.
 */
export const DEPLOYMENT_STATUSES = ['live', 'placeholder', 'unavailable'] as const;

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export const CATEGORIES = [
  'Games',
  'Productivity',
  'Utilities',
  'Education',
  'Communication',
  'Developer Tools',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Human-readable labels for installation types. */
export const installationTypeLabels: Record<InstallationType, string> = {
  pwa: 'Installable PWA',
  web: 'Open in browser',
  apk: 'Android APK',
  desktop: 'Desktop installer',
  github: 'Source on GitHub',
};

/** Short badge text describing the install path. */
export const installationTypeShort: Record<InstallationType, string> = {
  pwa: 'PWA',
  web: 'Web app',
  apk: 'APK',
  desktop: 'Desktop',
  github: 'GitHub',
};

export const platformLabels: Record<Platform, string> = {
  web: 'Browser',
  android: 'Android',
  ios: 'iOS',
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  verified: 'Verified',
  partial: 'Partially verified',
  unverified: 'Not verified',
  'source-only': 'Source only',
};

export const deploymentStatusLabels: Record<DeploymentStatus, string> = {
  live: 'Live',
  placeholder: 'Placeholder build',
  unavailable: 'No deployment',
};
