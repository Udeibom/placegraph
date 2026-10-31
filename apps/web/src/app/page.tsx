'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@placegraph/types';
import { listProjects } from '@/lib/api';


const TYPE_LABELS: Record<string, string> = {
  restaurant:  'Restaurant',
  hotel:       'Hotel',
  retail:      'Retail',
  hospitality: 'Hospitality',
  other:       'Commercial',
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'strategizing' || status === 'designing' || status === 'visualizing'
      ? 'pg-badge pg-badge-infer'
      : status === 'review'
      ? 'pg-badge pg-badge-success'
      : 'pg-badge pg-badge-neutral';
  return <span className={cls}>{status}</span>;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    listProjects().then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);


  return (
    <>
      {/* Hero */}
      <section style={{ maxWidth: '56rem', paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '1rem',
        }}>
          Better decisions before millions are spent
        </p>

        <h1 style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          fontWeight: 700,
          lineHeight: 1.18,
          color: 'var(--ink)',
          letterSpacing: '-0.02em',
          marginBottom: '1.25rem',
        }}>
          Decide what kind of place should be built, for whom, and why.
        </h1>

        <p style={{
          fontSize: '1.0625rem',
          lineHeight: 1.7,
          color: 'var(--muted)',
          maxWidth: '44rem',
          marginBottom: '0.875rem',
        }}>
          PlaceGraph is a Qloo-powered cultural intelligence agent for developers, hospitality groups, retail brands, and operators deciding what type of experience should be created for a specific audience in a specific context before committing significant capital.
        </p>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--muted)', maxWidth: '44rem' }}>
          Qloo cultural intelligence reveals differentiated opportunities. PlaceGraph evaluates possible experience concepts against those signals, explains why alternatives may be weaker, and translates the selected concept into spatial and architectural implications — preventing investment in physical experiences that won’t resonate.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
          <Link href="/projects/new" className="pg-btn pg-btn-lg">
            Start a project
          </Link>
        </div>

      </section>

      {/* Pipeline overview */}
      <section style={{
        borderTop: '1.5px solid var(--line-2)',
        paddingTop: '2rem',
        paddingBottom: '2.5rem',
        marginBottom: '2rem',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '1.25rem' }}>
          The pipeline
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {[
            'Location + audience + objective',
            'Qloo cultural intelligence',
            'Cultural opportunities',
            'Possible experience concepts',
            'Evidence-based concept recommendation',
            'Experience strategy',
            'Experience requirements',
            'Spatial/architectural implications',
            'Concept render',
            'Review',
          ].map((label, i, arr) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.8125rem',
                color: 'var(--ink-2)',
                padding: '0.25rem 0.625rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--line-2)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
              {i < arr.length - 1 && (
                <span style={{ color: 'var(--muted-2)', fontSize: '0.75rem' }}>→</span>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* Projects list */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)' }}>
            Projects
          </h2>
          <Link href="/projects/new" style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>
            + New project
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2].map((i) => (
              <div key={i} className="pg-skeleton" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            border: '1.5px dashed var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.125rem', color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
              No projects yet.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: '30rem', margin: '0 auto 1.5rem' }}>
              Create a project from a real property brief to explore the full analysis pipeline.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/projects/new" className="pg-btn">Start a project</Link>
            </div>

          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {projects.map((p) => {
              const loc = [p.location.neighborhood, p.location.city].filter(Boolean).join(', ');
              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="pg-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: 'var(--ink)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {p.name}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.1875rem' }}>
                        {TYPE_LABELS[p.projectType] ?? p.projectType}
                        {loc ? ` · ${loc}` : ''}
                        {p.audiences?.length ? ` · ${p.audiences.length} audience${p.audiences.length !== 1 ? 's' : ''}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--accent)', flexShrink: 0 }}>
                      Open →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
