import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  Download,
  Github,
  Info,
  Lock,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { registry } from '@/data/apps';
import type { AppEntry } from '@/data/schema';
import { githubCacheGeneratedAt, getGithubRepository } from '@/lib/github';
import { readJson, writeJson, STORAGE_KEYS } from '@/lib/storage';
import { useDocumentMeta } from '@/lib/seo';
import { cn } from '@/lib/utils';

type Draft = Record<string, unknown>;

/**
 * The Zod schema is loaded on demand so the validation library is only
 * downloaded when the owner actually opens the dashboard.
 */
type AppSchema = typeof import('@/data/schema')['appSchema'];

const urlFields = ['repositoryUrl', 'liveUrl', 'homepageUrl', 'manifestUrl', 'privacyUrl'] as const;

function validateDraft(draft: Draft, schema: AppSchema | null) {
  if (!schema) {
    return { ok: false, errors: ['Loading the validation schema…'], value: undefined };
  }
  const cleaned: Draft = { ...draft };
  for (const field of urlFields) {
    const value = cleaned[field];
    if (typeof value === 'string' && value.trim() === '') delete cleaned[field];
  }
  const result = schema.safeParse(cleaned);
  if (result.success) return { ok: true, errors: [] as string[], value: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((issue) => {
      const path = issue.path.join('.') || 'record';
      return `${path}: ${issue.message}`;
    }),
    value: undefined,
  };
}

const emptyDraft: Draft = {
  id: '',
  slug: '',
  name: '',
  shortDescription: '',
  fullDescription: '',
  icon: '/icons/cyber-runner.svg',
  screenshots: [],
  category: 'Games',
  tags: [],
  technologies: [],
  repositoryUrl: '',
  liveUrl: '',
  homepageUrl: '',
  manifestUrl: '',
  privacyUrl: '',
  version: '',
  releaseDate: '',
  lastUpdated: '',
  featured: false,
  featuredOrder: 100,
  installationType: 'web',
  supportedPlatforms: ['web'],
  downloadAssets: [],
  installationInstructions: [],
  features: [],
  changelog: [],
  permissions: [],
  troubleshooting: [],
  verificationStatus: 'unverified',
  verificationNotes: [],
  deploymentStatus: 'live',
  sample: false,
  accent: '#7c5cff',
};

