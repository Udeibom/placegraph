export const EXPERIENCE_REQ_PROMPT = `Convert selected strategy to explicit experience requirements.

Strategy: {strategy}
Project: {project}
Cultural context: {qlooContext}

For each requirement:
- clear, actionable requirement
- rationale (why needed)
- priority (low/medium/high)
- source (evidence or inference)

Show chain: cultural evidence -> opportunity -> strategy -> experience req.
Preserve provenance.`
