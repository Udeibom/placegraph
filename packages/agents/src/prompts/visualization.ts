export const VISUALIZATION_PROMPT = `Generate an architectural visualization prompt from the following reasoning.

Do NOT just list tags. Derive a coherent prompt that reflects the strategy and decisions.

Selected Strategy:
{strategy}

Architectural Decisions:
{decisions}

Spatial Concept:
{concept}

Experience Requirements:
{requirements}

Project Context:
{project}

Rules:
- Reflect the cultural reasoning chain (why this exists, for whom)
- Emphasize spatial qualities, materials direction, lighting, circulation, atmosphere
- Avoid overloading with aesthetic buzzwords disconnected from strategy
- Keep photorealistic architectural visualization style
- Include key zones and experience
- Be specific but not prescriptive of exact furniture brands

Return the prompt text.`
