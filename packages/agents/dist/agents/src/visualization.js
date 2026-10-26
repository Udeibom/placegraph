import { ProvenanceBuilder, parseJsonFromLlm, replaceVars } from '@placegraph/core';
import { VISUALIZATION_PROMPT } from './prompts/visualization';
import { renderConceptSvg } from './providers/images/concept-svg';
import { generateRender } from './providers/images/render';
import { createLLMProvider } from './providers/llm';
export class VisualizationService {
    llm;
    constructor(llm) {
        this.llm = llm || createLLMProvider();
    }
    async generateVisualization(input) {
        const prov = new ProvenanceBuilder();
        const root = prov.create('inference', 'Visualization derived from the reasoning chain, not from raw Qloo tags', {
            parentId: null
        });
        prov.setRoot(root.id);
        const promptTemplate = replaceVars(VISUALIZATION_PROMPT, {
            project: input.project,
            strategy: input.strategy,
            decisions: input.decisions,
            concept: input.concept?.organization ?? JSON.stringify(input.concept ?? {}),
            requirements: input.requirements
        });
        // ── 1. Ask the LLM to produce three view prompts ──────────
        let views = [];
        let firstPrompt = '';
        if (this.llm.available) {
            try {
                const resp = await this.llm.complete([
                    { role: 'system', content: 'You are an architectural visualization expert. Return valid JSON only, no markdown.' },
                    { role: 'user', content: promptTemplate }
                ], { json: true, maxTokens: 1600 });
                const parsed = parseJsonFromLlm(resp.content, {});
                views = Array.isArray(parsed?.views) ? parsed.views : [];
            }
            catch {
                views = [];
            }
        }
        // Fallback: build a single view from strategy + concept
        if (!views.length) {
            const stratTitle = input.strategy?.title ?? input.project.name;
            const organization = input.concept?.organization ?? `${input.project.projectType} in ${input.project.location.city}`;
            const materials = (input.concept?.materials ?? []).slice(0, 3).join(', ') || 'natural materials';
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
        // ── 2. Photoreal concept renders ──────────────────────────
        const renderResults = await Promise.all(views.slice(0, 3).map((view, i) => generateRender({
            prompt: view.prompt,
            negativePrompt: view.negativePrompt,
            width: 1024,
            height: 1024,
            seed: 4100 + i
        })));
        const renders = renderResults.filter((r) => Boolean(r));
        const renderModels = unique(renders.map((r) => r.model));
        // ── 3. Spatial concept plan — a legible fallback and evidence view ──
        const diagram = renderConceptSvg({
            projectName: input.project.name,
            strategy: input.strategy,
            concept: input.concept
        });
        const images = [...renders.map((r) => r.dataUrl), diagram];
        const model = renderModels.length
            ? `${renderModels.join('+')}+concept-plan`
            : 'concept-plan';
        prov.create('inference', `Generated ${renders.length} concept render(s) via ${renderModels.join(', ') || 'SVG fallback'} plus spatial plan`, {
            parentId: root.id,
            metadata: { renderCount: renders.length, imageCount: images.length, model }
        });
        return { prov, prompt: firstPrompt, images, model, views };
    }
}
function unique(items) {
    return [...new Set(items.filter(Boolean))];
}
