export const EXPERIENCE_REQ_PROMPT = `Convert selected strategy to explicit experience requirements.

Strategy: {strategy}
Project: {project}
Audience relationships: {audienceAnalysis}
Floor-plan reading: {floorPlan}
Cultural/Qloo context: {qlooContext}
Evidence gate: {evidenceGate}

Generate concrete, actionable experience requirements. For each:
- requirement (what the experience must do)
- rationale (link to strategy / opportunity / evidence)
- priority (low|medium|high)
- source (evidence|inference|constraint|operation)
- zone when relevant

Cover arrival/identity, spatial needs, flexibility, operations, atmosphere, audience fit, and conflicting-audience separation if needed.
Preserve the chain: cultural evidence → hypothesis → strategy → requirement.

Return JSON: { "requirements": [ ... ] }
`;
