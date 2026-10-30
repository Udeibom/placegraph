import { z } from 'zod';
import { ProvenanceNodeSchema } from './provenance';
import { ProjectSchema } from './project';
import {
  AudienceResolutionSchema,
  CulturalRelationshipSchema,
  DecisionBriefSchema,
  DecisionDeliverableSchema,
  DecisionFrameSchema,
  EvidenceClaimSchema,
  EvidenceQualitySchema,
  OrganisationProfileSchema,
  QlooFailureSchema,
  StageStateSchema
} from './intelligence';

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
  qlooEstablished: z.array(z.string()).default([]),
  locallyEstablished: z.array(z.string()).default([]),
  inferred: z.array(z.string()).default([]),
  relationships: z.array(z.string()).default([]),
  evidenceClaimIds: z.array(z.string()).default([]),
  commercialLogic: z.string().optional(),
  validationRequirements: z.array(z.string()).default([]),
  confidence: EvidenceQualitySchema.optional(),
  eligible: z.boolean().default(true),
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
  physicalExperience: z.string().optional(),
  qlooEstablished: z.string().optional(),
  locallyEstablished: z.string().optional(),
  inferred: z.string().optional(),
  provenance: ProvenanceNodeSchema.optional(),
  conceptType: z.string().optional(),
  fitForAudience: z.string().optional(),
  culturalRelationships: z.array(z.string()).optional().default([]),
  opportunityCaptured: z.string().optional(),
  whyWeakerThanAlternatives: z.string().optional(),
  qlooEvidenceSummary: z.string().optional(),
  opportunityId: z.string().optional(),
  evidenceClaimIds: z.array(z.string()).default([]),
  decisionFit: z.string().optional()
});

export const ExperienceRequirementSchema = z.object({
  id: z.string(),
  strategyId: z.string(),
  requirement: z.string(),
  rationale: z.string(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  source: z.enum(['evidence', 'inference', 'constraint', 'operation']).default('inference'),
  zone: z.string().optional()
});

export const ArchitecturalDecisionSchema = z.object({
  id: z.string(),
  strategyId: z.string(),
  zone: z.string(),
  decision: z.string(),
  whyChain: z.array(ProvenanceNodeSchema).default([]),
  alternatives: z.array(z.string()).default([]),
  constraintsConsidered: z.array(z.string()).default([]),
  qlooEstablished: z.string().optional(),
  locallyEstablished: z.string().optional(),
  inferred: z.string().optional(),
  unverified: z.string().optional()
});

export const LandscapeExperienceSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['local', 'qloo', 'inference']).optional(),
  affinity: z.number().optional()
});

export const CulturalLandscapeSchema = z.object({
  type: z.enum(['existing', 'potential', 'proposed']),
  summary: z.string(),
  experiences: z.array(LandscapeExperienceSchema).default([]),
  audiencesServed: z.array(z.string()).default([]),
  crowdedPatterns: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  evidenceQuality: z.enum(['strong', 'moderate', 'insufficient']).default('moderate')
});

export const AudienceRelationshipSchema = z.object({
  shared: z.array(z.string()).default([]),
  complementary: z.array(z.string()).default([]),
  conflicting: z.array(z.string()).default([]),
  spatialImplications: z.string().default('')
});

export const SpatialZoneSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  character: z.string().optional(),
  adjacency: z.string().optional()
});

export const SpatialLayoutRoomSchema = z.object({
  name: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  purpose: z.string().optional()
});

export const SpatialConceptSchema = z.object({
  organization: z.string().default(''),
  zones: z.array(SpatialZoneSchema).default([]),
  materials: z.array(z.string()).default([]),
  lighting: z.array(z.string()).default([]),
  furniture: z.array(z.string()).default([]),
  circulation: z.string().optional(),
  exterior: z.string().optional(),
  opsNotes: z.array(z.string()).default([]),
  layout: z.array(SpatialLayoutRoomSchema).optional()
});

export const VisualizationSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  images: z.array(z.string()).default([]),
  viewLabels: z.array(z.string()).default([]),
  model: z.string(),
  createdAt: z.string()
});

export const ReviewSnapshotSchema = z.object({
  strategyTitle: z.string().optional(),
  requirementCount: z.number().optional(),
  decisionSummaries: z.array(z.string()).default([])
});

export const ReviewSchema = z.object({
  id: z.string(),
  feedback: z.string(),
  chainLevel: z.enum([
    'evidence',
    'opportunity',
    'strategy',
    'experience',
    'architecture',
    'visualization'
  ]),
  diagnosis: z.string(),
  guidance: z.string().optional(),
  resolved: z.boolean().default(false),
  createdAt: z.string(),
  before: ReviewSnapshotSchema.optional(),
  after: ReviewSnapshotSchema.optional()
});

export const FloorPlanRoomSchema = z.object({
  name: z.string(),
  notes: z.string().optional(),
  approxShare: z.number().optional()
});

export const FloorPlanReadingSchema = z.object({
  source: z.enum(['vision', 'brief', 'none']),
  summary: z.string(),
  rooms: z.array(FloorPlanRoomSchema).default([]),
  constraints: z.array(z.string()).default([]),
  usable: z.boolean().default(false)
});

