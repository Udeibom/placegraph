export const EXPERIENCE_REQ_PROMPT = `Convert selected strategy to explicit experience requirements.

Strategy: {strategy}
Project: {project}
Audience relationships: {audienceAnalysis}
Floor-plan reading: {floorPlan}
Cultural/Qloo context: {qlooContext}
Evidence gate: {evidenceGate}
Hard operational constraints: {hardConstraints}

Generate concrete, actionable experience requirements. For each:
- requirement (what the experience must do)
- rationale (link to strategy / opportunity / evidence)
- priority (low|medium|high)
- source (evidence|inference|constraint|operation)
- zone when relevant

Cover arrival/identity, spatial needs, flexibility, operations, atmosphere, audience fit, and conflicting-audience separation if needed.
Preserve the chain: cultural evidence → hypothesis → strategy → requirement.

The Qloo context includes culturalPatterns and culturalThesis. Every requirement must serve a named pattern or a named audience need. Drop generic requirements that could apply to any project. Where patterns conflict (for example quiet study vs ceremony or nightlife), resolve them spatially or operationally rather than averaging them. Operational constraints override cultural implications: if event programming is out of scope, do not add an events hall; translate gathering into everyday ritual and small-group flexibility.

Return JSON: { "requirements": [ ... ] }
`;
