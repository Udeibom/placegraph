'use client';

import Link from 'next/link';
import { PIPELINE_STAGES } from '@placegraph/types';

const hrefFor: Record<string, (id: string) => string> = {
  place:         (id) => `/projects/${id}`,
  culture:       (id) => `/projects/${id}/analysis`,
  opportunity:   (id) => `/projects/${id}/analysis`,
  strategy:      (id) => `/projects/${id}/strategies`,
  experience:    (id) => `/projects/${id}/concept`,
  architecture:  (id) => `/projects/${id}/concept`,
  concept:       (id) => `/projects/${id}/concept`,
  visualization: (id) => `/projects/${id}/concept`,
  review:        (id) => `/projects/${id}/review`,
};

// Stage order for determining done/pending
const STAGE_ORDER = PIPELINE_STAGES.map((s) => s.id);

export function PipelineNav({
  projectId,
  current,
  analysisStatus,
}: {
  projectId: string;
  current?: string;
  analysisStatus?: string;
}) {
  const currentIdx = current ? STAGE_ORDER.findIndex((s) => s === current) : -1;

  // Map analysis status to a completed-through index
  const statusCompletedThrough: Record<string, number> = {
    analyzing:         1,
    ready:             3,
    strategy_selected: 4,
    designed:          6,
    visualized:        7,
    review:            8,
  };
  const completedThrough = analysisStatus
    ? (statusCompletedThrough[analysisStatus] ?? -1)
    : currentIdx - 1;

  return (
    <nav aria-label="Pipeline stages" style={{ marginBottom: '2.5rem', overflowX: 'auto' }}>
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        listStyle: 'none',
        margin: 0,
        padding: 0,
        minWidth: 'max-content',
      }}>
        {PIPELINE_STAGES.map((stage, i) => {
          const isDone    = i <= completedThrough;
          const isActive  = stage.id === current;
          const isPending = !isDone && !isActive;
          const href      = hrefFor[stage.id]?.(projectId) ?? `/projects/${projectId}`;
          const isLast    = i === PIPELINE_STAGES.length - 1;

          return (
            <li key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                href={href}
                aria-current={isActive ? 'step' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.625rem',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.03em',
                  color: isActive ? 'var(--accent-2)' : isDone ? 'var(--accent)' : 'var(--muted-2)',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  transition: 'color var(--duration-fast) var(--ease), background var(--duration-fast) var(--ease)',
                  whiteSpace: 'nowrap',
                }}
              >
                {/* Step indicator */}
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `1.5px solid ${isActive ? 'var(--accent)' : isDone ? 'var(--accent)' : 'var(--line)'}`,
                  background: isDone && !isActive ? 'var(--accent)' : isActive ? 'var(--accent)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.625rem',
                  color: 'var(--surface-raised)',
                  fontWeight: 700,
                  animation: isActive ? 'none' : undefined,
                }}>
                  {isDone && !isActive ? (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5 L3.5 6 L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : isActive ? (
                    <span className="pipeline-dot-active" style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'white', display: 'block',
                    }} />
                  ) : (
                    <span style={{ color: 'var(--muted-2)', fontSize: '0.5625rem', fontWeight: 600 }}>
                      {i + 1}
                    </span>
                  )}
                </span>
                {stage.label}
              </Link>

              {/* Connector line */}
              {!isLast && (
                <span style={{
                  display: 'block',
                  width: '1.25rem',
                  height: '1.5px',
                  background: isDone ? 'var(--accent-mid)' : 'var(--line-2)',
                  flexShrink: 0,
                  transition: 'background var(--duration-slow) var(--ease)',
                }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

