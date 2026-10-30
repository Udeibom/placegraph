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
    // Build a specific building description. businessType is more precise than
    // projectType. Extract structural keywords (arch, warehouse, vault, etc.)
    // from businessType and objective so renders reflect the actual building.
    const buildingDesc = deriveBuildingDescription(input.project);
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
    // Extract a structural anchor from the building description or constraints.
    // A distinctive physical structure (arch, vault, warehouse) grounds all three
    // renders in the same spatial context and improves render-to-render coherence.
    const structuralAnchor = deriveStructuralAnchor(input.project);
    const common = [
        `Building: ${buildingDesc}${location ? ` in ${location}` : ''}.`,
        structuralAnchor ? `Structure: ${structuralAnchor}.` : '',
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
// ─── Structural anchor ───────────────────────────────────────────────────
// Extracts a specific structural description to anchor render coherence.
// A distinctive structure (railway arch, Victorian warehouse, barrel vault)
// is the single most effective coherence signal for image generation models.
function deriveStructuralAnchor(project) {
    const corpus = [
        project.businessType,
        project.objective,
        ...(project.constraints ?? []).map((c) => `${c.key} ${c.value}`)
    ]
        .filter(Boolean)
        .join(' ');
    if (/railway\s+arch|rail\s+arch/i.test(corpus)) {
        return 'single-span Victorian railway arch, brick barrel vault ceiling approximately 5m high, arch span approximately 8m wide, exposed brick walls throughout';
    }
    if (/warehouse/i.test(corpus)) {
        return 'converted industrial warehouse, exposed steel trusses, high ceilings approximately 6\u20138m, large factory windows';
    }
    if (/vault/i.test(corpus)) {
        return 'vaulted basement or cellar, low curved ceiling, exposed masonry walls';
    }
    if (/mews/i.test(corpus)) {
        return 'converted mews building, low pitched roof, cobblestone frontage, modest two-storey scale';
    }
    if (/listed|heritage/i.test(corpus)) {
        return 'listed heritage building, period detailing, original facade materials retained';
    }
    // Fall back to floor area as a coherence anchor
    const area = project.floorArea;
    if (area)
        return `approximately ${area} ground-floor commercial unit`;
    return '';
}
// ─── Building description ─────────────────────────────────────────────────
// Extract the most specific description of the physical structure from the
// project brief. businessType is preferred over projectType because it
// contains user-supplied specifics ("independent wine bar in a railway arch").
// We also scan objective and constraints for structural keywords.
const STRUCTURAL_KEYWORDS = [
    { pattern: /railway\s+arch|rail\s+arch/i, label: 'railway arch unit' },
    { pattern: /warehouse/i, label: 'warehouse' },
    { pattern: /railway\s+arch|arched\s+unit/i, label: 'railway arch' },
    { pattern: /arch\s+unit|brick\s+arch/i, label: 'brick arch unit' },
    { pattern: /arch\b/i, label: 'arch unit' },
    { pattern: /vault/i, label: 'vaulted space' },
    { pattern: /mews/i, label: 'mews building' },
    { pattern: /shopfront|shop\s+front/i, label: 'shopfront' },
    { pattern: /ground\s+floor|retail\s+unit/i, label: 'ground-floor unit' },
    { pattern: /listed\s+building|heritage\s+build/i, label: 'listed building' },
    { pattern: /converted\s+\w+/i, label: 'converted space' },
    { pattern: /industrial/i, label: 'industrial unit' },
];
function deriveBuildingDescription(project) {
    const corpus = [
        project.businessType,
        project.objective,
        ...(project.constraints ?? []).map((c) => `${c.key} ${c.value}`)
    ]
        .filter(Boolean)
        .join(' ');
    // Try to find a structural keyword in the corpus
    for (const { pattern, label } of STRUCTURAL_KEYWORDS) {
        if (pattern.test(corpus)) {
            // Also prepend the businessType if it adds specificity
            const bt = clean(project.businessType);
            if (bt && bt.toLowerCase() !== project.projectType) {
                return `${bt} (${label})`;
            }
            return `${project.projectType} (${label})`;
        }
    }
    // No structural keyword found — use businessType if it's more specific
    const bt = clean(project.businessType);
    if (bt && bt.toLowerCase() !== project.projectType)
        return bt;
    return project.projectType;
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
