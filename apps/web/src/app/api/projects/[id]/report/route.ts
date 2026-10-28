import { NextRequest, NextResponse } from 'next/server';
import { getReadyStore } from '@placegraph/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store    = await getReadyStore();
  const project  = await store.getProject(id);
  const analysis = await store.getAnalysis(id);

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const report = {
    meta: {
      generatedAt:     new Date().toISOString(),
      projectId:       project.id,
      projectName:     project.name,
      projectType:     project.projectType,
      location:        project.location,
    },
    project,
    analysis: analysis
      ? {
          intelligenceMode: analysis.intelligenceMode,
          evidenceGate:     analysis.evidenceGate,
          qlooSummary: {
            source:          analysis.qlooContext?.source,
            insufficient:    analysis.qlooContext?.insufficient,
            entityCount:     analysis.qlooContext?.entities?.length ?? 0,
            affinityCount:   analysis.qlooContext?.affinities?.length ?? 0,
            culturalThesis:  analysis.qlooContext?.culturalThesis,
            culturalPatterns: analysis.qlooContext?.culturalPatterns,
            affinities:      analysis.qlooContext?.affinities?.slice(0, 20),
            notes:           analysis.qlooContext?.notes,
          },
          locationSummary: {
            query:           analysis.locationContext?.query,
            displayName:     analysis.locationContext?.displayName,
            evidenceQuality: analysis.locationContext?.evidenceQuality,
            poisCount:       analysis.locationContext?.pois?.length ?? 0,
          },
          landscapes:       analysis.landscapes,
          audienceAnalysis: analysis.audienceAnalysis,
          opportunities:    analysis.opportunities,
          selectedStrategy: analysis.strategies.find((s) => s.id === analysis.selectedStrategyId),
          strategies:       analysis.strategies,
          requirements:     analysis.requirements,
          decisions:        analysis.decisions,
          concept:          analysis.concept,
          visualization:    analysis.visualizations?.length
            ? { prompt: analysis.visualizations[0].prompt, imageCount: analysis.visualizations[0].images?.length ?? 0 }
            : null,
          floorPlan:        analysis.floorPlan
            ? { source: analysis.floorPlan.source, summary: analysis.floorPlan.summary, rooms: analysis.floorPlan.rooms }
            : null,
          provenance:       analysis.provenance,
          reviews:          analysis.reviews,
          counterfactual:   analysis.counterfactual,
        }
      : null,
  };

  return NextResponse.json(report, {
    headers: { 'Content-Disposition': `attachment; filename="placegraph-${project.id}.json"` },
  });
}
