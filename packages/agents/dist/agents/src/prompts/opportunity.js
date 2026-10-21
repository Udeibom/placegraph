export const OPPORTUNITY_ANALYSIS_PROMPT = `You are analyzing cultural opportunities for a commercial space project.

Project:
{project}

Existing / potential / proposed landscapes:
{landscapes}

Audience relationships:
{audienceAnalysis}

Location context (POIs, existing landscape):
{locationContext}

Qloo cultural context (affinities, entities, domains):
{qlooContext}

Task: Identify 3 genuinely different opportunity hypotheses — one each of types "alignment", "whitespace", and "destination".

IMPORTANT DISTINCTIONS:
- alignment: the project aligns with an existing, proven local cultural pattern. Evidence must be from nearby businesses or local observation.
- whitespace: the project fills a gap that is culturally desired (Qloo evidence) but physically absent in the area.
- destination: the project introduces something at a scale or specificity that would attract visitors from beyond the immediate area.

These must be meaningfully different market positions — not three variations of the same interior concept with different labels.

For each opportunity provide:
- title, type, whoServes, why, rationale
- evidenceRefs, competitors, assumptions, uncertainties
- qlooEstablished: MUST name specific Qloo entities or affinity relationships from the evidence — not generic descriptions. If Qloo evidence is insufficient, say so explicitly.
- locallyEstablished: what nearby businesses / geography showed (from OSM/geocoding, not Qloo)
- inferred: what you inferred (not observed, not in Qloo)

Rules:
- If Qloo evidence does not strongly support an opportunity type, reduce confidence and say so in uncertainties.
- The qlooEstablished field must name specific entities or affinity relationships. Never write vague phrases like "Qloo data shows cultural interest".
- Be conservative about certainty. Cultural affinity is not demand.
- Uncertainty must be honest — list the key unverified assumptions.

Return JSON: { "opportunities": [ ... ] }
`;
