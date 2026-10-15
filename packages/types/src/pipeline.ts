import { z } from 'zod';
import { ProvenanceNodeSchema } from './provenance';

export const OpportunityTypeSchema = z.enum([
  'alignment',
  'whitespace',
  'destination',
  'mixed'
]);

export const OpportunitySchema = z.object({
  id: z.string(),
  analysisRunId: z.string(),
  type: OpportunityTypeSchema,
  title: z.string(),
  whoServes: z.string(),
  why: z.string(),
  evidenceRefs: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  competitors: z.array(z.string()).default([]),
  rationale: z.string(),
  provenance: ProvenanceNodeSchema.optional()
});

export const StrategySchema = z.object({
  id: z.string(),
  analysisRunId: z.string(),
  selected: z.boolean().default(false),
  direction: z.string(),
  title: z.string(),
  whoServes: z.string(),
  why: z.string(),
  experienceThesis: z.string(),
  competitors: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  differentiation: z.string(),
  evidenceRefs: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  provenance: ProvenanceNodeSchema.optional()
});

export const ExperienceRequirementSchema = z.object({
  id: z.string(),
  strategyId: z.string(),
  requirement: z.string(),
  rationale: z.string(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  source: z.enum(['evidence', 'inference']).default('inference')
});

export const ArchitecturalDecisionSchema = z.object({
  id: z.string(),
  strategyId: z.string(),
  zone: z.string(),
  decision: z.string(),
  whyChain: z.array(ProvenanceNodeSchema).default([]),
  alternatives: z.array(z.string()).default([]),
  constraintsConsidered: z.array(z.string()).default([])
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Strategy = z.infer<typeof StrategySchema>;
export type ExperienceRequirement = z.infer<typeof ExperienceRequirementSchema>;
export type ArchitecturalDecision = z.infer<typeof ArchitecturalDecisionSchema>;
