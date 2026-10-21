'use client';

import type { StreamEvent } from '@/lib/useStream';
import { PIPELINE_STAGES } from '@placegraph/types';

const stageLabel = (id: string) =>
  PIPELINE_STAGES.find((s) => s.id === id)?.label ?? id;

export function PipelineRunner({
  streaming,
  events,
  error,
  onRetry,
  className,
}: {
  streaming: boolean;
  events: StreamEvent[];
  error: string | null;
  onRetry?: () => void;
  className?: string;
}) {
  if (!streaming && !events.length && !error) return null;

  return (
    <div
      className={className}
      style={{
        background: 'var(--surface-raised)',
        border: '1.5px solid var(--line-2)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.75rem 1rem',
        borderBottom: events.length ? '1.5px solid var(--line-2)' : 'none',
        background: 'var(--surface)',
      }}>
        {streaming ? (
          <>
            <span className="pipeline-spinner" style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid var(--line)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-2)' }}>
              Analysis running…
            </span>
          </>
        ) : error ? (
          <>
            <span style={{ fontSize: '0.875rem' }}>⚠</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--error-color)' }}>
              Pipeline error
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.875rem', color: 'var(--success)' }}>✓</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--success)' }}>
              Complete
            </span>
          </>
        )}
      </div>

      {/* Events */}
      {events.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: '0.5rem 0' }}>
          {events.map((ev, i) => {
            const isLast = i === events.length - 1;
            return (
              <li key={`${ev.at}-${i}`} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.4375rem 1rem',
                opacity: isLast && streaming ? 1 : 0.65,
                transition: 'opacity var(--duration) var(--ease)',
              }}>
                {/* Dot */}
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isLast && streaming ? 'var(--accent)' : 'var(--line)',
                  flexShrink: 0,
                  marginTop: '4px',
                  animation: isLast && streaming ? 'pg-pulse-dot 1.4s ease-in-out infinite' : 'none',
                }} />
                <div>
                  <span style={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isLast && streaming ? 'var(--accent)' : 'var(--muted-2)',
                    marginBottom: '0.125rem',
                  }}>
                    {stageLabel(ev.stage)}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', lineHeight: 1.4 }}>
                    {ev.message}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          padding: '0.875rem 1rem',
          background: 'var(--error-bg)',
          borderTop: '1.5px solid var(--line-2)',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--error-color)', marginBottom: onRetry ? '0.625rem' : 0 }}>
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="pg-btn pg-btn-sm"
              style={{ background: 'var(--error-color)' }}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
