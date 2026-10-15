import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@placegraph/agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orchestrator = new AgentOrchestrator();
    const result = await orchestrator.generateStrategies({
      project: body.project,
      opportunities: body.opportunities || [],
      useMock: true
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Strategy generation failed' }, { status: 400 });
  }
}
