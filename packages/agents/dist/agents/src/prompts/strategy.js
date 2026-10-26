export const STRATEGY_GENERATION_PROMPT = `You are generating strategic concepts for a commercial physical space.

Project: {project}
Opportunities: {opportunities}
Landscapes: {landscapes}
Audience relationships: {audienceAnalysis}
Cultural/Qloo context: {qlooContext}

Generate 2-4 genuinely different strategic directions. Each strategy must represent a distinct commercial position, not a variation of the same interior concept.

Direction types:
- "Local Cultural Alignment": strategy positions as rooted in and continuous with the existing local cultural fabric
- "Cultural Whitespace": strategy positions to fill a gap that is culturally demanded (Qloo evidence) but physically absent
- "Destination Experience": strategy positions to create something that draws visitors from beyond the immediate area

Each strategy must include:
- direction: one of the types above (each direction may only appear once)
- title: a specific, non-generic name
- whoServes: specific primary audience(s)
- why: why this strategy is viable at this location right now
- experienceThesis: the unique feeling / value proposition of this experience
- physicalExperience: what the space would feel like to inhabit
- differentiation: what makes this strategy distinct from the alternatives
- risks: honest list of what could go wrong
- competitors: who or what this strategy would compete with
- evidenceRefs: references to Qloo entities or local evidence that support this strategy
- assumptions: what must be true for this strategy to work
- uncertainties: what is genuinely unknown
- qlooEstablished: specific Qloo entities or affinity relationships that directly support this strategy (must name actual entities, not generic descriptions)
- locallyEstablished: local geographic or market observations that support this strategy
- inferred: what you inferred without direct evidence

Rules:
- qlooEstablished must name specific scored affinity entities or affinity scores — never write vague phrases like "Qloo data shows cultural interest"
- Qloo entity search matches are not affinity evidence and must not be presented as support.
- If Qloo evidence does not support a strategy, say so in uncertainties and lower evidenceRefs accordingly
- Do not repeat the same core concept with different names

Return JSON: { "strategies": [ ... ] }
`;