export function DashboardPage() {
  const [overrides, setOverrides] = useState<Record<string, AppEntry>>(() =>
    readJson<Record<string, AppEntry>>(STORAGE_KEYS.dashboardEdits, {}),
  );
  const [schema, setSchema] = useState<AppSchema | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('');

  useDocumentMeta({
    title: 'Owner dashboard',
    description: 'Local registry management for the AppVerse owner.',
    path: '/dashboard',
  });

  const merged = useMemo(() => {
    const base = registry.map((app) => {
      const override = overrides[app.slug];
      return override ? { ...app, ...override } : app;
    });
    const known = new Set(base.map((app) => app.slug));
    const added = Object.values(overrides).filter((entry) => !known.has(entry.slug));
    return [...base, ...added];
  }, [overrides]);

  const validation = useMemo(
    () => (draft ? validateDraft(draft, schema) : { ok: true, errors: [], value: undefined }),
    [draft, schema],
  );

  useEffect(() => {
    let cancelled = false;
    void import('@/data/schema').then((module) => {
      if (!cancelled) setSchema(() => module.appSchema);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return merged;
    return merged.filter(
      (app) =>
        app.name.toLowerCase().includes(term) || app.slug.toLowerCase().includes(term),
    );
  }, [merged, query]);

  useEffect(() => {
    if (selectedSlug) {
      const app = merged.find((entry) => entry.slug === selectedSlug);
      if (app) setDraft({ ...(app as unknown as Draft) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);
  const saveDraft = () => {
    if (!draft || !validation.ok || !validation.value) return;
    const slug = validation.value.slug;
    const next = { ...overrides, [slug]: validation.value };
    setOverrides(next);
    writeJson(STORAGE_KEYS.dashboardEdits, next);
    setSelectedSlug(null);
    setDraft(null);
  };

  const resetOverrides = () => {
    setOverrides({});
    writeJson(STORAGE_KEYS.dashboardEdits, {});
    setSelectedSlug(null);
    setDraft(null);
  };

  const exportJson = () => {
    const payload = merged.map((app) => {
      const override = overrides[app.slug];
      return override ?? app;
    });
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'appverse-registry.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    setImportError(null);
    try {
      if (!schema) throw new Error('The validation schema has not finished loading.');
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('The file must contain an array of applications.');
      const next: Record<string, AppEntry> = { ...overrides };
      parsed.forEach((entry, index) => {
        const result = schema.safeParse(entry);
        if (!result.success) {
          throw new Error(
            `Record ${index + 1} is invalid: ${result.error.issues[0]?.message ?? 'unknown error'}`,
          );
        }
        next[result.data.slug] = result.data;
      });
      setOverrides(next);
      writeJson(STORAGE_KEYS.dashboardEdits, next);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Could not read that file.');
    }
  };

  const copyRegistry = async () => {
    const payload = JSON.stringify(
      merged.map((app) => overrides[app.slug] ?? app),
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const githubRows = merged.map((app) => {
    const meta = getGithubRepository(app.slug);
    return {
      slug: app.slug,
      name: app.name,
      repositoryUrl: app.repositoryUrl,
      state: !app.repositoryUrl
        ? 'not-configured'
        : meta?.available
          ? 'synced'
          : meta
            ? 'unavailable'
            : 'not-synced',
      detail: meta?.available
        ? `${meta.fullName} · ${meta.language ?? 'unknown language'}${
            meta.latestRelease ? ` · release ${meta.latestRelease.tag}` : ''
          }`
        : meta?.reason ?? 'Run `npm run sync:github` to fetch public metadata.',
    };
  });

  const overrideCount = Object.keys(overrides).length;

  return (
    <div className="av-container py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Owner dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Add, edit and validate registry entries. Everything you change here is kept in this
            browser only, so you can draft a change and then commit it to the repository when you
            are happy with it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportJson} className="av-btn av-btn-secondary !text-sm">
            <Download size={15} aria-hidden="true" />
            Export JSON
          </button>
          <button type="button" onClick={() => void copyRegistry()} className="av-btn av-btn-secondary !text-sm">
            {copied ? (
              <Check size={15} className="text-emerald" aria-hidden="true" />
            ) : (
              <ClipboardCopy size={15} aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
          <label className="av-btn av-btn-secondary !cursor-pointer !text-sm">
            <Upload size={15} aria-hidden="true" />
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="av-sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importJson(file);
                event.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {/* ------------------------------------------------- Security note */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber/30 bg-amber/8 p-4">
        <Lock size={17} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
        <div className="text-sm leading-relaxed">
          <p className="font-medium text-ink">This dashboard is not password protected.</p>
          <p className="mt-1 text-amber/90">
            No authentication backend is configured for this deployment, so a device-local editor
            is the safe option — it cannot be used to change the published site. Changes made here
            live in this browser until you export them into{' '}
            <code className="font-mono">src/data/apps.ts</code> and deploy. To enable a protected
            admin area, add server-side authentication and move the write path behind it — see the
            README.
          </p>
        </div>
      </div>

      {importError && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose/30 bg-rose/8 p-4 text-sm text-rose">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {importError}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* -------------------------------------------------- Registry */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold text-ink">Registry</h2>
            <span className="text-xs text-subtle">{merged.length} records</span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3 focus-within:border-accent">
            <Search size={15} className="shrink-0 text-subtle" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter…"
              aria-label="Filter applications"
              className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
            />
          </div>

          <ul className="mt-3 max-h-[26rem] space-y-1 overflow-y-auto">
            {filtered.map((app) => (
              <li key={app.slug}>
                <button
                  type="button"
                  onClick={() => setSelectedSlug(app.slug)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors',
                    selectedSlug === app.slug
                      ? 'bg-accent-soft text-accent-text'
                      : 'text-muted hover:bg-surface-strong hover:text-ink',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{app.name}</span>
                  {overrides[app.slug] && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      title="Edited locally"
                      aria-label="Edited locally"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => {
              setDraft({ ...emptyDraft });
              setSelectedSlug(null);
            }}
            className="av-btn av-btn-secondary mt-3 w-full !text-xs"
          >
            <span aria-hidden="true">+</span>
            Draft a new application
          </button>

          {overrideCount > 0 && (
            <button
              type="button"
              onClick={resetOverrides}
              className="av-btn av-btn-ghost mt-4 w-full !text-xs"
            >
              <Undo2 size={13} aria-hidden="true" />
              Discard {overrideCount} local {overrideCount === 1 ? 'edit' : 'edits'}
            </button>
          )}
        </div>

        {/* ---------------------------------------------------- Editor */}
        <div className="rounded-lg border border-line bg-surface p-5">
          {!draft ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Info size={22} className="text-subtle" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-semibold text-ink">
                Select an application
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Pick a record from the list to edit its metadata, validate the URLs and preview the
                result.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveDraft();
              }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold text-ink">
                  Edit {String(draft.name || 'application')}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug(null);
                    setDraft(null);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-strong hover:text-ink"
                  aria-label="Close editor"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" required>
                  <input
                    className="av-field"
                    value={String(draft.name ?? '')}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    required
                  />
                </Field>

                <Field label="Slug" required hint="Used in the page URL">
                  <input
                    className="av-field"
                    value={String(draft.slug ?? '')}
                    onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                    required
                    pattern="[a-z0-9-]+"
                  />
                </Field>

                <Field label="Short description" required className="sm:col-span-2">
                  <textarea
                    className="av-field min-h-[72px]"
                    value={String(draft.shortDescription ?? '')}
                    onChange={(event) =>
                      setDraft({ ...draft, shortDescription: event.target.value })
                    }
                    required
                  />
                </Field>

                <Field label="Full description" className="sm:col-span-2" hint="Blank line between paragraphs">
                  <textarea
                    className="av-field min-h-[160px]"
                    value={String(draft.fullDescription ?? '')}
                    onChange={(event) => setDraft({ ...draft, fullDescription: event.target.value })}
                  />
                </Field>

                <Field label="Live URL" hint="Must be a full https:// address">
                  <input
                    className="av-field"
                    value={String(draft.liveUrl ?? '')}
                    onChange={(event) => setDraft({ ...draft, liveUrl: event.target.value })}
                    placeholder="https://"
                    inputMode="url"
                  />
                </Field>

                <Field label="Repository URL">
                  <input
                    className="av-field"
                    value={String(draft.repositoryUrl ?? '')}
                    onChange={(event) => setDraft({ ...draft, repositoryUrl: event.target.value })}
                    placeholder="https://github.com/…"
                    inputMode="url"
                  />
                </Field>

                <Field label="Category">
                  <select
                    className="av-field"
                    value={String(draft.category ?? 'Games')}
                    onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                  >
                    {['Games', 'Productivity', 'Utilities', 'Education', 'Communication', 'Developer Tools'].map(
                      (category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field label="Installation type">
                  <select
                    className="av-field"
                    value={String(draft.installationType ?? 'web')}
                    onChange={(event) =>
                      setDraft({ ...draft, installationType: event.target.value })
                    }
                  >
                    {['pwa', 'web', 'apk', 'desktop', 'github'].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Version">
                  <input
                    className="av-field"
                    value={String(draft.version ?? '')}
                    onChange={(event) => setDraft({ ...draft, version: event.target.value })}
                  />
                </Field>

                <Field label="Last updated" hint="YYYY-MM-DD">
                  <input
                    className="av-field"
                    value={String(draft.lastUpdated ?? '')}
                    onChange={(event) => setDraft({ ...draft, lastUpdated: event.target.value })}
                    placeholder="2026-01-31"
                    pattern="\d{4}-\d{2}-\d{2}"
                  />
                </Field>

                <Field label="Deployment status">
                  <select
                    className="av-field"
                    value={String(draft.deploymentStatus ?? 'live')}
                    onChange={(event) =>
                      setDraft({ ...draft, deploymentStatus: event.target.value })
                    }
                  >
                    {['live', 'placeholder', 'unavailable'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Verification status">
                  <select
                    className="av-field"
                    value={String(draft.verificationStatus ?? 'unverified')}
                    onChange={(event) =>
                      setDraft({ ...draft, verificationStatus: event.target.value })
                    }
                  >
                    {['verified', 'partial', 'unverified', 'source-only'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Validation */}
              <div
                className={cn(
                  'rounded-md border p-3.5 text-sm',
                  validation.ok
                    ? 'border-emerald/30 bg-emerald/8 text-emerald'
                    : 'border-rose/30 bg-rose/8 text-rose',
                )}
                role="status"
              >
                {validation.ok ? (
                  <p className="flex items-center gap-2">
                    <Check size={15} aria-hidden="true" />
                    This record passes the registry schema and is ready to save.
                  </p>
                ) : (
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <AlertTriangle size={15} aria-hidden="true" />
                      Fix {validation.errors.length}{' '}
                      {validation.errors.length === 1 ? 'issue' : 'issues'} before saving
                    </p>
                    <ul className="mt-2 space-y-1 pl-6">
                      {validation.errors.map((error) => (
                        <li key={error} className="list-disc text-xs leading-relaxed">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={!validation.ok}
                  className="av-btn av-btn-primary !text-sm"
                >
                  <Save size={15} aria-hidden="true" />
                  Save locally
                </button>
                <Link
                  to={`/apps/${String(draft.slug)}`}
                  className="av-btn av-btn-secondary !text-sm"
                >
                  Preview detail page
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const app = merged.find((entry) => entry.slug === draft.slug);
                    if (app) setDraft({ ...(app as unknown as Draft) });
                  }}
                  className="av-btn av-btn-ghost !text-sm"
                >
                  <Undo2 size={15} aria-hidden="true" />
                  Revert
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ------------------------------------------- GitHub integration */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <Github size={18} className="text-subtle" aria-hidden="true" />
          GitHub integration
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The metadata below was produced by the sync script, which only ever calls the API for
          repositories that are explicitly listed in the registry. Cache generated{' '}
          <span className="font-mono text-xs">{githubCacheGeneratedAt}</span>. Run{' '}
          <code className="font-mono text-xs">npm run sync:github</code> to refresh it.
        </p>

        <div className="mt-5 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface-strong text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Application
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  State
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--app-border)]">
              {githubRows.map((row) => (
                <tr key={row.slug}>
                  <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-pill border px-2 py-0.5 text-xs font-medium',
                        row.state === 'synced'
                          ? 'border-emerald/30 bg-emerald/10 text-emerald'
                          : row.state === 'unavailable'
                            ? 'border-amber/30 bg-amber/10 text-amber'
                            : 'border-line bg-surface text-muted',
                      )}
                    >
                      {row.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-subtle">
          <RefreshCw size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          A repository that reports &ldquo;unavailable&rdquo; is private or has been deleted. It is
          still linked from the application page — visitors simply need to sign in to GitHub to
          see it.
        </p>
      </section>

      <p className="mt-10 flex items-center gap-2 text-xs text-subtle">
        <Trash2 size={13} aria-hidden="true" />
        Local edits are stored under the browser key{' '}
        <code className="font-mono">appverse:dashboard-edits</code>.
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-baseline gap-2 text-xs font-medium text-muted">
        {label}
        {required && <span className="text-rose">*</span>}
        {hint && <span className="font-normal text-subtle">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