export const EvidenceGateSchema = z.object({
  locationQuality: z.enum(['strong', 'moderate', 'insufficient']),
  qlooQuality: z.enum(['strong', 'moderate', 'insufficient']),
  llmAvailable: z.boolean(),
  intelligenceMode: z.enum(['live', 'mixed', 'template']),
  allowConfidentRecommendation: z.boolean(),
  qlooStatus: z.enum(['ready', 'degraded', 'failed', 'missing']).optional(),
  blockedReason: z.string().optional(),
  contractFailure: QlooFailureSchema.optional(),
  warnings: z.array(z.string()).default([]),
  evidenceSummary: z.object({
    canRecommend: z.boolean(),
    canDiscover: z.boolean(),
    missingEvidence: z.array(z.string()).default([]),
    whatWouldResolveIt: z.array(z.string()).default([]),
  }).optional(),
});

export const JobProgressSchema = z.object({
  stage: z.string(),
  message: z.string(),
  at: z.string()
});

export const PlacePoiSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
  distanceM: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
});

export const LocationContextSchema = z.object({
  query: z.string(),
  displayName: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  city: z.string().optional(),
  evidenceQuality: z.enum(['strong', 'moderate', 'insufficient']).default('moderate'),
  pois: z.array(PlacePoiSchema).default([]),
  notes: z.array(z.string()).default([])
});

export const CulturalPatternSchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number(),
  places: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  implication: z.string()
});

export const QlooLocationResolutionSchema = z.object({
  query: z.string().optional(),
  resolved: z.boolean().default(false),
  scope: z.enum(['neighborhood', 'city', 'region', 'country', 'global', 'unresolved']).default('unresolved'),
  candidatesTried: z.array(z.string()).default([])
});

export const QlooContextSchema = z.object({
  source: z.enum(['live', 'mock', 'mixed', 'failed', 'unavailable']).default('unavailable'),
  locationResolution: QlooLocationResolutionSchema.optional(),
  entities: z.array(z.any()).default([]),
  affinities: z.array(z.any()).default([]),
  audienceAffinities: z.record(z.string(), z.array(z.any())).optional(),
  crossDomain: z.any().optional(),
  culturalPatterns: z.array(CulturalPatternSchema).default([]),
  culturalThesis: z.string().default(''),
  notes: z.array(z.string()).default([]),
  insufficient: z.boolean().default(false),
  failure: QlooFailureSchema.optional(),
  audienceResolutions: z.array(AudienceResolutionSchema).default([]),
  evidenceClaims: z.array(EvidenceClaimSchema).default([]),
  environment: z.string().optional()
});

export const CounterfactualSchema = z.object({
  summary: z.string(),
  genericStrategy: z.string(),
  culturalStrategy: z.string(),
  whatQlooChanged: z.array(z.string()).default([]),
  caveat: z.string()
});

// ─── Operator-specific output types ──────────────────────────────────────────

export const RetailCategorySchema = z.object({
  category: z.string(),
  alignment: z.string(),
  evidence: z.array(z.string()).default([]),
  confidence: z.enum(['strong', 'moderate', 'weak']).default('moderate'),
});

export const RetailStrategyOutputSchema = z.object({
  positioning: z.string(),
  categoryMix: z.array(RetailCategorySchema).default([]),
  formatRecommendation: z.string(),
  communityFit: z.string(),
  localCollaborations: z.array(z.string()).default([]),
  evidenceSummary: z.string(),
  gaps: z.array(z.string()).default([]),
});

export const ProgrammingActivitySchema = z.object({
  activity: z.string(),
  rationale: z.string(),
  audience: z.string(),
  frequency: z.string(),
  spaceRequired: z.string().optional(),
  evidence: z.array(z.string()).default([]),
});

export const ExperienceMixItemSchema = z.object({
  type: z.string(),
  rationale: z.string(),
  proportion: z.enum(['primary', 'secondary', 'supplementary']).default('secondary'),
  evidence: z.array(z.string()).default([]),
});

export const TenantRationaleSchema = z.object({
  tenantType: z.string(),
  why: z.string(),
  evidence: z.array(z.string()).default([]),
});

export const OperatorOutputSchema = z.object({
  programmingModel: z.string(),
  experienceMix: z.array(ExperienceMixItemSchema).default([]),
  activations: z.array(ProgrammingActivitySchema).default([]),
  tenantRationale: z.array(TenantRationaleSchema).default([]),
  evidenceSummary: z.string(),
  whatToStop: z.array(z.string()).default([]),
});

export const HospitalityOutputSchema = z.object({
  conceptIdentity: z.string(),
  fbStrategy: z.string(),
  daypartStrategy: z.string(),
  programmingModel: z.string(),
  atmosphereNotes: z.string(),
  evidenceSummary: z.string(),
});

export const PlaceProfileSchema = z.object({
  placeIdentity: z.string(),
  communityProfile: z.string(),
  culturalAssets: z.array(z.string()).default([]),
  commercialSupply: z.string(),
  behaviouralSignals: z.string(),
  unmetNeeds: z.array(z.string()).default([]),
  evidenceQuality: z.enum(['strong', 'moderate', 'insufficient']).default('moderate'),
});

