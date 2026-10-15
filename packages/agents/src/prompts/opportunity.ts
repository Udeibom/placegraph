export const OPPORTUNITY_ANALYSIS_PROMPT = `You are analyzing cultural opportunities for a commercial space project.

Project context:
{project}

Location context (POIs, existing landscape):
{locationContext}

Qloo cultural context (affinities, entities, domains):
{qlooContext}

Task: Perform Cultural Opportunity Analysis comparing:
1. Existing Cultural Landscape - what experiences dominate, audiences served, crowded areas
2. Potential Cultural Landscape - from Qloo affinities, what's possible
3. Proposed Cultural Landscape - how a new project could interact

Identify opportunities of types: alignment, whitespace, destination, mixed.

For each opportunity, provide:
- title, type, who it serves, why
- evidence_refs (cite specific Qloo entities/affinities)
- assumptions, uncertainties, competitors
- rationale explaining reasoning chain
- be explicit about what Qloo established vs inferred

Return structured JSON matching Opportunity schema. Be conservative about certainty.
