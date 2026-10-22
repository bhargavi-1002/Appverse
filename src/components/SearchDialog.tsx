import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, X } from 'lucide-react';
import { registry } from '@/data/apps';
import { searchApps, suggestApps } from '@/lib/search';
import { AppIcon } from './AppIcon';
import { cn } from '@/lib/utils';

export interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Global search with keyboard navigation.
 *
 * Up/Down move through the results, Enter opens the highlighted one, Escape
 * closes the dialog. Focus is trapped inside the dialog while it is open.
 */
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => searchApps(registry, query).slice(0, 8), [query]);
  const suggestions = useMemo(() => suggestApps(registry, query), [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const optionCount = query.trim() ? results.length : suggestions.length;
  const activeSlug =
    query.trim() && results.length
      ? results[activeIndex]?.app.slug
      : suggestions.length
        ? suggestions[activeIndex]?.slug
        : undefined;

  const go = (slug: string) => {
    onClose();
    navigate(`/apps/${slug}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (optionCount === 0 ? 0 : (index + 1) % optionCount));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        optionCount === 0 ? 0 : (index - 1 + optionCount) % optionCount,
      );
      return;
    }
    if (event.key === 'Enter' && activeSlug) {
      event.preventDefault();
      go(activeSlug);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search applications"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
        aria-label="Close search"
        onClick={onClose}
        tabIndex={-1}
      />

      <div className="av-animate-fade-up relative w-full max-w-xl overflow-hidden rounded-lg border border-line bg-bg-elevated shadow-lg">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="shrink-0 text-subtle" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search apps, categories…"
            aria-label="Search applications"
            className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label="Close search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {!query.trim() && (
            <p className="px-3 py-6 text-center text-sm text-subtle">
              Start typing to search {registry.length} applications.
            </p>
          )}

          {query.trim() && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-subtle">
              No applications match “{query}”.
            </p>
          )}

          {query.trim() &&
            results.map((result, index) => (
              <button
                key={result.app.slug}
                type="button"
                onClick={() => go(result.app.slug)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors',
                  index === activeIndex ? 'bg-accent-soft' : 'hover:bg-surface',
                )}
              >
                <AppIcon src={result.app.icon} name={result.app.name} size={34} accent={result.app.accent} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{result.app.name}</span>
                  <span className="block truncate text-xs text-subtle">
                    {result.app.category} · matched by {result.matchedOn}
                  </span>
                </span>
                {index === activeIndex && (
                  <CornerDownLeft size={14} className="shrink-0 text-accent-text" aria-hidden="true" />
                )}
              </button>
            ))}

          {!query.trim() &&
            suggestions.map((app, index) => (
              <button
                key={app.slug}
                type="button"
                onClick={() => go(app.slug)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors',
                  index === activeIndex ? 'bg-accent-soft' : 'hover:bg-surface',
                )}
              >
                <AppIcon src={app.icon} name={app.name} size={34} accent={app.accent} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{app.name}</span>
                  <span className="block truncate text-xs text-subtle">{app.category}</span>
                </span>
                {index === activeIndex && (
                  <CornerDownLeft size={14} className="shrink-0 text-accent-text" aria-hidden="true" />
                )}
              </button>
            ))}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-subtle">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">↵</kbd>
            open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
