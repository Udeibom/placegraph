export const STRATEGY_GENERATION_PROMPT = `You are generating strategic concepts for a commercial physical space.

Project: {project}
Opportunities: {opportunities}
Cultural/Qloo context: {qlooContext}

Generate 2-4 genuinely different strategic directions. Each must:
- have distinct thesis (not just different adjectives)
- explain who serves, why, experience thesis
- identify differentiation, risks, competitors
- cite evidence
- list assumptions/uncertainties
- connect back to opportunity rationale

Follow principle: Qloo informs what's worth designing; strategy determines what experience.

Return structured JSON array of Strategy objects.`