export const AnalysisSnapshotSchema = z.object({
  runId: z.string(),
  projectId: z.string(),
  status: z.enum([
    'idle',
    'analyzing',
    'ready',
    'strategy_selected',
    'designed',
    'visualized',
    'review'
  ]).default('idle'),
  locationContext: LocationContextSchema.optional(),
  qlooContext: QlooContextSchema.optional(),
  decisionFrame: DecisionFrameSchema.optional(),
  organisationProfiles: z.array(OrganisationProfileSchema).default([]),
  primaryProfileId: z.string().optional(),
  audienceResolutions: z.array(AudienceResolutionSchema).default([]),
  evidenceClaims: z.array(EvidenceClaimSchema).default([]),
  relationships: z.array(CulturalRelationshipSchema).default([]),
  stageStates: z.array(StageStateSchema).default([]),
  decisionBrief: DecisionBriefSchema.optional(),
  deliverables: z.array(DecisionDeliverableSchema).default([]),
  landscapes: z
    .object({
      existing: CulturalLandscapeSchema,
      potential: CulturalLandscapeSchema,
      proposed: CulturalLandscapeSchema
    })
    .optional(),
  audienceAnalysis: AudienceRelationshipSchema.optional(),
  opportunities: z.array(OpportunitySchema).default([]),
  strategies: z.array(StrategySchema).default([]),
  selectedStrategyId: z.string().optional(),
  requirements: z.array(ExperienceRequirementSchema).default([]),
  decisions: z.array(ArchitecturalDecisionSchema).default([]),
  concept: SpatialConceptSchema.optional(),
  visualizations: z.array(VisualizationSchema).default([]),
  provenance: z.array(ProvenanceNodeSchema).default([]),
  reviews: z.array(ReviewSchema).default([]),
  counterfactual: CounterfactualSchema.optional(),
  floorPlan: FloorPlanReadingSchema.optional(),
  evidenceGate: EvidenceGateSchema.optional(),
  intelligenceMode: z.enum(['live', 'mixed', 'template']).optional(),
  progress: JobProgressSchema.optional(),
  error: z.string().optional(),
  updatedAt: z.string(),
  // Operator-specific outputs (only one will be populated based on operatorType)
  placeProfile: PlaceProfileSchema.optional(),
  retailOutput: RetailStrategyOutputSchema.optional(),
  operatorOutput: OperatorOutputSchema.optional(),
  hospitalityOutput: HospitalityOutputSchema.optional(),
});

export const PIPELINE_STAGES = [
  { id: 'place',          label: 'Brief' },
  { id: 'recommendation', label: 'Recommendation' },
  { id: 'spatial',        label: 'Spatial translation' },
  { id: 'review',         label: 'Review' },
] as const;

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Strategy = z.infer<typeof StrategySchema>;
export type ExperienceRequirement = z.infer<typeof ExperienceRequirementSchema>;
export type ArchitecturalDecision = z.infer<typeof ArchitecturalDecisionSchema>;
export type CulturalLandscape = z.infer<typeof CulturalLandscapeSchema>;
export type AudienceRelationship = z.infer<typeof AudienceRelationshipSchema>;
export type SpatialLayoutRoom = z.infer<typeof SpatialLayoutRoomSchema>;
export type SpatialConcept = z.infer<typeof SpatialConceptSchema>;
export type FloorPlanReading = z.infer<typeof FloorPlanReadingSchema>;
export type EvidenceGate = z.infer<typeof EvidenceGateSchema>;
export type JobProgress = z.infer<typeof JobProgressSchema>;
export type ReviewSnapshot = z.infer<typeof ReviewSnapshotSchema>;
export type Visualization = z.infer<typeof VisualizationSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type PlacePoi = z.infer<typeof PlacePoiSchema>;
export type LocationContext = z.infer<typeof LocationContextSchema>;
export type CulturalPattern = z.infer<typeof CulturalPatternSchema>;
export type QlooContext = z.infer<typeof QlooContextSchema>;
export type QlooLocationResolution = z.infer<typeof QlooLocationResolutionSchema>;
export type Counterfactual = z.infer<typeof CounterfactualSchema>;
export type AnalysisSnapshot = z.infer<typeof AnalysisSnapshotSchema>;
export type ProjectRecord = z.infer<typeof ProjectSchema>;
export type RetailCategory = z.infer<typeof RetailCategorySchema>;
export type RetailStrategyOutput = z.infer<typeof RetailStrategyOutputSchema>;
export type ProgrammingActivity = z.infer<typeof ProgrammingActivitySchema>;
export type ExperienceMixItem = z.infer<typeof ExperienceMixItemSchema>;
export type TenantRationale = z.infer<typeof TenantRationaleSchema>;
export type OperatorOutput = z.infer<typeof OperatorOutputSchema>;
export type HospitalityOutput = z.infer<typeof HospitalityOutputSchema>;
export type PlaceProfile = z.infer<typeof PlaceProfileSchema>;
