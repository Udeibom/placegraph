import type {
  ArchitecturalDecision,
  ExperienceRequirement,
  Opportunity,
  Project,
  SpatialConcept,
  Strategy
} from '@placegraph/types';
import { projectAllowsEventProgramming } from './cultural-patterns';

const FORBIDDEN_EVENTLESS =
  /\b(events? halls?|event spaces?|multipurpose (rooms?|halls?)|event mode|(small|modest|low|raised|central|performance) stage|ceremony (rooms?|nooks?|spaces?)|prayer (rooms?|spaces?)|worship (rooms?|spaces?)|altars?|nightclubs?|convertible (social\/)?ceremony|(?:micro[-\u2010-\u2015]?)?performances?|raised platform|platform for)\b/i;

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bconvertible social\/ceremony edge\b/gi, 'sociable everyday edge'],
  [/\bconvertible ceremony (edge|space|room)\b/gi, 'sociable everyday edge'],
  [/\bevents? halls\b/gi, 'flexible everyday rooms'],
  [/\bevents? hall\b/gi, 'flexible everyday room'],
  [/\bevent spaces?\b/gi, 'flexible everyday space'],
  [/\bmultipurpose (rooms?|halls?)\b/gi, 'flexible everyday room'],
  [/\bevent mode\b/gi, 'everyday mode'],
  [/\bceremony (rooms?|nooks?|spaces?)\b/gi, 'quiet gathering corner'],
  [/\bceremonial spaces?\b/gi, 'quiet reflective corners'],
  [/\bprayer (rooms?|spaces?)\b/gi, 'quiet reflection corner'],
  [/\bworship (rooms?|spaces?)\b/gi, 'quiet reflection corner'],
  [/\baltar[-\u2010-\u2015]like\b/gi, 'quiet focal'],
  [/\braised platform\b/gi, 'gathering corner'],
  [/\bplatform for\b/gi, 'gathering corner for'],
  [/\b(small|modest|low|raised|central|performance) stage\b/gi, '$1 gathering corner'],
  [/\b(?:micro[-\u2010-\u2015]?)?performances?\b/gi, 'small-group gatherings'],
  [/\(\s*max \d+[-\u2010-\u2015 ]person audience\s*\)/gi, ''],
  [/\b(?:max )?\d+[-\u2010-\u2015 ]person audience\b/gi, 'small group'],
  [/\b(?:weekly )?cultural rites?\b/gi, 'everyday rituals'],
  [/\brites?\b/gi, 'everyday rituals'],
  [/\b(?:small )?blessings?\b/gi, 'quiet reflection'],
  [/\baltars?\b/gi, 'focal point'],
  [/\bnightclubs?\b/gi, 'social lounge'],
  [/\bceremonies\b/gi, 'everyday rituals'],
  [/\bceremony\b/gi, 'everyday ritual'],
  [/\bceremonial\b/gi, 'everyday'],
  [/\bprayers\b/gi, 'quiet reflection'],
  [/\bprayer\b/gi, 'quiet reflection'],
  [/\bworship\b/gi, 'contemplation']
];

const THESIS_REPLACEMENTS = REPLACEMENTS.filter(
  ([pattern]) =>
    !['\\bceremonies\\b', '\\bceremony\\b', '\\bceremonial\\b', '\\bprayers\\b', '\\bprayer\\b', '\\bworship\\b'].includes(
      pattern.source
    )
);

export function constraintPrompt(project: Project): string {
  const lines = (project.constraints || []).map((constraint) => `- ${constraint.key}: ${constraint.value}`);
  if (!projectAllowsEventProgramming(project)) {
    lines.push(
      '- HARD: Event programming is out of scope. Do not propose an events hall, stage, ceremony room, prayer room, multipurpose event room, altar, nightclub, or convertible event space. Translate gathering and ceremony into everyday ritual, hosting and small-group flexibility only.'
    );
  }
  return lines.length ? lines.join('\n') : '- None recorded.';
}

function protect(value: string, phrases: string[]): { text: string; restore: (input: string) => string } {
  const found: string[] = [];
  let next = value;
  for (const phrase of [...phrases].filter(Boolean).sort((a, b) => b.length - a.length)) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    next = next.replace(new RegExp(escaped, 'gi'), `\u0000${found.length}\u0000`);
    found.push(phrase);
  }
  next = next.replace(
    /\b(?:not|without|no)\s+(?:an?\s+)?(?:programmed\s+)?events?\s+halls?\b/gi,
    (match) => {
      const token = `\u0000${found.length}\u0000`;
      found.push(match);
      return token;
    }
  );
  return {
    text: next,
    restore: (input: string) =>
      found.reduce((acc, phrase, index) => acc.split(`\u0000${index}\u0000`).join(phrase), input)
  };
}

