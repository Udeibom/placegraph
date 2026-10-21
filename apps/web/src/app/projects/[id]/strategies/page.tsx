'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PipelineNav } from '@/components/PipelineNav';
import { PipelineRunner } from '@/components/PipelineRunner';
import { useProject } from '@/components/ProjectView';
import { useStream } from '@/lib/useStream';
import type { ProjectBundle } from '@/lib/api';
import type { Strategy } from '@placegraph/types';

const DIRECTION_CLASS: Record<string, string> = {
  'Local Cultural Alignment': 'pg-badge pg-badge-external',
  'Cultural Whitespace':      'pg-badge pg-badge-infer',
  'Destination Experience':   'pg-badge pg-badge-accent',
};

const DIRECTION_BORDER: Record<string, string> = {
  'Local Cultural Alignment': 'var(--external)',
  'Cultural Whitespace':      'var(--inference)',
  'Destination Experience':   'var(--accent)',
};

function StrategyCard({
  strategy,
  selected,
  dimmed,
  onSelect,
  busy,
}: {
  strategy: Strategy;
  selected: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  busy: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = DIRECTION_BORDER[strategy.direction] ?? 'var(--accent)';
  const badgeClass  = DIRECTION_CLASS[strategy.direction] ?? 'pg-badge pg-badge-neutral';

  return (
    <article style={{
      border: `1.5px solid ${selected ? borderColor : 'var(--line-2)'}`,
      borderLeft: `5px solid ${selected ? borderColor : dimmed ? 'var(--line-2)' : borderColor}`,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-raised)',
      opacity: dimmed ? 0.45 : 1,
      transition: 'opacity var(--duration) var(--ease), border-color var(--duration) var(--ease)',
    }}>
      {/* Header */}
      <div style={{ padding: '1.375rem 1.5rem', borderBottom: '1.5px solid var(--line-2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ marginBottom: '0.375rem' }}>
              <span className={badgeClass}>{strategy.direction}</span>
              {selected && <span className="pg-badge pg-badge-success" style={{ marginLeft: '0.375rem' }}>Selected</span>}
            </div>
            <h2 style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25,
            }}>
              {strategy.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelect(strategy.id)}
            disabled={busy}
            className="pg-btn"
            style={{ flexShrink: 0 }}
          >
            {busy ? 'Designing…' : selected ? 'Re-design' : 'Select and design →'}
          </button>
        </div>

        <p style={{ marginTop: '0.75rem', fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.7, fontStyle: 'italic' }}>
          {strategy.experienceThesis}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '1.125rem 1.5rem' }}>
        {/* Why + who */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>
              Why it exists here
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{strategy.why}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>
              Who it serves
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{strategy.whoServes}</p>
          </div>
        </div>

        {/* Physical experience */}
        {strategy.physicalExperience && (
          <div style={{
            padding: '0.875rem 1rem', marginBottom: '1rem',
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            border: '1px solid var(--line-2)',
          }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>
              Physical experience
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>
              {strategy.physicalExperience}
            </p>
          </div>
        )}

        {/* Differentiation */}
        {strategy.differentiation && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.25rem' }}>
              Differentiation
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{strategy.differentiation}</p>
          </div>
        )}

        {/* Evidence trail */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.875rem' }}>
          {strategy.qlooEstablished && (
            <div style={{ padding: '0.5rem 0.625rem', background: 'var(--qloo-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(181,129,74,0.2)' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--qloo)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Qloo</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{strategy.qlooEstablished}</p>
            </div>
          )}
          {strategy.locallyEstablished && (
            <div style={{ padding: '0.5rem 0.625rem', background: 'var(--external-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(78,122,94,0.2)' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--external)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Local</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{strategy.locallyEstablished}</p>
            </div>
          )}
          {strategy.inferred && (
            <div style={{ padding: '0.5rem 0.625rem', background: 'var(--inference-bg)', borderRadius: 'var(--radius)', border: '1px solid rgba(90,122,158,0.2)' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--inference)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Inferred</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{strategy.inferred}</p>
            </div>
          )}
        </div>

        {/* Expandable risks/assumptions */}
        {((strategy.risks?.length ?? 0) > 0 || (strategy.assumptions?.length ?? 0) > 0) && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              style={{ fontSize: '0.8125rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textDecorationStyle: 'dotted' }}
            >
              {expanded ? 'Hide' : 'Show'} risks and assumptions
            </button>
            {expanded && (
              <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {strategy.risks?.length > 0 && (
                  <div style={{ padding: '0.625rem 0.75rem', background: 'var(--error-bg)', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--error-color)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Risks</p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {strategy.risks.map((r, i) => <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.125rem' }}>· {r}</li>)}
                    </ul>
                  </div>
                )}
                {strategy.assumptions?.length > 0 && (
                  <div style={{ padding: '0.625rem 0.75rem', background: 'var(--assumption-bg)', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--assumption)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Assumptions</p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {strategy.assumptions.map((a, i) => <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.125rem' }}>· {a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function StrategiesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { bundle, error, loading, setBundle } = useProject(id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDone = useCallback((b: ProjectBundle) => {
    setBundle(b);
    router.push(`/projects/${id}/concept`);
  }, [setBundle, router, id]);

  const { streaming, events, error: streamError, start } =
    useStream(id, 'design', handleDone);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1,2,3].map(i => <div key={i} className="pg-skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }} />)}
    </div>
  );

  if (error || !bundle?.analysis?.strategies?.length) return (
    <p style={{ color: 'var(--muted)' }}>
      Run analysis first so strategies can be compared.{' '}
      <a href={`/projects/${id}`} style={{ color: 'var(--accent)' }}>← Back to project</a>
    </p>
  );

  const { analysis, project } = bundle;
  const currentSelected = selectedId ?? analysis.selectedStrategyId ?? null;

  function choose(strategyId: string) {
    setSelectedId(strategyId);
    start({ strategyId });
  }

  return (
    <main>
      <PipelineNav projectId={id} current="strategy" analysisStatus={project.status} />

      <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
        Strategic directions
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', maxWidth: '44rem', lineHeight: 1.65, marginBottom: '2rem' }}>
        These are different commercial positions, not three versions of the same interior.
        Each one implies different audiences, different space, and a different reason to exist.
        Selecting a direction triggers the architectural design stage.
      </p>

      {(streaming || events.length > 0 || streamError) && (
        <div style={{ marginBottom: '1.5rem' }}>
          <PipelineRunner
            streaming={streaming}
            events={events}
            error={streamError}
            onRetry={() => currentSelected && start({ strategyId: currentSelected })}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {analysis.strategies.map((s) => (
          <StrategyCard
            key={s.id}
            strategy={s}
            selected={s.id === currentSelected}
            dimmed={!!currentSelected && s.id !== currentSelected && !streaming}
            onSelect={choose}
            busy={streaming}
          />
        ))}
      </div>
    </main>
  );
}
