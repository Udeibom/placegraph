export const VISUALIZATION_PROMPT = `You are producing precise architectural photography prompts for AI image generation.

Project: {project}

Selected strategy: {strategy}

Architectural decisions:
{decisions}

Spatial concept organization: {concept}

Experience requirements: {requirements}

Generate THREE distinct visualization prompts that derive directly from the architectural decisions above — NOT from generic descriptions of the space type.

Each prompt must:
- Reference specific materials, spatial qualities, or features named in the decisions
- Use correct architectural photography language (camera angle, lens quality, lighting quality, time of day)
- Identify a specific spatial zone and mood
- Include a negative prompt to suppress common AI artifacts

Return JSON only, no surrounding text:
{
  "views": [
    {
      "label": "Exterior arrival",
      "prompt": "Architectural photography of [specific facade description derived from decisions], [specific materials], [lighting quality — e.g. overcast northern light], [time of day], [lens — e.g. 35mm], high detail, photorealistic",
      "negativePrompt": "blurry, generic, stock photo, neon, plastic, oversaturated, cartoon, people blocking facade, logo signs"
    },
    {
      "label": "Primary interior",
      "prompt": "Interior architectural photography, [specific primary zone from concept], [specific materials from decisions], [lighting quality], [spatial character], empty space, no people, photorealistic, 24mm wide angle",
      "negativePrompt": "cluttered, plastic, generic restaurant, chain, oversaturated, cartoon, illustration, crowds"
    },
    {
      "label": "Material detail",
      "prompt": "Architectural detail photograph, [specific material junction or surface from decisions], natural lighting, macro detail, 85mm, shallow depth of field, photorealistic",
      "negativePrompt": "blurry background only, stock photo, generic, oversaturated, cartoon"
    }
  ]
}
`;
