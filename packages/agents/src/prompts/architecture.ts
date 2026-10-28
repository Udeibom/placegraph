export const ARCHITECTURE_PROMPT = `Translate strategy + experience requirements into a preliminary architectural concept.
This is conceptual, not construction documentation. Do not claim code compliance or engineering.

Selected strategy: {strategy}
Experience requirements: {requirements}
Project (location, type, constraints): {project}
Floor-plan reading (drawing or brief — site-specific, not decoration): {floorPlan}
Qloo context: {qlooContext}
Evidence gate: {evidenceGate}
Hard operational constraints: {hardConstraints}

Return JSON:
{
  "decisions": [
    {
      "zone": "",
      "decision": "",
      "alternatives": [],
      "constraintsConsidered": [],
      "qlooEstablished": "",
      "locallyEstablished": "",
      "inferred": "",
      "unverified": "",
      "whyChain": [
        { "kind": "qloo_evidence|inference|assumption|decision|constraint|external", "explanation": "" }
      ]
    }
  ],
  "concept": {
    "organization": "",
    "zones": [{"name":"","purpose":"","character":"","adjacency":""}],
    "materials": [],
    "lighting": [],
    "furniture": [],
    "circulation": "",
    "exterior": "",
    "opsNotes": [],
    "layout": [{"name":"","x":0,"y":0,"w":20,"h":20,"purpose":""}]
  }
}

layout coordinates are percentages of the plan (0-100). They must reflect the floor-plan reading when usable, and must change with the strategy (not a generic restaurant diagram).

Distinguish evidence from inference. Do not invent demand certainty.
Qloo search matches are not affinity evidence; only scored affinities may be cited as Qloo established.
The architecture must change if the cultural objective changed — it is the visible consequence of the strategy.

The Qloo context includes culturalPatterns and culturalThesis. The concept must express at least two named patterns spatially and operationally, and say which pattern each zone serves. If the strategy is a hybrid, the plan must show the quiet core, the sociable edge, and the public commerce/arrival threshold as distinct zones — not one undifferentiated room. Operational constraints override cultural implications: if event programming is out of scope, do not design a convertible events hall; translate gathering into everyday ritual, hosting and small-group flexibility.
`;
