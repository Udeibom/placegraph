import { NextResponse } from 'next/server';
import { getStore } from '@placegraph/db';
import { AgentOrchestrator } from '@placegraph/agents';
import { nowIso } from '@placegraph/core';
import { ndjsonResponse } from '@/lib/ndjson';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = getStore();
  const project = store.getProject(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  store.saveProject({ ...project, status: 'analyzing', updatedAt: nowIso() });

  return ndjsonResponse(async (emit) => {
    const orchestrator = new AgentOrchestrator();
    const forAgent = { ...project, floorPlanUrl: store.floorPlanDataUrl(project) || project.floorPlanUrl };
    const analysis = await orchestrator.analyze({ project: forAgent }, (stage, message) => {
      emit({ type: 'progress', stage, message });
    });
    store.saveAnalysis(analysis);
    const saved = store.saveProject({ ...project, status: 'strategizing', updatedAt: nowIso() });
    emit({ type: 'result', bundle: { project: saved, analysis } });
  });
}
