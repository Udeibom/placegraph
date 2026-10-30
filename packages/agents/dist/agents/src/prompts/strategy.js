export const STRATEGY_GENERATION_PROMPT = `Analysis mode: {mode}

If mode is DISCOVER:
- Do not assume a business type. Generate only the evidence-qualified investment directions that represent genuinely different commercial formats, not versions of the same format.
- Each direction should name a specific type of commercial experience, not a generic category. Not "food and beverage" but "neighbourhood wine and ferment bar." Not "retail" but "maker-goods and tools shop."
- The title must be 3–5 words, evocative, specific enough to put above a door.

If mode is EVALUATE:
- The project brief specifies a business type. Generate only the evidence-qualified cultural expressions of that business type, differentiated by Qloo evidence.

You are generating and EVALUATING possible experience concepts for a physical place. This is a capital decision: decide what kind of place should be built, for whom, and why - before committing significant capital.

Project: {project}
Opportunities: {opportunities}
Landscapes: {landscapes}
Audience relationships: {audienceAnalysis}
Cultural/Qloo context: {qlooContext}
Traceable cultural relationships: {relationships}
Hard operational constraints: {hardConstraints}

CRITICAL LANGUAGE RULES — violating these will invalidate the analysis:

1. NEVER use the word "demand" to describe a Qloo affinity. Affinities are cultural relationships, not demand signals. Use "affinity", "cultural relationship", or "scored connection" instead.
2. NEVER say "Qloo shows demand for X" or "Qloo's analysis indicates X". Qloo provides scored entity relationships. PlaceGraph interprets them.
3. NEVER attribute a specific business design decision (colour palette, décor style, music policy) directly to an affinity with a brand or landmark. A Wowcher affinity does not mean the space should look like Wowcher. A Westminster Abbey affinity does not mean ceremony rooms. Explain the cultural signal and then reason from it to a spatial implication.
4. NEVER treat the absence of an online-only brand or national landmark from a neighbourhood as a "whitespace opportunity". Wowcher not having a shop in Peckham is not a cultural gap.
5. When you reference a Qloo entity, always include its affinity score and always note it is a cultural relationship: "Hackney Event Space (0.972) — a scored cultural relationship, not a demand signal."

Generate only the genuinely different EXPERIENCE CONCEPTS that the evidence supports. Do not pad to a fixed count. Do not just generate ideas - EVALUATE them using Qloo-derived cultural signals.

For each concept, you MUST explain:
- conceptType: a specific type of experience concept (e.g., "listening bar", "day-to-night communal house", "maker workshop + retail")
- fitForAudience: why this concept fits the target audience, with specifics
- culturalRelationships: list the specific Qloo cultural relationships (entities/affinities with scores if available) that support this concept
- opportunityCaptured: what cultural opportunity this captures that others might miss
- whyWeakerThanAlternatives: be explicit about why other concepts might be stronger/weaker; for THIS concept explain its relative weaknesses or constraints
- qlooEvidenceSummary: a concrete summary of the Qloo cultural relationships that support this concept, and where that support stops
- qlooEstablished: specific Qloo entities or affinity relationships that directly support this strategy (must name actual entities with scores where possible)

Direction types (choose the best fit):
- "Local Cultural Alignment": concept rooted in and continuous with existing local cultural fabric
- "Cultural Whitespace": concept is supported by Qloo evidence but not visibly expressed in available local supply
- "Destination Experience": concept draws visitors from beyond immediate area based on cultural pull

Each concept must include:
- direction: one of the types above
- title: 3–5 words maximum. Evocative, not descriptive. The kind of working name a real hospitality operator or investor would use — something you could put above a door or say in a pitch. Examples: “Quiet Arch”, “The Copper Still”, “Corner House”, “Rye Lane Social”, “The Yard”. Never describe what the concept does in the name. Never start with “The Design-Forward” or “The Culturally-”. Never use adjective + noun + noun chains.
- whoServes: specific primary audience(s) from the brief
- why: why this concept is viable at this location right now given Qloo signals
- experienceThesis: the unique feeling / value proposition of this experience
- physicalExperience: what the space would feel like to inhabit
- differentiation: what makes this concept distinct from the alternatives
- risks: honest list of what could go wrong
- competitors: who or what this concept would compete with
- evidenceRefs: references to Qloo entities or local evidence
- opportunityId: the opportunity this concept captures, when one exists
- assumptions: what must be true
- uncertainties: what is genuinely unknown
- locallyEstablished: local geographic or market observations
- inferred: what you inferred without direct evidence

CRITICAL - Show the evidence contribution without forcing differentiation:
- Every concept must show which concrete Qloo relationships support it, or state plainly that Qloo did not support it
- qlooEstablished MUST name specific scored affinity entities/relationships with affinity scores where available from the Qloo context
- The same direction as conventional analysis can still be valid when Qloo improves confidence or specificity
- Never claim that Qloo changed the recommendation. That requires a controlled counterfactual, which this prompt does not provide
- If Qloo evidence is thin, contradictory, or absent, put that in uncertainties and explain what evidence would change the view

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
