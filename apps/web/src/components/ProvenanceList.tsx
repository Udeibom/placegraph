import type { ProvenanceNode } from '@placegraph/types';

const labels: Record<string, string> = {
  qloo_evidence: 'Qloo established',
  external: 'Other information',
  inference: 'Agent inferred',
  decision: 'Architectural reasoning',
  assumption: 'Unverified assumption',
  constraint: 'Constraint'
};

export function ProvenanceList({ nodes }: { nodes: ProvenanceNode[] }) {
  if (!nodes?.length) return <p className="text-sm text-muted">No provenance recorded yet.</p>;
  return (
    <ul className="space-y-3">
      {nodes.map((n) => (
        <li key={n.id} className="border border-line bg-white/50 p-4">
          <div className="mb-1 text-xs uppercase tracking-wide text-accent">{labels[n.kind] || n.kind}</div>
          <p className="text-sm">{n.explanation}</p>
          {n.qlooRefs?.length ? (
            <p className="mt-2 text-xs text-muted">Qloo refs: {n.qlooRefs.join(', ')}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
