import type { Project } from '@placegraph/types';

export async function generateVisualization(
  project: Project,
  strategy: any,
  decisions: any[] = [],
  concept: any = {},
  requirements: any[] = []
) {
  const res = await fetch('/api/analysis/visualize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, strategy, decisions, concept, requirements, useMock: true })
  });
  if (!res.ok) throw new Error('Failed to visualize');
  return res.json();
}
