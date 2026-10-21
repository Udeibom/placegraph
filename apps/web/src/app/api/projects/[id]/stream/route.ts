import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@placegraph/db';
import { AgentOrchestrator } from '@placegraph/agents';
import { nowIso } from '@placegraph/core';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 180;

type Action = 'analyze' | 'design' | 'visualize' | 'review' | 'counterfactual';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const action = (body.action as Action) ?? 'analyze';

  const store = getStore();
  const project = store.getProject(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      }

      function onProgress(stage: string, message: string) {
        send({ type: 'progress', stage, message, at: new Date().toISOString() });
      }

      try {
        const orchestrator = new AgentOrchestrator();
        const forAgent = {
          ...project,
          floorPlanUrl: store.floorPlanDataUrl(project) || project.floorPlanUrl,
        };

        let analysis = store.getAnalysis(id);
        let savedProject = project;

        if (action === 'analyze') {
          store.saveProject({ ...project, status: 'analyzing', updatedAt: nowIso() });
          analysis = await orchestrator.analyze({ project: forAgent, guidance: body.guidance }, onProgress);
          store.saveAnalysis(analysis);
          savedProject = store.saveProject({ ...project, status: 'strategizing', updatedAt: nowIso() });

        } else if (action === 'design') {
          if (!analysis) throw new Error('No analysis to design from');
          const strategyId: string | undefined = body.strategyId ?? analysis.selectedStrategyId;
          if (strategyId) {
            // Persist strategy selection first
            const updated = { ...analysis, selectedStrategyId: strategyId };
            store.saveAnalysis(updated);
            analysis = updated;
          }
          analysis = await orchestrator.design(project, analysis, strategyId, body.guidance, onProgress);
          store.saveAnalysis(analysis);
          savedProject = store.saveProject({ ...project, status: 'designing', updatedAt: nowIso() });

        } else if (action === 'visualize') {
          if (!analysis) throw new Error('No analysis to visualize from');
          analysis = await orchestrator.visualize(project, analysis, onProgress);
          store.saveAnalysis(analysis);
          savedProject = store.saveProject({ ...project, status: 'complete', updatedAt: nowIso() });

        } else if (action === 'review') {
          if (!analysis) throw new Error('No analysis to review');
          if (!body.feedback) throw new Error('Feedback required');
          analysis = await orchestrator.review(project, analysis, String(body.feedback), onProgress);
          store.saveAnalysis(analysis);
          savedProject = store.saveProject({ ...project, status: 'review', updatedAt: nowIso() });

        } else if (action === 'counterfactual') {
          if (!analysis) throw new Error('No analysis for counterfactual');
          analysis = await orchestrator.counterfactual(project, analysis);
          store.saveAnalysis(analysis);
          savedProject = project;
        }

        send({ type: 'done', bundle: { project: savedProject, analysis } });
      } catch (err) {
        send({ type: 'error', message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  });
}
