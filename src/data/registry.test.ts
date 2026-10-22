import { describe, expect, it } from 'vitest';
import { apps, registry, getAppBySlug, getRelatedApps, categories } from '@/data/apps';
import { appSchema } from '@/data/schema';

describe('registry validation', () => {
  it('passes the runtime schema', () => {
    const result = appSchema.array().safeParse(apps);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      throw new Error(`The registry is invalid:\n${issues.join('\n')}`);
    }
    expect(result.success).toBe(true);
  });

  it('parses every entry without errors', () => {
    expect(registry.length).toBeGreaterThan(0);
    expect(registry.every((app) => app.slug.length > 0)).toBe(true);
  });

  it('has unique ids and slugs', () => {
    const ids = new Set(registry.map((app) => app.id));
    const slugs = new Set(registry.map((app) => app.slug));
    expect(ids.size).toBe(registry.length);
    expect(slugs.size).toBe(registry.length);
  });

  it('only uses real http(s) URLs', () => {
    const urlPattern = /^https?:\/\//;
    for (const app of registry) {
      for (const value of [app.liveUrl, app.repositoryUrl, app.homepageUrl, app.privacyUrl]) {
        if (value) expect(value).toMatch(urlPattern);
      }
    }
  });

  it('never claims a PWA installation without a verified status', () => {
    for (const app of registry) {
      if (app.installationType === 'pwa') {
        expect(app.verificationStatus).not.toBe('unverified');
      }
    }
  });

  it('never lists download assets for a web-only application', () => {
    for (const app of registry) {
      if (app.installationType === 'web' || app.installationType === 'github') {
        expect(app.downloadAssets).toHaveLength(0);
      }
    }
  });

  it('exposes every category it uses', () => {
    for (const app of registry) {
      expect(categories).toContain(app.category);
    }
  });
});

describe('appSchema rules', () => {
  const base = {
    id: 'test-app',
    slug: 'test-app',
    name: 'Test App',
    shortDescription: 'A test application used by the schema tests.',
    fullDescription: 'Longer description for the test record.',
    icon: '/icons/cyber-runner.svg',
    category: 'Games' as const,
    installationType: 'web' as const,
    supportedPlatforms: ['web' as const],
  };

  it('requires at least one entry point', () => {
    const result = appSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it('accepts a record with a live URL', () => {
    const result = appSchema.safeParse({ ...base, liveUrl: 'https://example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects a javascript: live URL', () => {
    const result = appSchema.safeParse({ ...base, liveUrl: 'javascript:alert(1)' });
    expect(result.success).toBe(false);
  });

  it('rejects a manifestUrl on a non-PWA record', () => {
    const result = appSchema.safeParse({
      ...base,
      liveUrl: 'https://example.com',
      manifestUrl: 'https://example.com/manifest.json',
    });
    expect(result.success).toBe(false);
  });

  it('requires download assets for an apk record', () => {
    const result = appSchema.safeParse({ ...base, installationType: 'apk' });
    expect(result.success).toBe(false);
  });

  it('accepts an apk record with an asset', () => {
    const result = appSchema.safeParse({
      ...base,
      repositoryUrl: 'https://github.com/bhargavi-1002/test-app',
      installationType: 'apk',
      downloadAssets: [
        {
          platform: 'android',
          fileName: 'app.apk',
          url: 'https://example.com/app.apk',
          size: '4.2 MB',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a dangerous scheme inside a download asset', () => {
    const result = appSchema.safeParse({
      ...base,
      repositoryUrl: 'https://github.com/bhargavi-1002/test-app',
      installationType: 'apk',
      downloadAssets: [
        {
          platform: 'android',
          fileName: 'app.apk',
          url: 'javascript:alert(1)',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid slug', () => {
    const result = appSchema.safeParse({ ...base, slug: 'Not A Slug' });
    expect(result.success).toBe(false);
  });
});

describe('lookups', () => {
  it('finds an app by slug', () => {
    expect(getAppBySlug('cyber-runner')?.name).toBe('Cyber Runner');
  });

  it('returns undefined for an unknown slug', () => {
    expect(getAppBySlug('does-not-exist')).toBeUndefined();
    expect(getAppBySlug(undefined)).toBeUndefined();
  });

  it('returns related applications and never includes the app itself', () => {
    const app = getAppBySlug('cyber-runner');
    expect(app).toBeDefined();
    const related = getRelatedApps(app!);
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((entry) => entry.slug === app!.slug)).toBe(false);
  });
});
