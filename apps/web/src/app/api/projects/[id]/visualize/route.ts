import { NextResponse } from 'next/server';
import { getReadyStore } from '@placegraph/db';
import { AgentOrchestrator } from '@placegraph/agents';
import { nowIso } from '@placegraph/core';
import { ndjsonResponse } from '@/lib/ndjson';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = await getReadyStore();
  const project = await store.getProject(id);
  const analysis = await store.getAnalysis(id);
  if (!project || !analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return ndjsonResponse(async (emit) => {
    const orchestrator = new AgentOrchestrator();
    const visualized = await orchestrator.visualize(project, analysis, (stage, message) =>
      emit({ type: 'progress', stage, message })
    );
    await store.saveAnalysis(visualized);
    const saved = await store.saveProject({ ...project, status: 'complete', updatedAt: nowIso() });
    emit({ type: 'result', bundle: { project: saved, analysis: visualized } });
  });
}
