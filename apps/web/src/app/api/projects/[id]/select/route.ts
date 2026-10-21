import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@placegraph/db';
import { nowIso } from '@placegraph/core';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { strategyId } = await req.json();
  const store = getStore();
  const project = store.getProject(id);
  const analysis = store.getAnalysis(id);
  if (!project || !analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const next = {
    ...analysis,
    selectedStrategyId: strategyId,
    strategies: analysis.strategies.map((s) => ({ ...s, selected: s.id === strategyId })),
    status: 'strategy_selected' as const,
    updatedAt: nowIso()
  };
  store.saveAnalysis(next);
  store.saveProject({ ...project, status: 'designing', updatedAt: nowIso() });
  return NextResponse.json({ project: store.getProject(id), analysis: next });
}
