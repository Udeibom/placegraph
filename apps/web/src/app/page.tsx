'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Project } from '@placegraph/types';
import { createProject, listProjects } from '@/lib/api';
import { SAMPLE_PROJECT } from '@/lib/sampleProject';

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
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [seeding, setSeeding]   = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    listProjects().then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  async function openSample() {
    setSeeding(true);
    try {
      const project = await createProject(SAMPLE_PROJECT);
      router.push(`/projects/${project.id}`);
    } finally {
      setSeeding(false);
    }
  }

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
          Cultural pre-feasibility → architectural concept
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
          Know who a place is for before you draw it.
        </h1>

        <p style={{
          fontSize: '1.0625rem',
          lineHeight: 1.7,
          color: 'var(--muted)',
          maxWidth: '44rem',
          marginBottom: '0.875rem',
        }}>
          PlaceGraph is cultural pre-feasibility for developers, operators and architects: what commercial
          experience should exist in a location, for whom, and why — before design fees are committed.
        </p>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--muted)', maxWidth: '44rem' }}>
          Qloo provides cross-domain cultural affinity evidence. PlaceGraph determines which relationships
          represent a meaningful opportunity. Architectural intelligence translates the selected strategy
          into space. Professionals remain responsible for evaluation.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
          <Link href="/projects/new" className="pg-btn pg-btn-lg">
            Start a project
          </Link>
          <button
            type="button"
            onClick={openSample}
            disabled={seeding}
            className="pg-btn pg-btn-ghost pg-btn-lg"
          >
            {seeding ? 'Opening…' : 'Open Clerkenwell sample brief'}
          </button>
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
            'Place + objective',
            'Cultural intelligence',
            'Opportunity discovery',
            'Commercial strategy',
            'Experience requirements',
            'Architectural decisions',
            'Spatial concept',
            'Concept render',
            'Professional review',
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
              Create a project from a real property brief, or open the Clerkenwell warehouse sample to explore the full pipeline.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/projects/new" className="pg-btn">Start a project</Link>
              <button type="button" onClick={openSample} disabled={seeding} className="pg-btn pg-btn-ghost">
                {seeding ? 'Opening…' : 'Open sample'}
              </button>
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
