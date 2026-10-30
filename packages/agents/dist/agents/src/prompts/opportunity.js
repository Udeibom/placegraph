export const OPPORTUNITY_ANALYSIS_PROMPT = `Analysis mode: {mode}

{operatorContext}

IMPORTANT — this affects how you identify opportunities:

If mode is EVALUATE:
- The project brief already specifies a business type. Your job is to assess whether that concept fits this location and audience, identify what cultural evidence supports or undermines it, and identify what adjacent opportunities the cultural evidence suggests.

If mode is DISCOVER:
- There is no proposed concept. Your job is to look at the cultural evidence, the local commercial environment, and the audience profile, and discover what types of commercial experience could genuinely serve this audience in this place. Do not default to the most obvious category. Look for what the cultural evidence reveals that is not already well-served nearby.
- Generate three genuinely different opportunity types. They should be different in nature, not just variations of the same category.
- For each opportunity, explicitly state: what cultural evidence supports it, which audience segment it primarily serves, why it fits this specific location, and what is currently absent that makes it viable.

You are analyzing cultural opportunities for a commercial space project.

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
Hard operational constraints: {hardConstraints}

CRITICAL LANGUAGE RULES — violating these will invalidate the analysis:

1. NEVER use the word "demand" to describe a Qloo affinity. Affinities are cultural relationships, not demand signals. Use "affinity", "cultural relationship", or "scored connection" instead.
2. NEVER say "Qloo shows demand for X" or "Qloo's analysis indicates X". Qloo provides scored entity relationships. PlaceGraph interprets them.
3. NEVER attribute a specific business design decision (colour palette, décor style, music policy) directly to an affinity with a brand or landmark. A Wowcher affinity does not mean the space should look like Wowcher. A Westminster Abbey affinity does not mean ceremony rooms. Explain the cultural signal and then reason from it to a spatial implication.
4. NEVER treat the absence of an online-only brand or national landmark from a neighbourhood as a "whitespace opportunity". Wowcher not having a shop in Peckham is not a cultural gap.
5. When you reference a Qloo entity, always include its affinity score and always note it is a cultural relationship: "Hackney Event Space (0.972) — a scored cultural relationship, not a demand signal."

Task: Identify 3 genuinely different opportunity hypotheses — one each of types "alignment", "whitespace", and "destination".

IMPORTANT DISTINCTIONS:
- alignment: the project aligns with an existing, proven local cultural pattern. Evidence must be from nearby businesses or local observation.
- whitespace: the project fills a gap that is culturally desired (Qloo evidence) but physically absent in the area.
- destination: the project introduces something at a scale or specificity that would attract visitors from beyond the immediate area.

When identifying commercial gaps, only assert that a category is "absent" if the POI data explicitly contains zero results for that category AND the POI notes do not warn about incomplete data. If the POI query coverage is uncertain, describe the gap as "not evidenced in available data" rather than "absent".

These must be meaningfully different market positions — not three variations of the same interior concept with different labels.

For each opportunity provide:
- title, type, whoServes, why, rationale
- evidenceRefs, competitors, assumptions, uncertainties
- qlooEstablished: MUST name specific Qloo entities or affinity relationships from the evidence — not generic descriptions. If Qloo evidence is insufficient, say so explicitly.
- locallyEstablished: what nearby businesses / geography showed (from OSM/geocoding, not Qloo)
- inferred: what you inferred (not observed, not in Qloo)

Cultural pattern interpretation:
- The Qloo context includes culturalPatterns and culturalThesis, derived by grouping scored place affinities by genre. Use the pattern mix as the cultural signal; do not treat the list of place names as a checklist.
- At least one opportunity must synthesize two or more patterns into a hybrid position. If the mix is cross-programmatic, a single-use opportunity is a weak hypothesis.
- Name the specific patterns each opportunity uses and the spatial consequence of combining them.

Rules:
- Qloo entity search matches are NOT affinity evidence. Do not put a search-only match in qlooEstablished.
- If Qloo evidence does not strongly support an opportunity type, reduce confidence and say so in uncertainties.
- The qlooEstablished field must name specific scored affinity entities or affinity relationships. Never write vague phrases like "Qloo data shows cultural interest".
- Be conservative about certainty. Cultural affinity is not demand.
- Uncertainty must be honest — list the key unverified assumptions.

Return JSON: { "opportunities": [ ... ] }
`;
