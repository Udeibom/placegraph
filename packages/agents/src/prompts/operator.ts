export const OPERATOR_OUTPUT_PROMPT = `You are generating a programming model for an operator of an existing facility.
Your output tells this operator what experiences and tenants to introduce, what mix to aim for, and what to reconsider.
This replaces architectural design as the terminal output for operator types.

Project: {project}
Selected strategy: {strategy}
Cultural/Qloo context (treat scores as cultural relationships, not demand signals): {qlooContext}
Audience relationships: {audienceAnalysis}
Location context (nearby businesses, POIs): {locationContext}
Hard operational constraints: {hardConstraints}

CRITICAL LANGUAGE RULES:
1. NEVER use "demand" for a Qloo affinity. Use "cultural affinity signal", "scored connection", or "cultural relationship."
2. Every programming recommendation must trace to a specific Qloo affinity entity + score, or a local POI observation.
3. Tenant and activation recommendations must reference what the evidence suggests is desired but absent.
4. Be explicit about what the evidence cannot establish — if footfall or behavioural data is missing, say so.
5. Do not invent tenant names that are not in the POI evidence.

Your task: Produce a programming model output that tells this operator:

1. PROGRAMMING MODEL: What is the overall experience model? What combination of experience types should this facility offer? (State the evidence basis and what remains inference)

2. EXPERIENCE MIX: Which experience types (food, events, creative, fitness, retail, service, cultural programming, community) should be primary / secondary / supplementary? For each, provide specific Qloo or local evidence. Proportion labels: primary (central to the facility's identity), secondary (important but not defining), supplementary (occasional, supporting).

3. ACTIVATIONS: Which specific activation types or programming events does the evidence support? For each: what it is, why the evidence supports it, who it serves, how frequently, and what space it needs.

4. TENANT RATIONALE: Which types of tenants or resident partners (not named businesses — types) would the cultural evidence support? For each: tenant type, why the evidence supports it, and which specific affinities or local gaps it addresses.

5. WHAT TO STOP: What elements currently in many facilities of this type does the evidence suggest would not fit this community? Be specific about why.

Return JSON:
{
  "programmingModel": "one paragraph describing the overall model and its evidence basis",
  "experienceMix": [
    {
      "type": "food|events|creative|fitness|retail|service|cultural|community|other",
      "rationale": "why this fits the evidence",
      "proportion": "primary|secondary|supplementary",
      "evidence": ["specific Qloo entity (score) or local POI observation"]
    }
  ],
  "activations": [
    {
      "activity": "type of activation",
      "rationale": "why the evidence supports this",
      "audience": "which audience segment it serves",
      "frequency": "daily|weekly|monthly|seasonal|one-off",
      "spaceRequired": "approximate spatial requirement if relevant",
      "evidence": ["specific evidence reference"]
    }
  ],
  "tenantRationale": [
    {
      "tenantType": "type of tenant/partner",
      "why": "why this fits the cultural evidence and audience",
      "evidence": ["specific Qloo or local evidence"]
    }
  ],
  "evidenceSummary": "one paragraph summarising what was established vs. inferred vs. assumed",
  "whatToStop": ["specific things that generic facilities include that this evidence suggests would not fit here"]
}
`;
