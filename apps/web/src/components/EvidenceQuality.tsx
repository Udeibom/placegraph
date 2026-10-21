'use client';

import type { EvidenceGate } from '@placegraph/types';
import { useState } from 'react';

const MODE_LABELS: Record<string, string> = {
  live:     'Live intelligence',
  mixed:    'Mixed intelligence',
  template: 'Template mode',
};

const MODE_BADGE: Record<string, string> = {
  live:     'pg-badge pg-badge-live',
  mixed:    'pg-badge pg-badge-mixed',
  template: 'pg-badge pg-badge-warning',
};

const QUALITY_COLOR: Record<string, string> = {
  strong:       'var(--success)',
  moderate:     'var(--qloo)',
  insufficient: 'var(--error-color)',
};

function QualityBar({ label, value }: { label: string; value: 'strong' | 'moderate' | 'insufficient' }) {
  const widths = { strong: '100%', moderate: '55%', insufficient: '22%' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
      <span style={{ color: 'var(--muted)', minWidth: '5rem' }}>{label}</span>
      <div style={{ flex: 1, height: '4px', background: 'var(--line-2)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          width: widths[value] ?? '0%',
          height: '100%',
          background: QUALITY_COLOR[value] ?? 'var(--muted-2)',
          borderRadius: '2px',
          transition: 'width 0.5s var(--ease-out)',
        }} />
      </div>
      <span style={{ color: QUALITY_COLOR[value] ?? 'var(--muted)', minWidth: '5rem', fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {value}
      </span>
    </div>
  );
}

export function EvidenceQuality({
  gate,
  intelligenceMode,
  qlooSource,
}: {
  gate?: EvidenceGate | null;
  intelligenceMode?: string | null;
  qlooSource?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const mode = intelligenceMode || 'template';
  const hasWarnings = (gate?.warnings?.length ?? 0) > 0;

  return (
    <div style={{
      background: 'var(--surface-raised)',
      border: '1.5px solid var(--line-2)',
      borderRadius: 'var(--radius-md)',
      padding: '0.875rem 1rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span className={MODE_BADGE[mode] ?? 'pg-badge pg-badge-neutral'}>
          {MODE_LABELS[mode] ?? mode}
        </span>
        {qlooSource && (
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            Qloo: <strong style={{ color: 'var(--qloo)' }}>{qlooSource}</strong>
          </span>
        )}
        {hasWarnings && (
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              fontSize: '0.75rem',
              color: 'var(--assumption)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
            }}
          >
            {expanded ? 'Hide' : 'Show'} {gate!.warnings.length} warning{gate!.warnings.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {gate && (
        <div style={{ marginTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <QualityBar label="Location" value={gate.locationQuality} />
          <QualityBar label="Qloo" value={gate.qlooQuality} />
        </div>
      )}

      {expanded && hasWarnings && (
        <ul style={{ marginTop: '0.625rem', padding: '0.625rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius)', listStyle: 'none' }}>
          {gate!.warnings.map((w, i) => (
            <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: i < gate!.warnings.length - 1 ? '0.25rem' : 0 }}>
              ⚠ {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
