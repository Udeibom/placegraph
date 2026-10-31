import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@placegraph/agents';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orchestrator = new AgentOrchestrator();
    const result = await orchestrator.discoverOpportunities({
      project: body.project,
      useMock: body.useMock
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 400 });
  }
}
