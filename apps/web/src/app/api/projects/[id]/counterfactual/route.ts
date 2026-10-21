import { NextResponse } from 'next/server';
import { getReadyStore } from '@placegraph/db';
import { AgentOrchestrator } from '@placegraph/agents';
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
    emit({ type: 'progress', stage: 'culture', message: 'Running generic vs Qloo-informed comparison…' });
    const orchestrator = new AgentOrchestrator();
    const next = await orchestrator.counterfactual(project, analysis);
    await store.saveAnalysis(next);
    emit({ type: 'result', bundle: { project, analysis: next } });
  });
}
