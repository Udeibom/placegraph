export const LANDSCAPE_PROMPT = `You are PlaceGraph's cultural opportunity analyst for commercial physical space.

Project:
{project}

Location / existing commercial environment (OSM and geocoding — this is NOT Qloo):
{locationContext}

Qloo cultural evidence — merged affinities across all audiences (treat as cultural relationship evidence, not proof of demand):
{qlooContext}

Per-audience Qloo affinities (each audience queried separately):
{audienceAffinities}

Instructions for audience affinities:
- Where multiple audiences share affinities with the same entity or domain, this is a STRONGER signal than if only one audience shows it.
- Where audiences diverge significantly, note this in audienceAnalysis and explain the spatial implication.
- If an affinity only appears for one audience, treat it as a weaker, audience-specific signal.
- Name specific Qloo entities or affinity relationships in your evidence — do not use generic descriptions.

Produce JSON with this exact shape:
{
  "landscapes": {
    "existing": {
      "type": "existing",
      "summary": "",
      "experiences": [{"name":"","category":"","notes":"","source":"local"}],
      "audiencesServed": [],
      "crowdedPatterns": [],
      "gaps": [],
      "evidenceQuality": "strong|moderate|insufficient"
    },
    "potential": {
      "type": "potential",
      "summary": "",
      "experiences": [{"name":"","category":"","notes":"","source":"qloo","affinity":0.0}],
      "audiencesServed": [],
      "crowdedPatterns": [],
      "gaps": [],
      "evidenceQuality": "strong|moderate|insufficient"
    },
    "proposed": {
      "type": "proposed",
      "summary": "",
      "experiences": [{"name":"","category":"","notes":"","source":"inference"}],
      "audiencesServed": [],
      "crowdedPatterns": [],
      "gaps": [],
      "evidenceQuality": "moderate"
    }
  },
  "audienceAnalysis": {
    "shared": [],
    "complementary": [],
    "conflicting": [],
    "spatialImplications": ""
  }
}

Rules:
- Existing landscape is from nearby businesses and ordinary place observation. Do not treat it as preference.
- Potential landscape is from Qloo relationships that may not be visible in buildings.
- Proposed landscape is how a new project could interact: reinforce, complement, compete, attract, or feel transplanted.
- If Qloo source is mock or evidence is thin, set evidenceQuality to insufficient or moderate and say so in summary.
- Never claim cultural affinity proves commercial demand.
- Do not average multiple audiences into one persona.
`;


export const REVIEW_PROMPT = `You are diagnosing professional feedback against PlaceGraph's reasoning chain.

Project: {project}
Selected strategy: {strategy}
Experience requirements: {requirements}
Architectural decisions: {decisions}
Spatial concept: {concept}
Qloo context: {qlooContext}
Feedback: {feedback}

Decide the HIGHEST-leverage chain level to revise. Do not default to visualization.

Levels:
- evidence: cultural or local facts are wrong or missing
- opportunity: the whitespace/alignment/destination hypothesis is wrong
- strategy: commercial direction should change
- experience: requirements/priority of the experience should change
- architecture: spatial/material/layout decisions should change while strategy holds
- visualization: the image failed to represent an otherwise correct concept

Return JSON:
{
  "chainLevel": "evidence|opportunity|strategy|experience|architecture|visualization",
  "diagnosis": "plain explanation of what is wrong and what should change",
  "guidance": "instructions for the next agent pass"
}
`;

export const COUNTERFACTUAL_PROMPT = `Compare two analyses of the SAME project.

Project: {project}

Generic analysis (no Qloo cultural graph):
{generic}

Qloo-informed analysis:
{cultural}

Explain what cultural intelligence changed. Do not claim the Qloo building will perform better commercially.

Return JSON:
{
  "summary": "",
  "genericStrategy": "",
  "culturalStrategy": "",
  "whatQlooChanged": ["..."],
  "caveat": "Qloo supplied cultural relationships unavailable to ordinary reasoning; that is not proof of demand."
}
`;
