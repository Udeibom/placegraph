import { NextRequest, NextResponse } from 'next/server';
import { VisualizationService } from '@placegraph/agents';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vis = new VisualizationService();
    const result = await vis.generateVisualization({
      project: body.project,
      strategy: body.strategy,
      decisions: body.decisions || [],
      concept: body.concept || {},
      requirements: body.requirements || []
    });
    return NextResponse.json({
      prompt: result.prompt,
      images: result.images,
      model: result.model,
      provenance: result.prov.all()
    });
  } catch {
    return NextResponse.json({ error: 'Visualization generation failed' }, { status: 400 });
  }
}
