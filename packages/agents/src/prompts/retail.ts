export const RETAIL_OUTPUT_PROMPT = `You are generating a retail strategy output for a brand evaluating a physical location.
Your output tells this brand how to position, what to sell, what format to use, and how to belong to this community.
This replaces architectural design as the terminal output for retail operator types.

Project: {project}
Selected strategy: {strategy}
Cultural/Qloo context (treat scores as cultural relationships, not demand signals): {qlooContext}
Audience relationships: {audienceAnalysis}
Location context (nearby businesses, POIs): {locationContext}
Hard operational constraints: {hardConstraints}

CRITICAL LANGUAGE RULES:
1. NEVER use "demand" for a Qloo affinity. Use "cultural relationship", "scored affinity", or "cultural connection."
2. Every category recommendation must name a specific Qloo affinity entity + score, or a specific local POI.
3. Format recommendations must come from audience evidence — not generic retail advice.
4. Community positioning must reference what actually exists locally and what is absent.
5. Do not invent collaborators, brands, or local businesses that are not in the evidence.

Your task: Produce a retail strategy output that addresses:

1. POSITIONING: How should this brand position itself in this specific community? (Anchored to what the Qloo evidence and local landscape actually show, not a generic positioning statement)

2. CATEGORY MIX: Which product categories align with the cultural evidence? For each category, explain why using specific Qloo affinities or local observation. Rate confidence: strong (direct Qloo evidence), moderate (inference from patterns), weak (assumption only).

3. FORMAT RECOMMENDATION: Which store format fits this location and audience?
   Options: conventional shop, showroom/appointment, community-led store, hybrid (specify), market stall, pop-up first.
   The recommendation must be justified by audience evidence, not trend.

4. COMMUNITY FIT: How does the brand sit relative to existing retail culture? What already exists? What gap does this fill?

5. LOCAL COLLABORATIONS: Which types of local businesses, makers, or cultural institutions could make this brand credible here? (Only name types — do not invent specific names unless they appear in the POI evidence)

6. GAPS: What cultural interests or community needs does the evidence suggest are underserved commercially in this location?

Return JSON:
{
  "positioning": "...",
  "categoryMix": [
    {
      "category": "...",
      "alignment": "why this category fits the cultural evidence",
      "evidence": ["specific Qloo entity (score) or local POI name"],
      "confidence": "strong|moderate|weak"
    }
  ],
  "formatRecommendation": "...",
  "communityFit": "...",
  "localCollaborations": ["type of local partner and why"],
  "evidenceSummary": "one paragraph summarising what the evidence established vs what was inferred",
  "gaps": ["what is culturally present but commercially absent here"]
}
`;

export const RETAIL_REVIEW_PROMPT = `You are revising a retail strategy output based on professional feedback.

Project: {project}
Current retail output: {retailOutput}
Selected strategy: {strategy}
Qloo context: {qlooContext}
Feedback: {feedback}

Apply the feedback while preserving the evidence discipline rules:
- Every retained recommendation must still trace to specific Qloo or local evidence.
- If the feedback requests a category that has no evidence, note this explicitly.
- If the feedback challenges the format recommendation, revise only if evidence supports the change.

Return the full revised retail output in the same JSON shape.
`;
