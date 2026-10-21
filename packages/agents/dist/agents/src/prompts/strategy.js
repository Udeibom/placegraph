export const STRATEGY_GENERATION_PROMPT = `You are generating strategic concepts for a commercial physical space.

Project: {project}
Opportunities: {opportunities}
Landscapes: {landscapes}
Audience relationships: {audienceAnalysis}
Cultural/Qloo context: {qlooContext}

Generate 2-4 genuinely different strategic directions. Each must:
- have a distinct thesis (not just different adjectives)
- explain whoServes, why, experienceThesis, physicalExperience
- identify differentiation, risks, competitors
- cite evidenceRefs
- list assumptions and uncertainties
- connect back to an opportunity type (alignment / whitespace / destination)

Follow: Qloo informs what is worth designing; strategy determines the experience.

Return JSON: { "strategies": [ ... ] }
`;
