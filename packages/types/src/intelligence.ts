import { z } from 'zod';

export const OrganisationProfileTypeSchema = z.enum([
  'developer',
  'hospitality',
  'retail',
  'operator',
  'facility',
  'investor',
  'mixed_use',
  'other'
]);

export const OrganisationProfileSchema = z.object({
  id: z.string(),
  type: OrganisationProfileTypeSchema,
  name: z.string(),
  primary: z.boolean().default(false),
  mandate: z.string().optional(),
  deliverables: z.array(z.string()).default([])
});

export const DecisionTypeSchema = z.enum([
  'develop',
  'establish',
  'enter_market',
  'tenant_mix',
  'reposition',
  'adapt',
  'store_format',
  'utilisation',
  'audience_choice',
  'other'
]);

export const DecisionFrameSchema = z.object({
  type: DecisionTypeSchema.default('other'),
  subject: z.string().default(''),
  timeHorizon: z.string().optional(),
  capitalIntent: z.string().optional(),
  successTests: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([])
});

export const EvaluateConceptSchema = z.object({
  format: z.string().default(''),
  positioning: z.string().optional(),
  offerings: z.array(z.string()).default([]),
  tenantMix: z.array(z.string()).default([]),
  targetAudiences: z.array(z.string()).default([]),
  experienceNotes: z.string().optional()
});

export const EvidenceTypeSchema = z.enum([
  'qloo_search',
  'qloo_affinity',
  'qloo_demographics',
  'qloo_trend',
  'qloo_tag',
  'qloo_heatmap',
  'local_observation',
  'placegraph_inference',
  'assumption'
]);

export const EvidenceSourceSchema = z.enum(['qloo', 'local', 'inference', 'assumption']);

export const EvidenceQualitySchema = z.enum([
  'strong',
  'moderate',
  'approximate',
  'insufficient',
  'failed',
  'unresolved',
  'degraded'
]);

export const EvidenceScopeSchema = z.object({
  place: z.string().optional(),
  audienceIds: z.array(z.string()).default([]),
  geography: z.string().optional()
});

export const QlooIdentifierSchema = z.object({
  uuid: z.string().optional(),
  urn: z.string().optional(),
  displayName: z.string(),
  entityType: z.string().optional(),
  domain: z.string().optional(),
  environment: z.string().optional()
});

export const EvidenceClaimSchema = z.object({
  id: z.string(),
  stage: z.string(),
  claim: z.string(),
  evidenceType: EvidenceTypeSchema,
  source: EvidenceSourceSchema,
  quality: EvidenceQualitySchema,
  scope: EvidenceScopeSchema.default({ audienceIds: [] }),
  confidence: z.number().min(0).max(1).optional(),
  qlooRefs: z.array(z.string()).default([]),
  localRefs: z.array(z.string()).default([]),
  supporting: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  interpretation: z.string().optional(),
  implication: z.string().optional(),
  validationRequired: z.array(z.string()).default([]),
  sourceEnvironment: z.string().optional(),
  observedAt: z.string().optional()
});

export const AudienceAffinityEvidenceSchema = z.object({
  target: z.string(),
  targetId: z.string().optional(),
  urn: z.string().optional(),
  strength: z.number(),
  domain: z.string().optional(),
  genre: z.string().optional(),
  city: z.string().optional(),
  seedCount: z.number().int().min(1).default(1),
  evidenceClaimId: z.string().optional()
});

export const AudienceResolutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.number().int().min(1).max(3).optional(),
  description: z.string().optional(),
  query: z.string(),
  status: z.enum(['resolved', 'approximate', 'unresolved', 'failed']),
  quality: EvidenceQualitySchema,
  identifiers: z.array(QlooIdentifierSchema).default([]),
  seeds: z.array(QlooIdentifierSchema).default([]),
  affinities: z.array(AudienceAffinityEvidenceSchema).default([]),
  evidenceClaimIds: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([])
});

