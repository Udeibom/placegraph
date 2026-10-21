import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@placegraph/db';
import { AgentOrchestrator } from '@placegraph/agents';
import { nowIso } from '@placegraph/core';
import { ndjsonResponse } from '@/lib/ndjson';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { feedback } = await req.json();
  if (!feedback) return NextResponse.json({ error: 'Feedback required' }, { status: 400 });

  const store = getStore();
  const project = store.getProject(id);
  const analysis = store.getAnalysis(id);
  if (!project || !analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return ndjsonResponse(async (emit) => {
    const orchestrator = new AgentOrchestrator();
    const next = await orchestrator.review(project, analysis, feedback, (stage, message) =>
      emit({ type: 'progress', stage, message })
    );
    store.saveAnalysis(next);
    const saved = store.saveProject({ ...project, status: 'review', updatedAt: nowIso() });
    emit({ type: 'result', bundle: { project: saved, analysis: next } });
  });
}
