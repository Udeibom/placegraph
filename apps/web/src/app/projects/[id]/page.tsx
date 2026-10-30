'use client';

import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PipelineNav } from '@/components/PipelineNav';
import { PipelineRunner } from '@/components/PipelineRunner';
import { EvidenceQuality } from '@/components/EvidenceQuality';
import { useProject } from '@/components/ProjectView';
import { useStream } from '@/lib/useStream';
import type { ProjectBundle } from '@/lib/api';

const TYPE_LABELS: Record<string, string> = {
  restaurant:  'Restaurant',
  hotel:       'Hotel',
  retail:      'Retail',
  hospitality: 'Hospitality',
  other:       'Commercial',
};

const PRIORITY_LABELS = ['Primary', 'Secondary', 'Tertiary', 'Other'];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { bundle, error, loading, setBundle } = useProject(id);

  const handleDone = useCallback((b: ProjectBundle) => setBundle(b), [setBundle]);
  const { streaming, events, error: streamError, start } =
    useStream(id, 'analyze', handleDone);

  if (loading) return <ProjectSkeleton />;
  if (error || !bundle) return (
    <div style={{ padding: '2rem', color: 'var(--error-color)', background: 'var(--error-bg)', borderRadius: 'var(--radius-md)' }}>
      {error || 'Project not found'}
    </div>
  );

  const { project, analysis } = bundle;
  const city = project.location.city;
  const neighbourhood = project.location.neighborhood;
  const locStr = [neighbourhood, city].filter(Boolean).join(', ');
  const mapLat    = analysis?.locationContext?.lat;
  const mapLng    = analysis?.locationContext?.lng;
  const hasCoords = typeof mapLat === 'number' && typeof mapLng === 'number';

  return (
    <main>
      <PipelineNav projectId={id} current="place" analysisStatus={analysis?.status ?? project.status} />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span className="pg-badge pg-badge-neutral">
            {TYPE_LABELS[project.projectType] ?? project.projectType}
          </span>
          <span className="pg-badge pg-badge-neutral">
            {project.mode === 'discover' ? 'Discovery mode' : 'Evaluate mode'}
          </span>
          {project.mode === 'discover' && project.operatorType && (
            <span className="pg-badge pg-badge-neutral">
              {project.operatorType}
            </span>
          )}
          {analysis?.intelligenceMode && (
            <span className={`pg-badge pg-badge-${analysis.intelligenceMode}`}>
              {analysis.intelligenceMode} intelligence
            </span>
          )}
        </div>

        <h1 style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.18,
          color: 'var(--ink)',
          letterSpacing: '-0.02em',
          marginBottom: '0.375rem',
        }}>
          {project.name}
        </h1>

        <p style={{ fontSize: '0.9375rem', color: 'var(--muted)' }}>
          {locStr || project.location.address || 'Location not specified'}
        </p>
      </div>

      {/* Two-column layout: brief | map */}
      <div style={{ display: 'grid', gridTemplateColumns: hasCoords ? '1fr 320px' : '1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          {/* Objective */}
          <blockquote style={{
            fontFamily: '"Libre Baskerville", Georgia, serif',
            fontSize: '1.0625rem',
            lineHeight: 1.7,
            fontStyle: 'italic',
            color: 'var(--ink-2)',
            borderLeft: '3px solid var(--accent)',
            paddingLeft: '1.25rem',
            margin: 0,
            marginBottom: '1.5rem',
          }}>
            {project.objective}
          </blockquote>

          {/* Metrics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {project.budgetRange && <MetricChip label="Budget" value={project.budgetRange} />}
            {project.floorArea   && <MetricChip label="Floor area" value={project.floorArea} />}
            {analysis && <MetricChip label="Qloo source" value={analysis.qlooContext?.source ?? '—'} highlight={analysis.qlooContext?.source === 'live'} />}
          </div>

          {/* Audiences */}
          {project.audiences?.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <SectionLabel>Audiences</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {project.audiences.map((a) => (
                  <div key={a.name} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    border: '1.5px solid var(--line-2)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-raised)',
                  }}>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: a.priority === 1 ? 'var(--accent)' : a.priority === 2 ? 'var(--qloo)' : 'var(--muted)',
                      minWidth: '5rem', paddingTop: '1px',
                    }}>
                      {PRIORITY_LABELS[(a.priority ?? 1) - 1] ?? 'Other'}
                    </span>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.3 }}>{a.name}</p>
                      {a.description && <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.125rem' }}>{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Constraints */}
          {project.constraints?.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <SectionLabel>Constraints</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {project.constraints.map((c) => (
                  <span key={c.key} style={{
                    fontSize: '0.8125rem', color: 'var(--ink-2)',
                    border: '1px solid var(--line)', borderRadius: 'var(--radius)',
                    padding: '0.25rem 0.625rem', background: 'var(--surface)',
                  }}>
                    <strong style={{ fontWeight: 600 }}>{c.key}:</strong> {c.value}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Map embed */}
        {hasCoords && (
          <div style={{
            position: 'sticky', top: 'calc(var(--header-h) + 1rem)',
            height: 'fit-content',
          }}>
            <div style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <iframe
                title="Location map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng-0.012},${mapLat-0.008},${mapLng+0.012},${mapLat+0.008}&layer=mapnik&marker=${mapLat},${mapLng}`}
                width="100%"
                height="240"
                style={{ display: 'block', border: 'none' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.375rem' }}>
              {locStr} · <a href={`https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Open in OSM</a>
            </p>
          </div>
        )}
      </div>

      {/* Floor plan */}
      {project.floorPlanUrl && (
        <section style={{ marginBottom: '2rem' }}>
          <SectionLabel>Floor plan</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.floorPlanUrl}
              alt="Uploaded floor plan"
              style={{ maxHeight: '200px', maxWidth: '280px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', objectFit: 'contain' }}
            />
            {analysis?.floorPlan && (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                  Source: <strong style={{ color: 'var(--ink-2)' }}>{analysis.floorPlan.source}</strong>
                </p>
                {analysis.floorPlan.summary && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                    {analysis.floorPlan.summary}
                  </p>
                )}
                {analysis.floorPlan.rooms?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {analysis.floorPlan.rooms.map((r) => (
                      <span key={r.name ?? r} style={{ fontSize: '0.75rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '0.125rem 0.5rem', color: 'var(--ink-2)' }}>
                        {r.name}
                        {r.approxShare ? ` ${r.approxShare}%` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Evidence gate */}
      {analysis?.evidenceGate && (
        <EvidenceQuality
          gate={analysis.evidenceGate}
          intelligenceMode={analysis.intelligenceMode}
          qlooSource={analysis.qlooContext?.source}
        />
      )}

      <hr className="pg-divider" />

      {/* Run analysis */}
      <section>
        <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
          {analysis ? 'Cultural analysis' : 'Begin investigation'}
        </h2>

        {analysis ? (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: streaming ? '1.25rem' : 0 }}>
            <Link href={`/projects/${id}/recommendation`} className="pg-btn">
              View recommendation →
            </Link>
            <button
              type="button"
              onClick={() => start()}
              disabled={streaming}
              className="pg-btn pg-btn-ghost"
            >
              {streaming ? 'Running…' : 'Re-run analysis'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.25rem', maxWidth: '38rem' }}>
              The agent will geocode the location, query OpenStreetMap for nearby businesses, run Qloo cultural
              intelligence queries for each audience, and identify cultural landscape opportunities.
            </p>
            <button
              type="button"
              onClick={() => start()}
              disabled={streaming}
              className="pg-btn pg-btn-lg"
            >
              {streaming ? 'Running…' : 'Investigate place and culture'}
            </button>
          </div>
        )}

        {(streaming || events.length > 0 || streamError) && (
          <div style={{ marginTop: '1.25rem' }}>
            <PipelineRunner
              streaming={streaming}
              events={events}
              error={streamError}
              onRetry={() => start()}
            />
          </div>
        )}
      </section>

      <p style={{ marginTop: '2rem', maxWidth: '44rem', fontSize: '0.8125rem', color: 'var(--muted-2)', lineHeight: 1.65 }}>
        {project.mode === 'discover'
          ? 'The agent starts without a proposed concept. It reads the location, audience and cultural evidence, then discovers what kinds of commercial experience could genuinely serve this place.'
          : `The agent's objective is not to generate a generic ${project.projectType}. It is to develop a culturally and commercially defensible concept for this property and explain why it should exist here.`}{' '}
        Qloo provides cultural relationships; PlaceGraph decides whether they represent a meaningful opportunity.
      </p>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.75rem' }}>
      {children}
    </p>
  );
}

function MetricChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: '0.5rem 0.875rem',
      border: `1.5px solid ${highlight ? 'var(--external)' : 'var(--line-2)'}`,
      borderRadius: 'var(--radius)',
      background: highlight ? 'var(--external-bg)' : 'var(--surface-raised)',
    }}>
      <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: highlight ? 'var(--external)' : 'var(--ink-2)', marginTop: '0.1rem' }}>
        {value}
      </div>
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="pg-skeleton" style={{ height: '12px', width: '120px' }} />
      <div className="pg-skeleton" style={{ height: '40px', width: '60%' }} />
      <div className="pg-skeleton" style={{ height: '16px', width: '200px' }} />
      <div className="pg-skeleton" style={{ height: '80px', borderRadius: 'var(--radius-md)' }} />
      <div className="pg-skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
    </div>
  );
}
