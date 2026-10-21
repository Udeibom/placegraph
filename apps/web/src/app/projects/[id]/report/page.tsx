'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProject } from '@/components/ProjectView';
import { ReasoningChain } from '@/components/ReasoningChain';
import type { ArchitecturalDecision, ExperienceRequirement } from '@placegraph/types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2.5rem', breakInside: 'avoid' }}>
      <h2 style={{
        fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.25rem',
        fontWeight: 700, color: 'var(--ink)', borderBottom: '2px solid var(--accent)',
        paddingBottom: '0.375rem', marginBottom: '1rem',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)' }}>
        {label}
      </span>
      <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{value}</p>
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const { bundle, loading, error } = useProject(id);

  if (loading) return <div className="pg-skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />;
  if (error || !bundle?.project) return <p style={{ color: 'var(--muted)' }}>Project not found.</p>;

  const { project, analysis } = bundle;
  const strategy = analysis?.strategies.find((s) => s.id === analysis.selectedStrategyId);
  const loc = [project.location.neighborhood, project.location.city].filter(Boolean).join(', ');
  const reportUrl = `/api/projects/${id}/report`;

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
      {/* Print-hide controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }} className="no-print">
        <Link href={`/projects/${id}/concept`} className="pg-btn pg-btn-ghost">← Back to concept</Link>
        <a href={reportUrl} download className="pg-btn pg-btn-ghost">Download JSON</a>
        <button type="button" onClick={() => window.print()} className="pg-btn">
          Print / Save PDF
        </button>
      </div>

      {/* Report header */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '3px solid var(--accent)' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: '0.75rem' }}>
          PlaceGraph · Cultural Intelligence Report
        </p>
        <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.18, marginBottom: '0.375rem' }}>
          {project.name}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--muted)' }}>
          {project.projectType} · {loc || 'Location not specified'}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-2)', marginTop: '0.25rem' }}>
          Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Project brief */}
      <Section title="Project brief">
        <blockquote style={{
          fontFamily: '"Libre Baskerville", Georgia, serif',
          fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.75, color: 'var(--ink-2)',
          borderLeft: '3px solid var(--accent)', paddingLeft: '1.25rem', margin: '0 0 1rem',
        }}>
          {project.objective}
        </blockquote>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Budget" value={project.budgetRange} />
          <Field label="Floor area" value={project.floorArea} />
        </div>
        {project.audiences?.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>Audiences</p>
            {project.audiences.map((a) => (
              <p key={a.name} style={{ fontSize: '0.9rem', color: 'var(--ink-2)', marginBottom: '0.2rem' }}>
                <strong>P{a.priority}:</strong> {a.name}{a.description ? ` — ${a.description}` : ''}
              </p>
            ))}
          </div>
        )}
        {project.constraints?.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>Constraints</p>
            {project.constraints.map((c) => (
              <p key={c.key} style={{ fontSize: '0.9rem', color: 'var(--ink-2)', marginBottom: '0.1rem' }}>
                <strong>{c.key}:</strong> {c.value}
              </p>
            ))}
          </div>
        )}
      </Section>

      {analysis && (
        <>
          {/* Evidence sources */}
          <Section title="Evidence sources">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', border: '1px solid var(--line-2)', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Intelligence mode</p>
                <p style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{analysis.intelligenceMode ?? '—'}</p>
              </div>
              <div style={{ padding: '0.75rem', border: '1px solid var(--line-2)', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Qloo</p>
                <p style={{ fontWeight: 500, color: 'var(--qloo)' }}>{analysis.qlooContext?.source ?? '—'}</p>
              </div>
              <div style={{ padding: '0.75rem', border: '1px solid var(--line-2)', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>Location</p>
                <p style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{analysis.locationContext?.evidenceQuality ?? '—'}</p>
              </div>
            </div>
            {(analysis.qlooContext?.notes?.length ?? 0) > 0 && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontStyle: 'italic', marginTop: '0.75rem' }}>
                {analysis.qlooContext?.notes?.join(' ')}
              </p>
            )}
          </Section>

          {/* Selected strategy */}
          {strategy && (
            <Section title="Selected strategy">
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)' }}>
                  Direction: {strategy.direction}
                </span>
              </div>
              <h3 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
                {strategy.title}
              </h3>
              <Field label="Why it exists here" value={strategy.why} />
              <Field label="Who it serves" value={strategy.whoServes} />
              <Field label="Experience thesis" value={strategy.experienceThesis} />
              <Field label="Differentiation" value={strategy.differentiation} />
            </Section>
          )}

          {/* Experience requirements */}
          {analysis.requirements?.length > 0 && (
            <Section title="Experience requirements">
              {analysis.requirements.map((req: ExperienceRequirement) => (
                <div key={req.id} style={{ paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid var(--line-2)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-2)' }}>{req.priority}</span>
                    {req.zone && <span style={{ fontSize: '0.6875rem', color: 'var(--muted-2)' }}>· {req.zone}</span>}
                  </div>
                  <p style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--ink)' }}>{req.requirement}</p>
                  {req.rationale && <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{req.rationale}</p>}
                </div>
              ))}
            </Section>
          )}

          {/* Architectural decisions */}
          {analysis.decisions?.length > 0 && (
            <Section title="Architectural decisions">
              {analysis.decisions.map((d: ArchitecturalDecision) => (
                <div key={d.id} style={{ padding: '0.875rem 1rem', border: '1px solid var(--line-2)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                  {d.zone && <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.125rem' }}>{d.zone}</p>}
                  <p style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '0.375rem' }}>{d.decision}</p>
                  {d.qlooEstablished && <p style={{ fontSize: '0.8125rem', color: 'var(--qloo)' }}>Qloo: {d.qlooEstablished}</p>}
                  {d.inferred        && <p style={{ fontSize: '0.8125rem', color: 'var(--inference)' }}>Inferred: {d.inferred}</p>}
                  {d.unverified      && <p style={{ fontSize: '0.8125rem', color: 'var(--assumption)' }}>⚠ {d.unverified}</p>}
                </div>
              ))}
            </Section>
          )}

          {/* Reasoning chain */}
          {analysis.provenance?.length > 0 && (
            <Section title="Reasoning chain">
              <ReasoningChain nodes={analysis.provenance} maxInitial={999} />
            </Section>
          )}
        </>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          header, nav { display: none !important; }
          .pg-skeleton { display: none; }
        }
      `}</style>
    </div>
  );
}