export const CulturalRelationshipSchema = z.object({
  id: z.string(),
  subject: z.string(),
  object: z.string(),
  relationshipType: z.enum([
    'shared_affinity',
    'complementary_affinity',
    'tension',
    'local_expression',
    'cross_domain'
  ]),
  audienceIds: z.array(z.string()).default([]),
  score: z.number().optional(),
  seedCount: z.number().int().min(1).optional(),
  evidenceType: EvidenceTypeSchema,
  quality: EvidenceQualitySchema,
  interpretation: z.string(),
  commercialRelevance: z.string(),
  limitations: z.array(z.string()).default([]),
  evidenceClaimIds: z.array(z.string()).default([])
});

export const StageIdSchema = z.enum([
  'decision_frame',
  'place_resolution',
  'audience_resolution',
  'affinity_collection',
  'audience_profiles',
  'evidence_gate',
  'cultural_patterns',
  'cross_domain',
  'opportunities',
  'strategies',
  'spatial_translation',
  'review'
]);

export const StageStateSchema = z.object({
  stage: StageIdSchema,
  status: z.enum(['complete', 'degraded', 'failed', 'skipped', 'pending']),
  source: z.string().optional(),
  quality: EvidenceQualitySchema.optional(),
  message: z.string(),
  evidenceClaimIds: z.array(z.string()).default([]),
  updatedAt: z.string().optional()
});

export const DecisionDeliverableSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  evidenceClaimIds: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([])
});

export const DecisionBriefSchema = z.object({
  mode: z.enum(['discover', 'evaluate']),
  frame: DecisionFrameSchema,
  profiles: z.array(OrganisationProfileSchema).default([]),
  primaryProfileId: z.string().optional(),
  placeSummary: z.string(),
  audienceSummary: z.string(),
  culturalSummary: z.string(),
  relationships: z.array(CulturalRelationshipSchema).default([]),
  opportunityIds: z.array(z.string()).default([]),
  uncertainty: z.array(z.string()).default([]),
  nextInvestigation: z.array(z.string()).default([]),
  deliverables: z.array(DecisionDeliverableSchema).default([])
});

export const QlooFailureSchema = z.object({
  kind: z.enum([
    'missing_configuration',
    'authentication',
    'authorization',
    'invalid_request',
    'rate_limit',
    'upstream',
    'parse',
    'environment'
  ]),
  endpoint: z.string().optional(),
  status: z.number().optional(),
  message: z.string(),
  retryable: z.boolean().default(false),
  environment: z.string().optional()
});

export type OrganisationProfileType = z.infer<typeof OrganisationProfileTypeSchema>;
export type OrganisationProfile = z.infer<typeof OrganisationProfileSchema>;
export type DecisionType = z.infer<typeof DecisionTypeSchema>;
export type DecisionFrame = z.infer<typeof DecisionFrameSchema>;
export type EvaluateConcept = z.infer<typeof EvaluateConceptSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;
export type EvidenceQuality = z.infer<typeof EvidenceQualitySchema>;
export type EvidenceScope = z.infer<typeof EvidenceScopeSchema>;
export type QlooIdentifier = z.infer<typeof QlooIdentifierSchema>;
export type EvidenceClaim = z.infer<typeof EvidenceClaimSchema>;
export type AudienceAffinityEvidence = z.infer<typeof AudienceAffinityEvidenceSchema>;
export type AudienceResolution = z.infer<typeof AudienceResolutionSchema>;
export type CulturalRelationship = z.infer<typeof CulturalRelationshipSchema>;
export type StageId = z.infer<typeof StageIdSchema>;
export type StageState = z.infer<typeof StageStateSchema>;
export type DecisionDeliverable = z.infer<typeof DecisionDeliverableSchema>;
export type DecisionBrief = z.infer<typeof DecisionBriefSchema>;
export type QlooFailure = z.infer<typeof QlooFailureSchema>;
