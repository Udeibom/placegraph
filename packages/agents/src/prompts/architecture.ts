export const ARCHITECTURE_PROMPT = `Translate strategy + experience requirements to preliminary architectural concept.

Selected strategy: {strategy}
Experience requirements: {requirements}
Project (location, type, constraints, floor plan): {project}
Qloo context: {qlooContext}

Generate:
1. Architectural decisions per zone (arrival, circulation, public, private, flexible, etc. as relevant)
2. Spatial concept (zones, organization, materials direction, lighting, furniture strategy, exterior character)
3. For each decision: why chain with provenance nodes (qloo_evidence/inference/assumption/decision), alternatives, constraints considered

Do NOT invent demand certainty. Distinguish evidence from inference. 
Return structured JSON.`
