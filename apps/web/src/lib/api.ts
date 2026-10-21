import type { AnalysisSnapshot, Project } from '@placegraph/types';

export type ProjectBundle = { project: Project; analysis: AnalysisSnapshot | null };

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export async function listProjects(): Promise<Project[]> {
  const data = await parse<{ projects: Project[] }>(await fetch('/api/projects'));
  return data.projects;
}

export async function createProject(body: Partial<Project>): Promise<Project> {
  return parse<Project>(
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  );
}

export async function loadProject(id: string): Promise<ProjectBundle> {
  return parse<ProjectBundle>(await fetch(`/api/projects/${id}`));
}

export async function runAnalyze(id: string): Promise<ProjectBundle> {
  return parse<ProjectBundle>(await fetch(`/api/projects/${id}/analyze`, { method: 'POST' }));
}

export async function selectStrategy(id: string, strategyId: string): Promise<ProjectBundle> {
  return parse<ProjectBundle>(
    await fetch(`/api/projects/${id}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategyId })
    })
  );
}

export async function runDesign(id: string): Promise<ProjectBundle> {
  return parse<ProjectBundle>(await fetch(`/api/projects/${id}/design`, { method: 'POST' }));
}

export async function runVisualize(id: string): Promise<ProjectBundle> {
  return parse<ProjectBundle>(await fetch(`/api/projects/${id}/visualize`, { method: 'POST' }));
}

export async function runReview(id: string, feedback: string): Promise<ProjectBundle> {
  return parse<ProjectBundle>(
    await fetch(`/api/projects/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback })
    })
  );
}

export async function runCounterfactual(id: string): Promise<ProjectBundle> {
  return parse<ProjectBundle>(await fetch(`/api/projects/${id}/counterfactual`, { method: 'POST' }));
}
