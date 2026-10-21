'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listProjects } from '@/lib/api';
import type { Project } from '@placegraph/types';

const STATUS_LABEL: Record<string, string> = {
  draft:       'Draft',
  analyzing:   'Analyzing…',
  strategizing: 'Strategizing…',
  designing:   'Designing…',
  review:      'In review',
  complete:    'Complete',
};
const STATUS_COLOR: Record<string, string> = {
  draft:       'var(--muted-2)',
  analyzing:   'var(--accent)',
  strategizing: 'var(--accent)',
  designing:   'var(--accent)',
  review:      'var(--qloo)',
  complete:    'var(--success)',
};
const PROJECT_TYPE_LABEL: Record<string, string> = {
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  retail: 'Retail',
  bar: 'Bar',
  cafe: 'Café',
  office: 'Office',
  mixed: 'Mixed use',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects().then((data) => {
      setProjects(data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>
            PlaceGraph
          </p>
          <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
            Your projects
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="pg-btn pg-btn-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          + New project
        </Link>
      </div>

      {/* Project list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: '96px',
              background: 'var(--surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--line-2)',
              animation: 'pg-skeleton-shimmer 1.4s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          border: '1.5px dashed var(--line)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--muted)',
        }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem', fontWeight: 500 }}>No projects yet</p>
          <p style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>Start by defining a location and audience for your first commercial space.</p>
          <Link href="/projects/new" className="pg-btn pg-btn-primary">
            Create your first project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <article style={{
                padding: '1.25rem 1.5rem',
                border: '1.5px solid var(--line-2)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-raised)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                transition: 'border-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-mid)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--line-2)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
              >
                {/* Type pill */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '1.25rem',
                }}>
                  {p.projectType === 'hotel' ? '🏨' : p.projectType === 'retail' ? '🛍️' : p.projectType === 'bar' ? '🍸' : p.projectType === 'cafe' ? '☕' : '🍽️'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.2rem', fontSize: '1rem' }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {PROJECT_TYPE_LABEL[p.projectType] ?? p.projectType}
                    {p.location.city ? ` · ${p.location.city}` : ''}
                    {p.location.neighborhood ? `, ${p.location.neighborhood}` : ''}
                  </p>
                </div>

                {/* Status */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: STATUS_COLOR[p.status] ?? 'var(--muted-2)',
                  }}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  {p.updatedAt && (
                    <p style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: '0.2rem' }}>
                      {new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Chevron */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--muted-2)', flexShrink: 0 }}>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
