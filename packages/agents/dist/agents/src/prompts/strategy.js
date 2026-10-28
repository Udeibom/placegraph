export const STRATEGY_GENERATION_PROMPT = `You are generating and EVALUATING possible experience concepts for a physical place. This is a capital decision: decide what kind of place should be built, for whom, and why - before committing significant capital.

Project: {project}
Opportunities: {opportunities}
Landscapes: {landscapes}
Audience relationships: {audienceAnalysis}
Cultural/Qloo context: {qlooContext}
Hard operational constraints: {hardConstraints}

Generate 2-4 genuinely different EXPERIENCE CONCEPTS. Do not just generate ideas - EVALUATE them using Qloo-derived cultural signals.

For each concept, you MUST explain:
- conceptType: a specific type of experience concept (e.g., "listening bar", "day-to-night communal house", "maker workshop + retail")
- fitForAudience: why this concept fits the target audience, with specifics
- culturalRelationships: list the specific Qloo cultural relationships (entities/affinities with scores if available) that support this concept
- opportunityCaptured: what cultural opportunity this captures that others might miss
- whyWeakerThanAlternatives: be explicit about why other concepts might be stronger/weaker; for THIS concept explain its relative weaknesses or constraints
- qlooEvidenceSummary: a concrete summary of Qloo cultural intelligence that makes this concept viable - must reference specific scored affinities
- qlooEstablished: specific Qloo entities or affinity relationships that directly support this strategy (must name actual entities with scores where possible)
- qlooChangedDecision: explain what insight from Qloo changes the investment decision for this concept (or "This recommendation changed because of Qloo: ...")
- evaluationScore: 1-10 rating based on cultural fit with Qloo evidence

Direction types (choose the best fit):
- "Local Cultural Alignment": concept rooted in and continuous with existing local cultural fabric
- "Cultural Whitespace": concept fills a gap that is culturally demanded by Qloo evidence but physically absent
- "Destination Experience": concept draws visitors from beyond immediate area based on cultural pull

Each concept must include:
- direction: one of the types above
- title: a specific, non-generic name for this experience concept
- whoServes: specific primary audience(s) from the brief
- why: why this concept is viable at this location right now given Qloo signals
- experienceThesis: the unique feeling / value proposition of this experience
- physicalExperience: what the space would feel like to inhabit
- differentiation: what makes this concept distinct from the alternatives
- risks: honest list of what could go wrong
- competitors: who or what this concept would compete with
- evidenceRefs: references to Qloo entities or local evidence
- assumptions: what must be true
- uncertainties: what is genuinely unknown
- locallyEstablished: local geographic or market observations
- inferred: what you inferred without direct evidence

CRITICAL - Make Qloo the reason this product exists:
- Every concept must show concrete Qloo cultural intelligence behind it
- qlooEstablished MUST name specific scored affinity entities/relationships with affinity scores where available from the Qloo context
- If a concept relies heavily on Qloo to differentiate from conventional analysis, say so explicitly in qlooChangedDecision
- A concept that could be recommended by generic business analysis without Qloo is not acceptable as your lead recommendation - show what Qloo revealed

Cultural pattern interpretation:
- The Qloo context includes culturalPatterns and culturalThesis. Treat the mix of patterns as primary cultural signal.
- A cross-programmatic affinity mix must produce a hybrid spatial proposition if supported by Qloo evidence.
- For every concept, name which cultural patterns it uses and which it deliberately ignores.
- Do not default to generic café/study/hub language unless Qloo evidence actually supports it.
- Operational constraints override pattern implications.

Rules:
- qlooEstablished must name specific scored affinity entities or affinity scores — never write vague phrases like "Qloo data shows cultural interest"
- Qloo entity search matches are not affinity evidence and must not be presented as support.
- If Qloo evidence does not support a concept, say so explicitly in uncertainties and explain why it's weaker
- Do not repeat the same core concept with different names
- Make the EVIDENCE-BASED CONCEPT RECOMMENDATION clear - explain why your top pick is best given Qloo signals vs alternatives

Return JSON: { "strategies": [ ... ] }
`;
