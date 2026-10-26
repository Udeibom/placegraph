'use client';

import type { ProvenanceNode } from '@placegraph/types';
import { useState } from 'react';

const KIND_CONFIG: Record<string, { label: string; cssClass: string; icon: string }> = {
  qloo_evidence: { label: 'Qloo established',       cssClass: 'chain-node-qloo',       icon: '◆' },
  external:      { label: 'Local / geographic',      cssClass: 'chain-node-external',   icon: '◉' },
  inference:     { label: 'Agent inferred',          cssClass: 'chain-node-inference',  icon: '◈' },
  decision:      { label: 'Architectural reasoning', cssClass: 'chain-node-decision',   icon: '▣' },
  assumption:    { label: 'Unverified assumption',   cssClass: 'chain-node-assumption', icon: '◇' },
  constraint:    { label: 'Constraint',              cssClass: 'chain-node-constraint', icon: '◔' },
};

const BADGE_CLASS: Record<string, string> = {
  qloo_evidence: 'pg-badge pg-badge-qloo',
  external:      'pg-badge pg-badge-external',
  inference:     'pg-badge pg-badge-infer',
  decision:      'pg-badge pg-badge-neutral',
  assumption:    'pg-badge pg-badge-assume',
  constraint:    'pg-badge pg-badge-constr',
};

function ChainNode({ node, depth = 0 }: { node: ProvenanceNode; depth?: number }) {
  const [expanded] = useState(true);
  const cfg = KIND_CONFIG[node.kind] ?? { label: node.kind, cssClass: 'chain-node-decision', icon: '○' };
  const hasRefs = (node.qlooRefs?.length ?? 0) > 0 || (node.refs?.length ?? 0) > 0;

  return (
    <div style={{ marginLeft: depth > 0 ? '1.25rem' : 0 }}>
      <div
        style={{
          borderLeft: '3px solid var(--line)',
          paddingLeft: '0.875rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          marginBottom: '0.375rem',
          transition: 'border-color var(--duration-fast) var(--ease)',
        }}
        className={cfg.cssClass}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span className={BADGE_CLASS[node.kind] ?? 'pg-badge pg-badge-neutral'} style={{ marginTop: '1px', flexShrink: 0 }}>
            {cfg.icon} {cfg.label}
          </span>
          {typeof node.confidence === 'number' && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: '0.2rem' }}>
              confidence {Math.round(node.confidence * 100)}%
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginTop: '0.25rem', lineHeight: 1.55 }}>
          {node.explanation}
        </p>

        {hasRefs && expanded && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.375rem' }}>
            {node.qlooRefs?.map((r) => (
              <span key={r} style={{
                fontSize: '0.6875rem',
                background: 'var(--qloo-bg)',
                color: 'var(--qloo)',
                border: '1px solid rgba(181,129,74,0.2)',
                borderRadius: '999px',
                padding: '0.1rem 0.5rem',
              }}>
                Qloo: {r}
              </span>
            ))}
            {node.refs?.map((r) => (
              <span key={r} style={{
                fontSize: '0.6875rem',
                background: 'var(--surface)',
                color: 'var(--muted)',
                border: '1px solid var(--line)',
                borderRadius: '999px',
                padding: '0.1rem 0.5rem',
              }}>
                ref: {r.slice(0, 12)}…
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReasoningChain({
  nodes,
  maxInitial = 6,
}: {
  nodes: ProvenanceNode[];
  maxInitial?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  if (!nodes?.length) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
        No reasoning chain recorded yet.
      </p>
    );
  }

  const visible = showAll ? nodes : nodes.slice(0, maxInitial);
  const hidden  = nodes.length - maxInitial;

  return (
    <div>
      {visible.map((node) => (
        <ChainNode key={node.id} node={node} depth={node.parentId ? 1 : 0} />
      ))}
      {!showAll && hidden > 0 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--accent)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.375rem 0',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
          }}
        >
          Show {hidden} more chain nodes
        </button>
      )}
    </div>
  );
}
