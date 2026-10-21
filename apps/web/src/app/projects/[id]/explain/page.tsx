'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { PipelineNav } from '@/components/PipelineNav';
import { ReasoningChain } from '@/components/ReasoningChain';
import { useProject } from '@/components/ProjectView';
import type { ArchitecturalDecision } from '@placegraph/types';

function ChainLevel({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
      <div style={{
        position: 'absolute', left: 0, top: '4px',
        width: '10px', height: '10px', borderRadius: '50%',
        border: `2px solid ${color}`, background: 'var(--surface-raised)',
      }} />
      <div style={{ borderLeft: `2px solid ${color}33`, paddingLeft: '1.25rem', paddingBottom: '1rem' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: '0.25rem' }}>
          {label}
        </p>
        <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

function DecisionExplain({ decisionId, bundle }: { decisionId: string; bundle: any }) {
  const analysis = bundle?.analysis;
  if (!analysis) return null;

  const decision: ArchitecturalDecision | undefined = analysis.decisions.find((d: ArchitecturalDecision) => d.id === decisionId);
  if (!decision) return (
    <p style={{ color: 'var(--muted)' }}>
      Decision not found. <Link href={`/projects/${bundle.project.id}/concept`} style={{ color: 'var(--accent)' }}>← Back to concept</Link>
    </p>
  );

  const strategy = analysis.strategies.find((s: any) => s.selected) || analysis.strategies.find((s: any) => s.id === analysis.selectedStrategyId);
  const req = analysis.requirements.find((r: any) => r.zone === decision.zone) ?? analysis.requirements[0];

  return (
    <div>
      {/* Decision header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        border: '1.5px solid var(--line-2)',
        borderLeft: '5px solid var(--accent)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        marginBottom: '2rem',
      }}>
        {decision.zone && (
          <span className="pg-badge pg-badge-neutral" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{decision.zone}</span>
        )}
        <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)' }}>
          {decision.decision}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '0.375rem' }}>
          Trace below shows how this decision arose from cultural and commercial reasoning.
        </p>
      </div>

      {/* Trace chain */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '1.25rem' }}>
          Reasoning trace
        </h3>

        <ChainLevel label="Architectural decision" color="var(--accent)">
          {decision.decision}
          {decision.alternatives?.length > 0 && (
            <p style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
              Alternatives considered: {decision.alternatives.join(' · ')}
            </p>
          )}
        </ChainLevel>

        {req && (
          <ChainLevel label="Experience requirement" color="var(--inference)">
            <strong>{req.requirement}</strong>
            {req.rationale && <p style={{ marginTop: '0.125rem' }}>{req.rationale}</p>}
          </ChainLevel>
        )}

        {strategy && (
          <ChainLevel label="Strategy" color="var(--external)">
            <strong>{strategy.title}</strong>
            <p style={{ marginTop: '0.125rem' }}>{strategy.why}</p>
          </ChainLevel>
        )}

        {decision.qlooEstablished && (
          <ChainLevel label="Qloo evidence" color="var(--qloo)">
            {decision.qlooEstablished}
          </ChainLevel>
        )}

        {decision.locallyEstablished && (
          <ChainLevel label="Local / geographic evidence" color="var(--external)">
            {decision.locallyEstablished}
          </ChainLevel>
        )}

        {decision.inferred && (
          <ChainLevel label="Agent inference" color="var(--inference)">
            {decision.inferred}
          </ChainLevel>
        )}

        {decision.unverified && (
          <ChainLevel label="Unverified assumption" color="var(--assumption)">
            <span style={{ color: 'var(--assumption)' }}>⚠</span> {decision.unverified}
          </ChainLevel>
        )}
      </div>

      {/* whyChain provenance */}
      {decision.whyChain?.length > 0 && (
        <div>
          <h3 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.875rem' }}>
            Provenance chain
          </h3>
          <ReasoningChain nodes={decision.whyChain} />
        </div>
      )}
    </div>
  );
}

function AllDecisions({ bundle }: { bundle: any }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const analysis = bundle?.analysis;
  const decisions: ArchitecturalDecision[] = analysis?.decisions ?? [];

  if (!decisions.length) return <p style={{ color: 'var(--muted)' }}>No decisions yet. Complete the design stage first.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {decisions.map((d) => (
        <div key={d.id} style={{
          border: '1.5px solid var(--line-2)',
          borderLeft: '4px solid var(--accent)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-raised)',
          overflow: 'hidden',
        }}>
          <button
            type="button"
            onClick={() => setExpanded(expanded === d.id ? null : d.id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1.125rem',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            {d.zone && <span className="pg-badge pg-badge-neutral" style={{ flexShrink: 0, marginTop: '2px' }}>{d.zone}</span>}
            <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9375rem', color: 'var(--ink)', lineHeight: 1.4 }}>{d.decision}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--muted-2)', flexShrink: 0 }}>
              {expanded === d.id ? '▲' : '▼'}
            </span>
          </button>

          {expanded === d.id && (
            <div style={{ padding: '0 1.125rem 1rem', animation: 'pg-slide-up var(--duration) var(--ease-out) both' }}>
              <DecisionExplain decisionId={d.id} bundle={bundle} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExplainInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const decisionId = search.get('decision');
  const { bundle, loading } = useProject(id);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="pg-skeleton" style={{ height: '24px', width: '40%' }} />
      <div className="pg-skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
      <div className="pg-skeleton" style={{ height: '240px', borderRadius: 'var(--radius-md)' }} />
    </div>
  );

  const analysis = bundle?.analysis;
  if (!analysis) return <p style={{ color: 'var(--muted)' }}>No reasoning chain yet. Complete at least the design stage.</p>;

  return (
    <main>
      <PipelineNav projectId={id} current="architecture" analysisStatus={bundle?.project.status} />

      <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
        {decisionId ? 'Why is this here?' : 'Reasoning chain'}
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', maxWidth: '44rem', lineHeight: 1.65, marginBottom: '2rem' }}>
        Every architectural decision traces back through: experience requirement → strategy → Qloo evidence
        → local observation → agent inference → unverified assumption. Selecting a decision shows the full chain.
      </p>

      {decisionId ? (
        <>
          <DecisionExplain decisionId={decisionId} bundle={bundle} />
          <div style={{ marginTop: '2rem' }}>
            <Link href={`/projects/${id}/explain`} style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>
              ← All decisions
            </Link>
          </div>
        </>
      ) : (
        <>
          <AllDecisions bundle={bundle} />

          {analysis.provenance?.length > 0 && (
            <section style={{ marginTop: '2.5rem' }}>
              <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.75rem' }}>
                Full provenance chain
              </h2>
              <ReasoningChain nodes={analysis.provenance} maxInitial={8} />
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default function ExplainPage() {
  return (
    <Suspense>
      <ExplainInner />
    </Suspense>
  );
}
