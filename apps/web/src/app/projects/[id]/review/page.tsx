'use client';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PipelineNav } from '@/components/PipelineNav';
import { PipelineRunner } from '@/components/PipelineRunner';
import { useProject } from '@/components/ProjectView';
import { useStream } from '@/lib/useStream';
import type { ProjectBundle } from '@/lib/api';

const CHAIN_LEVEL_META: Record<string, { label: string; color: string; desc: string }> = {
  evidence:      { label: 'Evidence',      color: 'var(--qloo)',       desc: 'Cultural or local facts are wrong or missing' },
  opportunity:   { label: 'Opportunity',   color: 'var(--external)',   desc: 'The whitespace or destination hypothesis is wrong' },
  strategy:      { label: 'Strategy',      color: 'var(--inference)',  desc: 'Commercial direction should change' },
  experience:    { label: 'Experience',    color: 'var(--accent)',     desc: 'Requirements or priorities of experience should change' },
  architecture:  { label: 'Architecture',  color: 'var(--ink)',        desc: 'Spatial/material decisions while strategy holds' },
  visualization: { label: 'Visualization', color: 'var(--muted)',      desc: 'Image failed to represent an otherwise correct concept' },
};

const FEEDBACK_PROMPTS = [
  'This feels too much like an entertainment venue.',
  'The audience targeting is wrong — we need to focus on…',
  'Reconsider the budget implications of this approach.',
  'The cultural framing is not appropriate to this neighbourhood.',
  'The spatial organization doesn\'t reflect the priority of audiences.',
];

