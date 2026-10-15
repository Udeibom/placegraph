export const EXPERIENCE_REQ_PROMPT = `Convert selected strategy to explicit experience requirements.

Strategy: {strategy}
Project: {project}
Cultural/Qloo context: {qlooContext}

Generate concrete, actionable experience requirements. For each:
- requirement (clear statement of what experience must do/achieve)
- rationale (why - link to strategy/opportunity/evidence)
- priority (low|medium|high)
- source (evidence|inference)

Requirements must cover: arrival/identity, spatial needs, flexibility (e.g. events), operations, atmosphere, audience fit.
Preserve traceability. Return JSON array matching ExperienceRequirement schema.`
