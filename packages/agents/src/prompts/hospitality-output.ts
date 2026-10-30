export const HOSPITALITY_OUTPUT_PROMPT = `You are formalising a hospitality concept — turning the selected strategy and spatial decisions into a precise operating identity.
This runs AFTER architecture and experience requirements for hospitality operator types, capturing what those steps implied but did not make explicit.

Project: {project}
Selected strategy: {strategy}
Experience requirements: {requirements}
Spatial concept: {concept}
Cultural/Qloo context: {qlooContext}
Audience relationships: {audienceAnalysis}
Hard operational constraints: {hardConstraints}

CRITICAL LANGUAGE RULES:
1. NEVER use "demand" for a Qloo affinity. Use "cultural relationship" or "scored affinity."
2. Every F&B direction must connect to specific Qloo affinities, audience evidence, or local food culture observation — not generic trend.
3. Atmosphere notes must be anchored to the Qloo cultural pattern mix, not generic mood board language ("warm", "industrial", "cosy").
4. Programming model must reference only what the cultural evidence actually supports — do not invent a community programme that has no evidence basis.
5. The concept identity name/positioning must explain why THIS name and positioning fits THIS place and THESE people specifically, not generically.

Your task: Produce a hospitality concept output with:

1. CONCEPT IDENTITY: A one-sentence positioning statement. Why does this name/identity fit this specific location, audience and cultural evidence? Trace the reasoning. (Not "a welcoming neighbourhood destination" — be specific.)

2. F&B STRATEGY: Cuisine direction — which food and drink formats does the evidence support? Include:
   - The cultural signals (Qloo affinities, local food culture) that inform the direction
   - Daypart programming: how does the offer change from morning to night?
   - Supplier philosophy: what does the audience evidence suggest about provenance, scale, community?
   - What the F&B should NOT be (based on what the evidence does not support)

3. PROGRAMMING MODEL: What community events, residencies, or cultural programming does the evidence support? Only include what has a cultural basis. If the constraints rule out event programming, say so and explain how the hospitality model translates gathering into everyday ritual instead.

4. ATMOSPHERE NOTES: Sonic identity (music genre and energy level based on Qloo patterns), material palette direction (anchored to cultural signals, not generic aesthetics), sensory character (time-of-day variation), and the one thing that must not be generic about this space given the evidence.

Return JSON:
{
  "conceptIdentity": "the positioning statement and name rationale, evidence-anchored",
  "fbStrategy": "cuisine direction, supplier philosophy, and what to avoid — all evidence-traced",
  "daypartStrategy": "how offer and atmosphere change from opening through late evening",
  "programmingModel": "what cultural programming the evidence supports, or why everyday ritual is the substitute",
  "atmosphereNotes": "sonic identity, material direction, sensory character — all evidence-anchored to Qloo patterns",
  "evidenceSummary": "what was established by Qloo evidence vs inferred vs assumed"
}
`;
