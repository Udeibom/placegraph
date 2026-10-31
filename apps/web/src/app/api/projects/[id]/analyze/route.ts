import { NextResponse } from 'next/server';
import { getReadyStore } from '@placegraph/db';
import { AgentOrchestrator } from '@placegraph/agents';
import { nowIso } from '@placegraph/core';
import { ndjsonResponse } from '@/lib/ndjson';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = await getReadyStore();
  const project = await store.getProject(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await store.saveProject({ ...project, status: 'analyzing', updatedAt: nowIso() });

  return ndjsonResponse(async (emit) => {
    const orchestrator = new AgentOrchestrator();
    const forAgent = { ...project, floorPlanUrl: store.floorPlanDataUrl(project) || project.floorPlanUrl };
    const analysis = await orchestrator.analyze({ project: forAgent }, (stage, message) => {
      emit({ type: 'progress', stage, message });
    });
    await store.saveAnalysis(analysis);
    const saved = await store.saveProject({ ...project, status: 'strategizing', updatedAt: nowIso() });
    emit({ type: 'result', bundle: { project: saved, analysis } });
  });
}
