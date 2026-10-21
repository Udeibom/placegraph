'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link href={href} style={{
        fontSize: '0.8125rem',
        color: active ? 'var(--ink)' : 'var(--muted-2)',
        padding: '0.375rem 0.75rem',
        borderRadius: 'var(--radius)',
        fontWeight: active ? 600 : 400,
        textDecoration: 'none',
        transition: 'color var(--duration-fast) var(--ease), background var(--duration-fast) var(--ease)',
        background: active ? 'var(--surface)' : 'transparent',
      }}>
        {label}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1.5px solid var(--line-2)',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        height: 'var(--header-h)',
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="20" height="20" rx="3" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
              <path d="M5 17 L5 9 L11 5 L17 9 L17 17" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
              <rect x="8" y="12" width="6" height="5" fill="var(--accent)" opacity="0.35" rx="1"/>
            </svg>
            <span style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            }}>
              PlaceGraph
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {navLink('/projects', 'Projects')}
            <Link href="/projects/new" style={{
              fontSize: '0.8125rem',
              background: 'var(--accent)',
              color: '#fff',
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius)',
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              + New project
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 5rem',
          animation: 'pg-slide-up var(--duration-slow) var(--ease-out) both',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