function ChainLevelBadge({ level }: { level: string }) {
  const meta = CHAIN_LEVEL_META[level];
  if (!meta) return <span className="pg-badge pg-badge-neutral">{level}</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      borderRadius: '999px', fontSize: '0.6875rem', fontWeight: 600,
      letterSpacing: '0.06em', padding: '0.2rem 0.625rem',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
      background: `${meta.color}18`,
      color: meta.color,
      border: `1px solid ${meta.color}44`,
    }}>
      {meta.label}
    </span>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { bundle, error, loading, setBundle } = useProject(id);
  const [feedback, setFeedback] = useState('');

  const handleReviewDone = useCallback((b: ProjectBundle) => {
    setBundle(b);
    setFeedback('');
  }, [setBundle]);

  const handleCfDone = useCallback((b: ProjectBundle) => setBundle(b), [setBundle]);

  const {
    streaming: reviewStreaming, events: reviewEvents, error: reviewError, start: startReview,
  } = useStream(id, 'review', handleReviewDone);

  const {
    streaming: cfStreaming, events: cfEvents, error: cfError, start: startCf,
  } = useStream(id, 'counterfactual', handleCfDone);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="pg-skeleton" style={{ height: '32px', width: '45%' }} />
      <div className="pg-skeleton" style={{ height: '140px', borderRadius: 'var(--radius-md)' }} />
    </div>
  );

  if (error || !bundle?.analysis) return (
    <p style={{ color: 'var(--muted)' }}>
      No project analysis. <Link href={`/projects/${id}`} style={{ color: 'var(--accent)' }}>← Back to project</Link>
    </p>
  );

  const { analysis, project } = bundle;
  const reviews = analysis.reviews ?? [];
  const cf = analysis.counterfactual;

  function submitReview() {
    if (!feedback.trim()) return;
    startReview({ feedback });
  }

  return (
    <main>
      <PipelineNav projectId={id} current="review" analysisStatus={project.status} />

      <h1 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.375rem' }}>
        Professional review
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', maxWidth: '44rem', lineHeight: 1.65, marginBottom: '2rem' }}>
        Feedback causes reasoning — not blind regeneration. The agent diagnoses which reasoning layer the
        problem sits in, then revises from that layer upward.
      </p>

      {/* Feedback form */}
      <section style={{
        padding: '1.5rem',
        border: '1.5px solid var(--line-2)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        marginBottom: '2rem',
      }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink-2)', marginBottom: '0.5rem' }}>
          Your feedback
        </label>
        <textarea
          className="pg-input"
          style={{ minHeight: '7rem', marginBottom: '0.625rem' }}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={reviewStreaming}
          placeholder="e.g. This feels too much like an entertainment venue. The restaurant must remain primarily a serious dining destination."
        />

        {/* Example prompts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
          {FEEDBACK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFeedback(p)}
              style={{
                fontSize: '0.75rem', padding: '0.25rem 0.625rem',
                border: '1px solid var(--line)', borderRadius: '999px',
                background: 'var(--surface)', color: 'var(--muted)',
                cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease)',
              }}
            >
              "{p.slice(0, 40)}…"
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={submitReview}
          disabled={reviewStreaming || !feedback.trim()}
          className="pg-btn"
        >
          {reviewStreaming ? 'Diagnosing and revising…' : 'Diagnose and revise'}
        </button>
      </section>

      {(reviewStreaming || reviewEvents.length > 0 || reviewError) && (
        <div style={{ marginBottom: '2rem' }}>
          <PipelineRunner
            streaming={reviewStreaming}
            events={reviewEvents}
            error={reviewError}
            onRetry={() => feedback.trim() && startReview({ feedback })}
          />
        </div>
      )}

      {/* Revision history */}
      {reviews.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            Revision history
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...reviews].reverse().map((rev, i) => (
              <div key={rev.id ?? i} style={{
                padding: '1rem 1.25rem',
                border: '1.5px solid var(--line-2)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-raised)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                  <ChainLevelBadge level={rev.chainLevel} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-2)' }}>
                    {CHAIN_LEVEL_META[rev.chainLevel]?.desc}
                  </span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                  "{rev.feedback}"
                </p>
                {rev.diagnosis && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: '0.375rem' }}>
                    <strong style={{ fontWeight: 600 }}>Diagnosis:</strong> {rev.diagnosis}
                  </p>
                )}
                {rev.guidance && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                    <strong style={{ fontWeight: 600 }}>Guidance applied:</strong> {rev.guidance}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Counterfactual */}
      <section style={{
        border: '1.5px solid var(--line-2)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: '2rem',
      }}>
        <div style={{
          padding: '1.125rem 1.375rem',
          background: 'var(--surface)',
          borderBottom: '1.5px solid var(--line-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <h2 style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)' }}>
              What did Qloo change?
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.125rem' }}>
              Runs the same brief twice — once with Qloo cultural intelligence, once without — then isolates the difference.
            </p>
          </div>
          <button
            type="button"
            onClick={() => startCf()}
            disabled={cfStreaming}
            className="pg-btn pg-btn-ghost"
          >
            {cfStreaming ? 'Running…' : cf ? 'Re-run counterfactual' : 'Run counterfactual'}
          </button>
        </div>

        {(cfStreaming || cfEvents.length > 0 || cfError) && (
          <div style={{ padding: '1rem 1.375rem' }}>
            <PipelineRunner streaming={cfStreaming} events={cfEvents} error={cfError} onRetry={() => startCf()} />
          </div>
        )}

        {cf && !cfStreaming && (
          <div style={{ padding: '1.375rem' }}>
            {cf.summary && (
              <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {cf.summary}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.875rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--line-2)' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-2)', marginBottom: '0.375rem' }}>
                  Without Qloo
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{cf.genericStrategy}</p>
              </div>
              <div style={{ padding: '0.875rem 1rem', background: 'var(--qloo-bg)', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(181,129,74,0.25)' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--qloo)', marginBottom: '0.375rem' }}>
                  With Qloo
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{cf.culturalStrategy}</p>
              </div>
            </div>

            {cf.whatQlooChanged?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--qloo)', marginBottom: '0.5rem' }}>
                  What Qloo changed
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {cf.whatQlooChanged.map((item: string, i: number) => (
                    <li key={i} style={{
                      fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.55,
                      paddingLeft: '1rem', marginBottom: '0.375rem', position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--qloo)' }}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cf.caveat && (
              <div style={{
                padding: '0.625rem 0.875rem',
                background: 'var(--assumption-bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(196,124,42,0.2)',
                fontSize: '0.8125rem',
                color: 'var(--ink-2)',
                lineHeight: 1.55,
              }}>
                ⚠ {cf.caveat}
              </div>
            )}
          </div>
        )}
      </section>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href={`/projects/${id}/concept`} className="pg-btn pg-btn-ghost">
          ← Concept
        </Link>
        <Link href={`/projects/${id}/report`} className="pg-btn pg-btn-ghost">
          Export report
        </Link>
      </div>
    </main>
  );
}
