import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@placegraph/agents';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orchestrator = new AgentOrchestrator();
    const result = await orchestrator.generateStrategies({
      project: body.project,
      opportunities: body.opportunities || [],
      useMock: body.useMock
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Strategy generation failed' }, { status: 400 });
  }
}
