import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, Menu, X, Download, Heart, Home, Compass, PackageCheck, Info } from 'lucide-react';
import { Logo } from './Logo';
import { SearchDialog } from './SearchDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useInstallPrompt } from '@/lib/install';
import { useFavorites } from '@/hooks/useLocalLists';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Discover', Icon: Home, end: true },
  { to: '/explore', label: 'Explore', Icon: Compass, end: false },
  { to: '/install', label: 'Installations', Icon: PackageCheck, end: false },
  { to: '/favorites', label: 'Favourites', Icon: Heart, end: false },
  { to: '/about', label: 'About', Icon: Info, end: false },
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { support, promptInstall, prompting } = useInstallPrompt();
  const { favorites } = useFavorites();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true;
      if (typing) return;

      if ((event.key === '/' && !event.metaKey && !event.ctrlKey) ||
          ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#main" className="av-skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line" style={{ background: 'var(--app-header-bg)', backdropFilter: 'blur(18px) saturate(150%)', WebkitBackdropFilter: 'blur(18px) saturate(150%)' }}>
        <div className="av-container flex h-16 items-center gap-3">
          <Link to="/" className="shrink-0 rounded-sm" aria-label="AppVerse home">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="ml-2 hidden items-center gap-0.5 lg:flex">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent-soft text-accent-text'
                      : 'text-muted hover:bg-surface hover:text-ink',
                  )
                }
              >
                <Icon size={15} aria-hidden="true" />
                {label}
                {to === '/favorites' && favorites.length > 0 && (
                  <span className="ml-0.5 rounded-pill bg-accent/20 px-1.5 text-[10px] font-semibold text-accent-text">
                    {favorites.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-2 rounded-sm border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-line-strong hover:text-ink sm:inline-flex"
              aria-label="Search applications"
            >
              <Search size={15} aria-hidden="true" />
              <span className="hidden md:inline">Search…</span>
              <kbd className="hidden rounded border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] lg:inline">
                /
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-surface text-muted transition-colors hover:text-ink sm:hidden"
              aria-label="Search applications"
            >
              <Search size={16} aria-hidden="true" />
            </button>

            {support === 'available' && (
              <button
                type="button"
                onClick={() => void promptInstall()}
                disabled={prompting}
                className="av-btn av-btn-primary !min-h-10 !px-3.5 !text-sm"
              >
                <Download size={15} aria-hidden="true" />
                <span className="hidden sm:inline">{prompting ? 'Installing…' : 'Install'}</span>
              </button>
            )}

            <ThemeToggle className="max-sm:hidden" />

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-surface text-ink transition-colors lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="fixed inset-0 z-30 bg-bg/95 backdrop-blur-xl lg:hidden"
          style={{ top: 'var(--header-height)' }}
        >
          <nav aria-label="Mobile" className="av-container flex h-full flex-col gap-1 py-6">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[52px] items-center gap-3 rounded-md border px-4 text-base font-medium transition-colors',
                    isActive
                      ? 'border-accent/35 bg-accent-soft text-accent-text'
                      : 'border-line bg-surface text-ink',
                  )
                }
              >
                <Icon size={18} aria-hidden="true" />
                {label}
                {to === '/favorites' && favorites.length > 0 && (
                  <span className="ml-auto rounded-pill bg-accent/20 px-2 text-xs font-semibold text-accent-text">
                    {favorites.length}
                  </span>
                )}
              </NavLink>
            ))}

            <div className="mt-auto flex flex-col gap-3">
              <ThemeToggle className="self-start" />
              {support === 'available' && (
                <button
                  type="button"
                  onClick={() => void promptInstall()}
                  disabled={prompting}
                  className="av-btn av-btn-primary w-full"
                >
                  <Download size={16} aria-hidden="true" />
                  {prompting ? 'Installing…' : 'Install AppVerse'}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
