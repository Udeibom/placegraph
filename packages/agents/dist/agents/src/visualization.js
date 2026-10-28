import { ProvenanceBuilder } from '@placegraph/core';
import { VISUALIZATION_NEGATIVE_PROMPT, VISUALIZATION_VIEWS } from './prompts/visualization';
import { renderConceptSvg } from './providers/images/concept-svg';
import { generateRender } from './providers/images/render';
export class VisualizationService {
    async generateVisualization(input) {
        const prov = new ProvenanceBuilder();
        const root = prov.create('inference', 'Visualization derived from the selected concept, decisions and spatial brief', {
            parentId: null
        });
        prov.setRoot(root.id);
        const views = buildVisualizationPrompts(input);
        prov.create('inference', `Built ${views.length} coherent concept views from the selected concept`, {
            parentId: root.id,
            metadata: { viewCount: views.length, labels: views.map((view) => view.label) }
        });
        const renderResults = await Promise.all(views.map((view, i) => generateRender({
            prompt: view.prompt,
            negativePrompt: view.negativePrompt,
            width: 1024,
            height: 1024,
            seed: 4100 + i
        })));
        const rendered = renderResults.flatMap((render, i) => render ? [{ render, view: views[i] }] : []);
        const renders = rendered.map((item) => item.render);
        const renderedViews = rendered.map((item) => item.view);
        const renderModels = unique(renders.map((r) => r.model));
        const diagram = renderConceptSvg({
            projectName: input.project.name,
            strategy: input.strategy,
            concept: input.concept
        });
        const images = [...renders.map((r) => r.dataUrl), diagram];
        const model = renderModels.length
            ? `${renderModels.join('+')}+concept-plan`
            : 'concept-plan';
        prov.create('inference', `Generated ${renders.length} coherent concept render(s) via ${renderModels.join(', ') || 'SVG fallback'} plus spatial plan`, {
            parentId: root.id,
            metadata: { renderCount: renders.length, imageCount: images.length, model }
        });
        const prompt = views.map((view) => `${view.label}\n${view.prompt}`).join('\n\n');
        return { prov, prompt, images, model, views: renderedViews };
    }
}
export function buildVisualizationPrompts(input) {
    const concept = input.concept ?? {};
    const conceptName = clean(input.strategy?.title) || input.project.name;
    const location = unique([
        input.project.location?.neighborhood,
        input.project.location?.city
    ]).join(', ');
    const zones = (concept.zones ?? [])
        .map((zone) => clean(zone?.name))
        .filter(Boolean)
        .slice(0, 6)
        .join('; ');
    const materials = (concept.materials ?? [])
        .map(clean)
        .filter(Boolean)
        .slice(0, 5)
        .join(', ');
    const lighting = (concept.lighting ?? [])
        .map(clean)
        .filter(Boolean)
        .slice(0, 2)
        .join('; ');
    const furniture = (concept.furniture ?? [])
        .map(clean)
        .filter(Boolean)
        .slice(0, 3)
        .join(', ');
    const common = [
        `Building: ${input.project.projectType} in ${location || 'the project site'}.`,
        concept.organization ? `Spatial idea: ${clause(concept.organization, 180)}.` : '',
        zones ? `Zones: ${trim(zones, 240)}.` : '',
        materials ? `Materials: ${trim(materials, 160)}.` : ''
    ].filter(Boolean);
    const noText = 'Do not render legible words, signage copy, brand names, logos or watermarks; represent signage only as an abstract carved pattern.';
    return VISUALIZATION_VIEWS.map((view) => {
        const parts = [...common];
        if (view.key === 'cutaway' || view.key === 'exterior') {
            if (concept.exterior)
                parts.push(`Exterior: ${clause(stripSignage(concept.exterior), 180)}.`);
        }
        if (view.key === 'cutaway' || view.key === 'interior') {
            if (lighting)
                parts.push(`Lighting: ${trim(lighting, 160)}.`);
            if (furniture)
                parts.push(`Furniture: ${trim(furniture, 140)}.`);
        }
        parts.push(noText);
        return {
            label: view.label,
            prompt: `${view.composition} ${parts.join(' ')}`,
            negativePrompt: VISUALIZATION_NEGATIVE_PROMPT
        };
    });
}
function clean(value) {
    if (value === undefined || value === null)
        return '';
    return String(value).replace(/\s+/g, ' ').trim();
}
function stripSignage(value) {
    return clean(value).replace(/\b(signage|signs?|lettering|logos?|brand names?|wordmarks?)\b/gi, 'carved pattern');
}
function clause(value, max) {
    return trim(clean(value).replace(/[.。]+$/, ''), max);
}
function trim(value, max) {
    if (value.length <= max)
        return value;
    return `${value.slice(0, max - 1).trimEnd()}…`;
}
function unique(items) {
    return [...new Set(items.map((item) => clean(item)).filter(Boolean))];
}
