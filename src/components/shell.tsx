'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Github, Moon, Sun } from 'lucide-react';

export function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 27 : 36}
      height={small ? 27 : 36}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 29 13 10l18 5-4 17L9 29ZM13 10l14 22M9 29l22-14"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="13" cy="10" r="3" fill="currentColor" />
      <circle cx="31" cy="15" r="3" fill="currentColor" />
      <circle cx="27" cy="32" r="3" fill="currentColor" />
      <circle cx="9" cy="29" r="3" fill="currentColor" />
    </svg>
  );
}
export function Header() {
  const path = usePathname();
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme ?? 'dark');
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem('conjmap-theme-v1', next);
    } catch {
      /* Theme works with storage disabled. */
    }
  }
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="ConjMap home">
          <Mark />
          <span>
            ConjMap<span className="version">V0.1</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          {[
            ['/atlas', 'Atlas'],
            ['/problems', 'Problems'],
            ['/sources', 'Sources'],
            ['/about', 'About'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={path.startsWith(href) ? 'active' : ''}
              aria-current={path.startsWith(href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a
            href="https://github.com/RanchoTao/ConjMap"
            target="_blank"
            rel="noreferrer"
            className="github"
          >
            <Github size={16} />
            <span>Contribute</span>
            <ArrowUpRight size={13} />
          </a>
          <button
            className="icon-button"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <span className="footer-brand">
          <Mark small /> ConjMap
        </span>
        <span>Mapping the frontiers. Preserving the evidence.</span>
      </div>
      <div>
        <span>Open source · Apache-2.0</span>
        <Link href="/sources">
          Data & attribution <ArrowUpRight size={13} />
        </Link>
      </div>
    </footer>
  );
}
