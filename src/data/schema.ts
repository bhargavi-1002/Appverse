import { z } from 'zod';
import {
  CATEGORIES,
  DEPLOYMENT_STATUSES,
  INSTALLATION_TYPES,
  PLATFORMS,
  VERIFICATION_STATUSES,
} from './types';

export type {
  Category,
  DeploymentStatus,
  InstallationType,
  Platform,
  VerificationStatus,
} from './types';

export {
  deploymentStatusLabels,
  installationTypeLabels,
  installationTypeShort,
  platformLabels,
  verificationStatusLabels,
} from './types';

/**
 * An absolute http(s) URL.
 *
 * `z.url()` alone is not enough: `new URL('javascript:alert(1)')` parses
 * successfully, so a dangerous scheme would slip through. Every URL that is
 * rendered as a link goes through this instead.
 */
export const httpUrlSchema = z
  .string()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Must be an absolute http:// or https:// URL.');

export const platformSchema = z.enum(PLATFORMS);
export const installationTypeSchema = z.enum(INSTALLATION_TYPES);
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES);
export const deploymentStatusSchema = z.enum(DEPLOYMENT_STATUSES);
export const categorySchema = z.enum(CATEGORIES);

/** A downloadable artifact (APK, installer, archive) with real, known facts. */
export const downloadAssetSchema = z.object({
  /** OS the asset targets. */
  platform: platformSchema,
  /** File name as published by the author. */
  fileName: z.string().min(1),
  /** Absolute https URL. */
  url: httpUrlSchema,
  /** Human readable size, e.g. "4.2 MB". Only set when actually known. */
  size: z.string().min(1).optional(),
  /** SHA-256 checksum when published. */
  checksum: z.string().min(1).optional(),
  /** SHA-256 of the file as published by the project. */
  checksumAlgorithm: z.literal('sha256').optional(),
  /** Where the asset comes from, e.g. "GitHub Releases v1.2.0". */
  source: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export type DownloadAsset = z.infer<typeof downloadAssetSchema>;

/** A single dated release note. */
export const changelogEntrySchema = z.object({
  version: z.string().min(1),
  /** ISO-8601 date (YYYY-MM-DD). */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  changes: z.array(z.string().min(1)).min(1),
});

export type ChangelogEntry = z.infer<typeof changelogEntrySchema>;

/**
 * Step-by-step install guidance. Each step is intentionally generic so it can
 * be written without inventing steps the project does not support.
 */
export const installationStepSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
  /** Optional monospace snippet shown as a code chip. */
  code: z.string().min(1).optional(),
});

export type InstallationStep = z.infer<typeof installationStepSchema>;

export const installationGuideSchema = z.object({
  /** Short label for the heading, e.g. "Android (Chrome)". */
  title: z.string().min(1),
  steps: z.array(installationStepSchema).min(1),
});

export type InstallationGuide = z.infer<typeof installationGuideSchema>;

export const troubleshootingEntrySchema = z.object({
  problem: z.string().min(1),
  fix: z.string().min(1),
});

export type TroubleshootingEntry = z.infer<typeof troubleshootingEntrySchema>;

/**
 * A single application in the AppVerse registry.
 *
 * Every URL must be an absolute http(s) URL. Optional fields are omitted
 * rather than filled with placeholders so the UI can show honest "not
 * available" states instead of dead buttons.
 */
export const appSchema = z
  .object({
    /** Stable internal identifier. */
    id: z.string().min(1).regex(/^[a-z0-9-]+$/),
    /** URL segment: /apps/:slug */
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).max(80),
    /** One-line summary used on cards and in search results. */
    shortDescription: z.string().min(1).max(200),
    /** Long-form description used on the detail page. */
    fullDescription: z.string().min(1).max(4000),
    /** Path to the icon asset inside /public. */
    icon: z.string().min(1),
    /** Paths to preview images inside /public. */
    screenshots: z.array(z.string().min(1)).default([]),
    category: categorySchema,
    tags: z.array(z.string().min(1)).default([]),
    /** Technologies the app is built with — powers the "technology" filter. */
    technologies: z.array(z.string().min(1)).default([]),

    repositoryUrl: httpUrlSchema.optional(),
    /** Deployed, publicly reachable application. */
    liveUrl: httpUrlSchema.optional(),
    /** Marketing / documentation site for the project. */
    homepageUrl: httpUrlSchema.optional(),
    /** The app's own web app manifest, when it has one. */
    manifestUrl: httpUrlSchema.optional(),
    privacyUrl: httpUrlSchema.optional(),

    version: z.string().min(1).optional(),
    /** ISO-8601 date (YYYY-MM-DD). */
    releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    /** ISO-8601 date (YYYY-MM-DD) of the last meaningful update. */
    lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),

    featured: z.boolean().default(false),
    /** Manual ordering for the featured rail. Lower numbers come first. */
    featuredOrder: z.number().int().default(100),

    installationType: installationTypeSchema,
    supportedPlatforms: z.array(platformSchema).min(1),
    downloadAssets: z.array(downloadAssetSchema).default([]),
    installationInstructions: z.array(installationGuideSchema).default([]),

    /** Feature bullets shown on the detail page. */
    features: z.array(z.string().min(1)).default([]),
    changelog: z.array(changelogEntrySchema).default([]),
    /** Permissions the app requests, when they are documented. */
    permissions: z.array(z.string().min(1)).default([]),
    /** Common problems and their fixes. */
    troubleshooting: z.array(troubleshootingEntrySchema).default([]),

    verificationStatus: verificationStatusSchema.default('unverified'),
    /** Plain-language notes about exactly what was verified. */
    verificationNotes: z.array(z.string().min(1)).default([]),
    /** State of the public deployment — drives the honesty banners. */
    deploymentStatus: deploymentStatusSchema.default('live'),
    /** True when the record is an illustrative example, not a real project. */
    sample: z.boolean().default(false),
    /** Accent colour used for the app's card accents. */
    accent: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
  })
  .superRefine((app, ctx) => {
    // An application that cannot be reached and cannot be inspected is not
    // useful in the marketplace. Require at least one entry point.
    if (!app.liveUrl && !app.repositoryUrl && !app.homepageUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['liveUrl'],
        message: 'An app needs at least one of liveUrl, repositoryUrl or homepageUrl.',
      });
    }

    // Only real PWA records may point at a manifest.
    if (app.manifestUrl && app.installationType !== 'pwa') {
      ctx.addIssue({
        code: 'custom',
        path: ['manifestUrl'],
        message: 'manifestUrl is only meaningful for installationType "pwa".',
      });
    }

    // Desktop/APK records must not be empty of assets to download.
    if (app.installationType === 'apk' && app.downloadAssets.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['downloadAssets'],
        message: 'An "apk" app must list at least one authentic download asset.',
      });
    }
  });

export type AppEntry = z.infer<typeof appSchema>;
