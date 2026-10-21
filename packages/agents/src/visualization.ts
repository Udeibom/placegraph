import type { Project } from '@placegraph/types';
import { ProvenanceBuilder, parseJsonFromLlm, replaceVars } from '@placegraph/core';
import { VISUALIZATION_PROMPT } from './prompts/visualization';
import { createHFImageProvider } from './providers/images/hf';
import { renderConceptSvg } from './providers/images/concept-svg';
import { LLMProvider, createLLMProvider } from './providers/llm';

export interface VisualizationInput {
  project: Project;
  strategy: any;
  decisions: any[];
  concept: any;
  requirements: any[];
  useMock?: boolean;
  style?: string;
}

interface ViewPrompt {
  label: string;
  prompt: string;
  negativePrompt: string;
}

export class VisualizationService {
  private llm: LLMProvider;

  constructor(llm?: LLMProvider) {
    this.llm = llm || createLLMProvider();
  }

  async generateVisualization(input: VisualizationInput) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Visualization derived from the reasoning chain, not from raw Qloo tags', {
      parentId: null
    });
    prov.setRoot(root.id);

    const promptTemplate = replaceVars(VISUALIZATION_PROMPT, {
      project:      input.project,
      strategy:     input.strategy,
      decisions:    input.decisions,
      concept:      input.concept?.organization ?? JSON.stringify(input.concept ?? {}),
      requirements: input.requirements
    });

    // ── 1. Ask the LLM to produce three view prompts ──────────
    let views: ViewPrompt[] = [];
    let firstPrompt = '';

    if (this.llm.available) {
      try {
        const resp = await this.llm.complete(
          [
            { role: 'system', content: 'You are an architectural visualization expert. Return valid JSON only, no markdown.' },
            { role: 'user', content: promptTemplate }
          ],
          { json: true, maxTokens: 1600 }
        );
        const parsed = parseJsonFromLlm<{ views?: ViewPrompt[] }>(resp.content, {});
        views = Array.isArray(parsed?.views) ? parsed.views : [];
      } catch {
        views = [];
      }
    }

    // Fallback: build a single view from strategy + concept
    if (!views.length) {
      const stratTitle   = input.strategy?.title ?? input.project.name;
      const organization = input.concept?.organization ?? `${input.project.projectType} in ${input.project.location.city}`;
      const materials    = (input.concept?.materials ?? []).slice(0, 3).join(', ') || 'natural materials';
      views = [
        {
          label: 'Primary interior',
          prompt: `Interior architectural photography, ${stratTitle}, ${organization}, ${materials}, natural lighting, photorealistic, 24mm wide angle, empty space`,
          negativePrompt: 'blurry, generic, stock photo, neon, plastic, oversaturated, cartoon, crowds',
        },
      ];
    }

    firstPrompt = views[0]?.prompt ?? '';

    prov.create('inference', `Derived ${views.length} visualization prompt(s) from strategy, requirements and decisions`, {
      parentId: root.id,
      metadata: { viewCount: views.length }
    });

    // ── 2. SVG concept diagram — always included ──────────────
    const diagram = renderConceptSvg({
      projectName: input.project.name,
      strategy:    input.strategy,
      concept:     input.concept
    });

    // ── 3. Generate images per view (or SVG only if no HF_TOKEN) ─
    let images: string[] = [];
    let model  = 'concept-diagram';

    if (process.env.HF_TOKEN) {
      const hf = createHFImageProvider();
      const results = await Promise.allSettled(
        views.map((v) => hf.generate({ prompt: v.prompt, negativePrompt: v.negativePrompt, width: 1024, height: 768 }))
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value.images?.length) {
          images.push(...r.value.images);
          model = r.value.model;
        }
      }
      // SVG always appended at the end
      images.push(diagram);
    } else {
      // No HF_TOKEN — SVG only. No mock images (misleading).
      images = [diagram];
      model  = 'concept-diagram';
    }

    prov.create('inference', `Generated visualization via ${model} — ${images.length} image(s)`, {
      parentId: root.id,
      metadata: { count: images.length, model, hfEnabled: !!process.env.HF_TOKEN }
    });

    return { prov, prompt: firstPrompt, images, model, views };
  }
}
