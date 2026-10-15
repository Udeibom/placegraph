import type { Project } from '@placegraph/types';

export async function discoverOpportunities(project: Project) {
  const res = await fetch('/api/analysis/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, useMock: true })
  });
  if (!res.ok) throw new Error('Failed to analyze');
  return res.json();
}

export async function generateStrategies(project: Project, opportunities: any[]) {
  const res = await fetch('/api/analysis/strategies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, opportunities, useMock: true })
  });
  if (!res.ok) throw new Error('Failed to generate strategies');
  return res.json();
}

export async function generateArchitecture(project: Project, strategy: any, requirements?: any[]) {
  const res = await fetch('/api/analysis/architecture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, strategy, requirements, useMock: true })
  });
  if (!res.ok) throw new Error('Failed to generate architecture');
  return res.json();
}