function cleanup(value: string): string {
  return value.replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

function sanitizeText(
  value: string | undefined,
  fallback = 'Flexible everyday use',
  labels: string[] = []
): string {
  if (!value) return fallback;
  const protectedValue = protect(value, labels);
  let next = protectedValue.text;
  for (const [pattern, replacement] of REPLACEMENTS) next = next.replace(pattern, replacement);
  next = cleanup(next);
  return FORBIDDEN_EVENTLESS.test(next) ? fallback : protectedValue.restore(next);
}

function sanitizeThesisText(
  value: string | undefined,
  fallback: string,
  labels: string[] = []
): string {
  if (!value) return fallback;
  const protectedValue = protect(value, labels);
  let next = protectedValue.text;
  for (const [pattern, replacement] of THESIS_REPLACEMENTS) next = next.replace(pattern, replacement);
  next = cleanup(next);
  return FORBIDDEN_EVENTLESS.test(next) ? fallback : protectedValue.restore(next);
}

function optionalText(value: string | undefined, labels: string[] = []): string | undefined {
  return value ? sanitizeText(value, 'Flexible everyday use', labels) : value;
}

function safePhysicalExperience(project: Project): string {
  return `A calm everyday core for ${
    project.projectType === 'cafe' ? 'study and coffee' : 'daily use'
  }, a sociable hospitality edge for conversation and hosting, and a public threshold for local makers and passers-by. Flexible furniture supports small groups and quiet everyday rituals without a programmed events hall.`;
}

function safeThesis(project: Project, strategy: Strategy): string {
  return `A culturally rooted ${project.projectType} for ${strategy.whoServes} that combines everyday study, coffee, conversation and small-group hosting without programmed events.`;
}

export function sanitizeOpportunityConstraints(
  opportunities: Opportunity[],
  project: Project,
  labels: string[] = []
): Opportunity[] {
  if (projectAllowsEventProgramming(project)) return opportunities;
  return opportunities.map((opportunity) => ({
    ...opportunity,
    title: sanitizeText(opportunity.title, opportunity.title, labels),
    whoServes: sanitizeText(opportunity.whoServes, opportunity.whoServes, labels),
    why: sanitizeThesisText(opportunity.why, opportunity.why, labels),
    rationale: sanitizeThesisText(opportunity.rationale, opportunity.rationale, labels),
    competitors: opportunity.competitors.map((item) => sanitizeThesisText(item, item, labels)),
    assumptions: opportunity.assumptions.map((item) => sanitizeThesisText(item, item, labels)),
    uncertainties: opportunity.uncertainties.map((item) => sanitizeThesisText(item, item, labels))
  }));
}

export function sanitizeStrategyConstraints(
  strategy: Strategy,
  project: Project,
  labels: string[] = []
): Strategy {
  if (projectAllowsEventProgramming(project)) return strategy;
  return {
    ...strategy,
    title: sanitizeText(strategy.title, strategy.title, labels),
    whoServes: sanitizeText(strategy.whoServes, strategy.whoServes, labels),
    why: sanitizeThesisText(strategy.why, strategy.why, labels),
    experienceThesis: sanitizeThesisText(
      strategy.experienceThesis,
      safeThesis(project, strategy),
      labels
    ),
    physicalExperience: strategy.physicalExperience
      ? sanitizeText(strategy.physicalExperience, safePhysicalExperience(project), labels)
      : safePhysicalExperience(project),
    differentiation: sanitizeThesisText(strategy.differentiation, strategy.differentiation, labels),
    competitors: strategy.competitors.map((item) => sanitizeThesisText(item, item, labels)),
    risks: strategy.risks.map((item) => sanitizeThesisText(item, item, labels)),
    assumptions: strategy.assumptions.map((item) => sanitizeThesisText(item, item, labels)),
    uncertainties: strategy.uncertainties.map((item) => sanitizeThesisText(item, item, labels))
  };
}

export function sanitizeRequirementConstraints(
  requirements: ExperienceRequirement[],
  project: Project,
  labels: string[] = []
): ExperienceRequirement[] {
  if (projectAllowsEventProgramming(project)) return requirements;
  return requirements.map((requirement) => ({
    ...requirement,
    requirement: sanitizeText(requirement.requirement, requirement.requirement, labels),
    rationale: sanitizeText(requirement.rationale, requirement.rationale, labels),
    zone: optionalText(requirement.zone, labels)
  }));
}

export function sanitizeConceptConstraints(
  concept: SpatialConcept,
  project: Project,
  labels: string[] = []
): SpatialConcept {
  if (projectAllowsEventProgramming(project)) return concept;
  return {
    ...concept,
    organization: sanitizeText(
      concept.organization,
      'Everyday public sequence with a quiet core and sociable edge',
      labels
    ),
    zones: concept.zones.map((zone) => ({
      ...zone,
      name: sanitizeText(zone.name, 'Flexible everyday room', labels),
      purpose: sanitizeText(zone.purpose, 'Flexible everyday use', labels),
      character: optionalText(zone.character, labels),
      adjacency: optionalText(zone.adjacency, labels)
    })),
    materials: concept.materials.map((item) => sanitizeText(item, item, labels)),
    lighting: concept.lighting.map((item) =>
      sanitizeText(item, 'Layered adjustable everyday lighting', labels)
    ),
    furniture: concept.furniture.map((item) =>
      sanitizeText(item, 'Flexible seating that feels complete in everyday use', labels)
    ),
    circulation: optionalText(concept.circulation, labels),
    exterior: optionalText(concept.exterior, labels),
    opsNotes: concept.opsNotes.map((item) => sanitizeText(item, item, labels)),
    layout: concept.layout?.map((room) => ({
      ...room,
      name: sanitizeText(room.name, 'Flexible everyday room', labels),
      purpose: sanitizeText(room.purpose, 'Flexible everyday use', labels)
    }))
  };
}

export function sanitizeDecisionConstraints(
  decisions: ArchitecturalDecision[],
  project: Project,
  labels: string[] = []
): ArchitecturalDecision[] {
  if (projectAllowsEventProgramming(project)) return decisions;
  return decisions.map((decision) => ({
    ...decision,
    zone: sanitizeText(decision.zone, decision.zone, labels),
    decision: sanitizeText(decision.decision, decision.decision, labels),
    alternatives: decision.alternatives.map((item) => sanitizeText(item, item, labels)),
    whyChain: decision.whyChain.map((node) => ({
      ...node,
      explanation: sanitizeText(node.explanation, node.explanation, labels)
    })),
    inferred: optionalText(decision.inferred, labels),
    unverified: optionalText(decision.unverified, labels)
  }));
}
