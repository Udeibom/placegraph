import { NextRequest, NextResponse } from 'next/server';
import { VisualizationService } from '@placegraph/agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vis = new VisualizationService(undefined, { useMock: true });
    const result = await vis.generateVisualization({
      project: body.project,
      strategy: body.strategy,
      decisions: body.decisions || [],
      concept: body.concept || {},
      requirements: body.requirements || [],
      useMock: true
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Visualization generation failed' }, { status: 400 });
  }
}
