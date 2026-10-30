import type {
  AnalysisSnapshot,
  StageState,
  ArchitecturalDecision,
  ExperienceRequirement,
  HospitalityOutput,
  OperatorOutput,
  Opportunity,
  PlaceProfile,
  Project,
  QlooContext,
  RetailStrategyOutput,
  Review,
  SpatialConcept,
  Strategy
} from '@placegraph/types';
import { ProvenanceBuilder, generateId, nowIso, parseJsonFromLlm, replaceVars } from '@placegraph/core';
import {
  ARCHITECTURE_PROMPT,
  EXPERIENCE_REQ_PROMPT,
  HOSPITALITY_OUTPUT_PROMPT,
  LANDSCAPE_PROMPT,
  OPERATOR_OUTPUT_PROMPT,
  OPPORTUNITY_ANALYSIS_PROMPT,
  PLACE_INVESTIGATION_PROMPT,
  RETAIL_OUTPUT_PROMPT,
  REVIEW_PROMPT,
  STRATEGY_GENERATION_PROMPT
} from './prompts';
import { createLLMProvider, LLMProvider, type LLMFailure } from './providers/llm';
import { gatherLocationContext } from './location';
import { gatherQlooContext } from './qloo-context';
import { deriveCulturalRelationships } from './relationships';
import { resolveDecisionFrame, resolveOrganisationProfiles } from './organisation';
import { buildDecisionBrief } from './decision';
import { unresolvedAudienceEvidence } from './audiences';
import {
  fallbackArchitecture,
  fallbackHospitalityOutput,
  fallbackLandscapes,
  fallbackOperatorOutput,
  fallbackOpportunities,
  fallbackPlaceProfile,
  fallbackRequirements,
  fallbackRetailOutput,
  fallbackStrategies
} from './fallback';
import { VisualizationService } from './visualization';
import { applyEvidenceGateToSnapshot, buildEvidenceGate } from './evidence';
import { readFloorPlan } from './floorplan';
import { ensureLayout } from './layout';
import {
  constraintPrompt,
  sanitizeConceptConstraints,
  sanitizeDecisionConstraints,
  sanitizeOpportunityConstraints,
  sanitizeRequirementConstraints,
  sanitizeStrategyConstraints
} from './constraints';

export interface OrchestratorInput {
  project: Project;
  useMock?: boolean;
  noQloo?: boolean;
  guidance?: string;
}

export type ProgressFn = (stage: string, message: string) => void;

interface LlmCallResult<T> {
  value: T;
  failure?: LLMFailure;
}

interface StageLlmFailure {
  stage: StageState['stage'];
  failure: LLMFailure;
}

function counterfactualChanges(generic: AnalysisSnapshot, cultural: AnalysisSnapshot): string[] {
  const targets = affinityTargets(cultural.qlooContext).slice(0, 5);
  const genericTop = generic.strategies[0];
  const culturalTop =
    cultural.strategies.find((s) => s.id === cultural.selectedStrategyId) || cultural.strategies[0];
  const changes: string[] = [];

  if (targets.length) {
    changes.push(
      `The Qloo analysis cites scored place affinities absent from the generic run: ${targets
        .map((a) => `${a.target} (${a.strength.toFixed(3)})`)
        .join(', ')}.`
    );
  } else {
    changes.push('Qloo returned no scored affinities, so the cultural pass added no graph evidence.');
  }

  if (culturalTop && genericTop && culturalTop.title !== genericTop.title) {
    changes.push(
      `Lead titles differed in this single pair: generic "${genericTop.title}" versus Qloo-informed "${culturalTop.title}". This difference may reflect Qloo, ordinary LLM variation, or degraded stages; it does not establish causality.`
    );
  } else if (culturalTop) {
    changes.push(`Both runs produced the same lead title ("${culturalTop.title}"); the Qloo run adds scored evidence but does not establish a changed decision.`);
  }

  if (cultural.opportunities.some((o) => (o.qlooEstablished || []).length > 0)) {
    changes.push('The Qloo run cites scored affinity evidence in its opportunity hypotheses; the generic run cannot cite that evidence.');
  }

  const patterns = cultural.qlooContext?.culturalPatterns || [];
  if (patterns.length >= 2) {
    changes.push(
      `The Qloo run groups scored affinities into a ${patterns
        .slice(0, 3)
        .map((pattern) => pattern.label.toLowerCase())
        .join(' + ')} pattern mix. Treat this as evidence framing, not a demonstrated change in commercial outcome.`
    );
  }

  return changes;
}

function applyConstraintFeasibility(
  strategies: Strategy[],
  project: Project
): Strategy[] {
  const constraints = (project.constraints ?? [])
    .map((c) => `${c.key}: ${c.value}`.toLowerCase());

  const hasConstraint = (keywords: string[]) =>
    constraints.some((c) => keywords.some((kw) => c.includes(kw)));

  const noLateNight = hasConstraint(['late-night', 'late night', 'no events', 'on-licence only', 'on licence only']);
  const noLoudNoise = hasConstraint(['noise', 'residential above', 'acoustic']);
  const noExtraction = hasConstraint(['no extraction', 'no heavy cooking']);
  const streetLevelOnly = hasConstraint(['no basement', 'street level only']);

  return strategies.map((strategy) => {
    const violations: string[] = [];
    const text = `${strategy.title} ${strategy.experienceThesis} ${strategy.why} ${strategy.physicalExperience ?? ''}`.toLowerCase();

    if (noLateNight && /late.night|after.midnight|night.programme|evening.events|late.licence/i.test(text)) {
      violations.push('Relies on late-night programming which the licence constraint prohibits.');
    }
    if (noLoudNoise && /loud|high.volume|amplified.music|live.music.night|club.night/i.test(text)) {
      violations.push('Requires sound levels that conflict with the residential noise constraint.');
    }
    if (noExtraction && /full.kitchen|heavy.cooking|extraction|open.flame|deep.fry/i.test(text)) {
      violations.push('Requires kitchen capability that the fit-out constraint prohibits.');
    }
    if (streetLevelOnly && /basement|lower.ground|underground/i.test(text)) {
      violations.push('Depends on basement or lower-ground space which the access constraint prohibits.');
    }

    if (violations.length > 0) {
      // Do not discard — flag it so the user sees the conflict
      return {
        ...strategy,
        assumptions: [
          ...strategy.assumptions,
          ...violations.map((v) => `CONSTRAINT CONFLICT: ${v}`)
        ],
      };
    }

    return strategy;
  });
}

function withheldQlooContext(project: Project): QlooContext {
  const unresolved = unresolvedAudienceEvidence(project, 'Qloo evidence was deliberately withheld for this baseline analysis.');
  return {
    source: 'unavailable',
    entities: [],
    affinities: [],
    audienceAffinities: Object.fromEntries(project.audiences.map((a) => [a.name, []])),
    crossDomain: null,
    culturalPatterns: [],
    culturalThesis: '',
    notes: ['Qloo evidence was deliberately withheld for this baseline analysis.'],
    insufficient: true,
    audienceResolutions: unresolved.audiences,
    evidenceClaims: unresolved.claims,
    environment: 'withheld'
  };
}

function reviewClip(analysis: AnalysisSnapshot) {
  return {
    strategyTitle: (analysis.strategies.find((s) => s.selected) || analysis.strategies[0])?.title,
    requirementCount: analysis.requirements.length,
    decisionSummaries: analysis.decisions.slice(0, 6).map((d) => `${d.zone}: ${d.decision}`)
  };
}

function asText(value: any): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const named = value.name ?? value.title ?? value.decision ?? value.requirement ?? value.explanation;
    if (typeof named === 'string') return named;
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}

function asTextList(value: any): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.flatMap(asTextList);
  if (typeof value === 'object') return Object.values(value).flatMap(asTextList);
  const text = asText(value);
  return text ? [text] : [];
}

function asOptionalText(value: any): string | undefined {
  const text = asText(value);
  return text || undefined;
}

function trimText(value: unknown, max: number): string | undefined {
  const text = asOptionalText(value);
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

function compactProject(project: Project) {
  return {
    id: project.id,
    name: trimText(project.name, 160),
    mode: project.mode,
    projectType: project.projectType,
    businessType: trimText(project.businessType, 240),
    operatorType: project.operatorType,
    objective: trimText(project.objective, 900),
    investmentIntent: trimText(project.investmentIntent, 300),
    budgetRange: trimText(project.budgetRange, 160),
    floorArea: trimText(project.floorArea, 160),
    location: project.location,
    audiences: (project.audiences || []).slice(0, 8).map((audience) => ({
      name: trimText(audience.name, 160),
      description: trimText(audience.description, 300),
      priority: audience.priority
    })),
    constraints: (project.constraints || []).slice(0, 12).map((constraint) => ({
      key: constraint.key,
      value: trimText(constraint.value, 240),
      type: constraint.type
    })),
    concept: project.concept
      ? {
          format: trimText(project.concept.format, 300),
          positioning: trimText(project.concept.positioning, 500),
          offerings: (project.concept.offerings || []).slice(0, 12),
          tenantMix: (project.concept.tenantMix || []).slice(0, 12),
          targetAudiences: (project.concept.targetAudiences || []).slice(0, 8),
          experienceNotes: trimText(project.concept.experienceNotes, 500)
        }
      : undefined,
    decisionFrame: project.decisionFrame
  };
}

export function compactLocation(location: any) {
  if (!location) return location;
  const allPois = Array.isArray(location.pois) ? location.pois : [];
  const limit = 60;
  return {
    query: location.query,
    displayName: location.displayName,
    city: location.city,
    evidenceQuality: location.evidenceQuality,
    poiCount: allPois.length,
    poiLimitApplied: allPois.length > limit,
    pois: allPois.slice(0, limit).map((p: any) => ({
      name: p.name,
      category: p.category,
      distanceM: p.distanceM
    })),
    notes: (location.notes || []).slice(0, 5)
  };
}

function compactAffinities(list: any[], limit = 8) {
  return (Array.isArray(list) ? list : []).slice(0, limit).map((a: any) => ({
    target: a.target || a.name,
    strength: a.strength,
    domain: a.domain,
    genre: a.genre,
    city: a.city
  }));
}

function compactQloo(qloo: any) {
  if (!qloo) return qloo;
  const cross = qloo.crossDomain?.results;
  return {
    source: qloo.source,
    insufficient: qloo.insufficient,
    affinities: compactAffinities(qloo.affinities, 10),
    audienceAffinities: Object.fromEntries(
      Object.entries(qloo.audienceAffinities || {}).map(([k, v]) => [k, compactAffinities(v as any[], 5)])
    ),
    entities: (qloo.entities || []).slice(0, 8).map((e: any) => ({
      name: e.name,
      domain: e.domain,
      type: e.type
    })),
    crossDomain: cross
      ? {
          places: compactAffinities(cross.places, 5),
          brands: compactAffinities(cross.brands, 5),
          artists: compactAffinities(cross.artists, 5)
        }
      : undefined,
    culturalPatterns: (qloo.culturalPatterns || []).slice(0, 8).map((pattern: any) => ({
      label: pattern.label,
      count: pattern.count,
      places: (pattern.places || []).slice(0, 5),
      implication: pattern.implication
    })),
    culturalThesis: qloo.culturalThesis,
    notes: (qloo.notes || []).slice(0, 3)
  };
}

function compactRelationships(relationships: any[]) {
  return (Array.isArray(relationships) ? relationships : []).slice(0, 10).map((relationship) => ({
    id: relationship.id,
    subject: trimText(relationship.subject, 120),
    object: trimText(relationship.object, 160),
    type: relationship.relationshipType,
    audienceIds: (relationship.audienceIds || []).slice(0, 6),
    score: relationship.score,
    quality: relationship.quality,
    commercialRelevance: trimText(relationship.commercialRelevance, 220),
    limitations: (relationship.limitations || []).slice(0, 1).map((item: unknown) => trimText(item, 180)),
    evidenceClaimIds: (relationship.evidenceClaimIds || []).slice(0, 4)
  }));
}

function traceOpportunity(
  opportunity: Opportunity,
  relationships: any[]
): Opportunity {
  const text = [
    opportunity.title,
    opportunity.why,
    opportunity.rationale,
    ...(opportunity.qlooEstablished || []),
    ...(opportunity.evidenceRefs || [])
  ]
    .join(' ')
    .toLowerCase();
  const matches = relationships.filter(
    (relationship) =>
      relationship.object && text.includes(String(relationship.object).toLowerCase())
  );
  return {
    ...opportunity,
    relationships: [...new Set([
      ...(opportunity.relationships || []),
      ...matches.map((relationship) => relationship.object)
    ])],
    evidenceClaimIds: [...new Set([
      ...(opportunity.evidenceClaimIds || []),
      ...matches.flatMap((relationship) => relationship.evidenceClaimIds || [])
    ])]
  };
}

function traceStrategy(
  strategy: Strategy,
  opportunities: Opportunity[],
  relationships: any[]
): Strategy {
  const linked =
    opportunities.find((opportunity) => opportunity.id === strategy.opportunityId) ||
    opportunities.find((opportunity) =>
      [strategy.title, strategy.opportunityCaptured, strategy.why]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(opportunity.title.toLowerCase())
    );
  const text = [
    strategy.title,
    strategy.why,
    strategy.experienceThesis,
    strategy.differentiation,
    strategy.opportunityCaptured,
    ...(strategy.culturalRelationships || []),
    ...(strategy.evidenceRefs || [])
  ]
    .join(' ')
    .toLowerCase();
  const matches = relationships.filter(
    (relationship) =>
      relationship.object && text.includes(String(relationship.object).toLowerCase())
  );
  return {
    ...strategy,
    opportunityId: strategy.opportunityId || linked?.id,
    culturalRelationships: [...new Set([
      ...(strategy.culturalRelationships || []),
      ...matches.map((relationship) => relationship.object)
    ])],
    evidenceClaimIds: [...new Set([
      ...(strategy.evidenceClaimIds || []),
      ...(linked?.evidenceClaimIds || []),
      ...matches.flatMap((relationship) => relationship.evidenceClaimIds || [])
    ])],
    decisionFit: strategy.decisionFit
  };
}

function compactPatterns(patterns: any[], limit = 7, placeLimit = 4) {
  return (Array.isArray(patterns) ? patterns : []).slice(0, limit).map((pattern: any) => ({
    label: pattern.label,
    count: pattern.count,
    places: (pattern.places || []).slice(0, placeLimit),
    implication: pattern.implication
  }));
}

function compactPromptQloo(qloo: any) {
  if (!qloo) return qloo;
  const cross = qloo.crossDomain?.results;
  return {
    source: qloo.source,
    insufficient: qloo.insufficient,
    locationResolution: qloo.locationResolution,
    culturalThesis: trimText(qloo.culturalThesis, 500),
    culturalPatterns: compactPatterns(qloo.culturalPatterns, 5, 3),
    affinities: compactAffinities(qloo.affinities, 6),
    crossDomain: cross ? {
      brands: compactAffinities(cross.brands, 3),
      artists: compactAffinities(cross.artists, 3),
    } : undefined,
    notes: (qloo.notes || []).slice(0, 2).map((note: unknown) => trimText(note, 240))
  };
}

function compactPromptLandscapes(landscapes: any) {
  if (!landscapes) return landscapes;
  const slim = (landscape: any) => landscape
    ? {
        type: landscape.type,
        summary: trimText(landscape.summary, 600),
        gaps: (landscape.gaps || []).slice(0, 2).map((item: unknown) => trimText(item, 180)),
        crowdedPatterns: (landscape.crowdedPatterns || []).slice(0, 2),
        evidenceQuality: landscape.evidenceQuality
      }
    : landscape;
  return {
    existing: slim(landscapes.existing),
    potential: slim(landscapes.potential),
    proposed: slim(landscapes.proposed)
  };
}

function compactPromptOpportunities(opportunities: any[]) {
  return (Array.isArray(opportunities) ? opportunities : []).map((op: any) => ({
    type: op.type,
    title: op.title,
    whoServes: op.whoServes,
    why: op.why,
    qlooEstablished: op.qlooEstablished,
    locallyEstablished: op.locallyEstablished,
    inferred: op.inferred
  }));
}

function affinityTargets(qloo: any): Array<{ target: string; strength: number }> {
  const seen = new Set<string>();
  return (qloo?.affinities || [])
    .filter((a: any) => typeof a?.target === 'string' && typeof a?.strength === 'number')
    .sort((a: any, b: any) => b.strength - a.strength)
    .filter((a: any) => {
      const key = a.target.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function sanitizeQlooList(value: unknown, qloo: any): string[] {
  const raw = asTextList(value).join(' ').toLowerCase();
  if (!raw) return [];
  return affinityTargets(qloo)
    .filter((a) => raw.includes(a.target.toLowerCase()))
    .slice(0, 6)
    .map((a) => `${a.target} (${a.strength.toFixed(3)})`);
}

function sanitizeQlooText(value: unknown, qloo: any): string | undefined {
  const rows = sanitizeQlooList(value, qloo);
  return rows.length ? rows.join(', ') : undefined;
}

function affinitySummary(project: Project, qloo: any): string {
  const rows = affinityTargets(qloo).slice(0, 6);
  if (!rows.length) {
    return 'Qloo returned no scored affinities for this location. Cultural evidence is insufficient.';
  }
  const place = project.location.neighborhood || project.location.city || 'this location';
  const patternLabels = (qloo?.culturalPatterns || [])
    .slice(0, 4)
    .map((pattern: any) => pattern.label)
    .join(', ');
  return `Qloo resolved ${affinityTargets(qloo).length} scored place affinities around ${place}, including ${rows
    .map((a) => `${a.target} (${a.strength.toFixed(3)})`)
    .join(', ')}. These are cultural relationships, not a demand forecast.${patternLabels ? ` Pattern mix: ${patternLabels}.` : ''}`;
}

function assertSpatialTranslationAllowed(
  project: Project,
  analysis: AnalysisSnapshot,
  strategy: Strategy
): void {
  if (analysis.evidenceGate && !analysis.evidenceGate.allowConfidentRecommendation) {
    throw new Error(
      `Spatial translation is blocked by the evidence gate: ${analysis.evidenceGate.blockedReason || 'evidence is insufficient for a confident recommendation.'}`
    );
  }
  const eligible = analysis.opportunities.filter((opportunity) => opportunity.eligible !== false);
  if (!eligible.length) {
    throw new Error('Spatial translation requires at least one evidence-eligible opportunity.');
  }
  const selectedOpportunity =
    eligible.find((opportunity) => opportunity.id === strategy.opportunityId) || eligible[0];
  if (!selectedOpportunity) {
    throw new Error('Spatial translation requires a selected opportunity.');
  }
  if (!project.floorArea) {
    throw new Error('Spatial translation requires a declared floor area.');
  }
  if (!analysis.floorPlan) {
    throw new Error('Spatial translation requires a floor plan reading or dimensional brief.');
  }
  if (!analysis.floorPlan.usable) {
    throw new Error('Spatial translation requires usable floor plan or dimensional geometry.');
  }
}

function compactFloorPlan(floorPlan: any) {
  if (!floorPlan) return floorPlan;
  return {
    source: floorPlan.source,
    summary: floorPlan.summary,
    rooms: (floorPlan.rooms || []).slice(0, 8),
    constraints: (floorPlan.constraints || []).slice(0, 4),
    usable: floorPlan.usable
  };
}

function normalizeOpportunity(raw: any, runId: string): Opportunity {
  return {
    id: asText(raw.id) || generateId('opp'),
    analysisRunId: runId,
    type: ['alignment', 'whitespace', 'destination', 'mixed'].includes(raw.type) ? raw.type : 'mixed',
    title: asText(raw.title) || 'Untitled opportunity',
    whoServes: asText(raw.whoServes ?? raw.who_serves),
    why: asText(raw.why),
    evidenceRefs: asTextList(raw.evidenceRefs ?? raw.evidence_refs),
    assumptions: asTextList(raw.assumptions),
    uncertainties: asTextList(raw.uncertainties),
    competitors: asTextList(raw.competitors),
    rationale: asText(raw.rationale),
    qlooEstablished: asTextList(raw.qlooEstablished),
    locallyEstablished: asTextList(raw.locallyEstablished),
    inferred: asTextList(raw.inferred),
    relationships: asTextList(raw.relationships),
    evidenceClaimIds: asTextList(raw.evidenceClaimIds ?? raw.evidence_claim_ids),
    commercialLogic: asOptionalText(raw.commercialLogic ?? raw.commercial_logic),
    validationRequirements: asTextList(raw.validationRequirements ?? raw.validation_requirements),
    confidence: ['strong', 'moderate', 'approximate', 'insufficient', 'failed', 'unresolved', 'degraded'].includes(raw.confidence)
      ? raw.confidence
      : undefined,
    eligible: raw.eligible === undefined ? true : Boolean(raw.eligible)
  };
}

function normalizeRetailOutput(raw: any, project: Project): RetailStrategyOutput {
  return {
    positioning: asText(raw.positioning) || `Retail positioning for ${project.location.city || 'this location'} — requires live LLM output.`,
    categoryMix: (Array.isArray(raw.categoryMix) ? raw.categoryMix : []).map((c: any) => ({
      category: asText(c.category),
      alignment: asText(c.alignment),
      evidence: asTextList(c.evidence),
      confidence: ['strong', 'moderate', 'weak'].includes(c.confidence) ? c.confidence : 'moderate',
    })),
    formatRecommendation: asText(raw.formatRecommendation) || 'Format recommendation unavailable.',
    communityFit: asText(raw.communityFit) || '',
    localCollaborations: asTextList(raw.localCollaborations),
    evidenceSummary: asText(raw.evidenceSummary) || '',
    gaps: asTextList(raw.gaps),
  };
}

function normalizeOperatorOutput(raw: any): OperatorOutput {
  return {
    programmingModel: asText(raw.programmingModel) || 'Programming model unavailable.',
    experienceMix: (Array.isArray(raw.experienceMix) ? raw.experienceMix : []).map((e: any) => ({
      type: asText(e.type),
      rationale: asText(e.rationale),
      proportion: ['primary', 'secondary', 'supplementary'].includes(e.proportion) ? e.proportion : 'secondary',
      evidence: asTextList(e.evidence),
    })),
    activations: (Array.isArray(raw.activations) ? raw.activations : []).map((a: any) => ({
      activity: asText(a.activity),
      rationale: asText(a.rationale),
      audience: asText(a.audience),
      frequency: asText(a.frequency),
      spaceRequired: asOptionalText(a.spaceRequired),
      evidence: asTextList(a.evidence),
    })),
    tenantRationale: (Array.isArray(raw.tenantRationale) ? raw.tenantRationale : []).map((t: any) => ({
      tenantType: asText(t.tenantType),
      why: asText(t.why),
      evidence: asTextList(t.evidence),
    })),
    evidenceSummary: asText(raw.evidenceSummary) || '',
    whatToStop: asTextList(raw.whatToStop),
  };
}

function normalizeHospitalityOutput(raw: any): HospitalityOutput {
  return {
    conceptIdentity: asText(raw.conceptIdentity) || '',
    fbStrategy: asText(raw.fbStrategy) || '',
    daypartStrategy: asText(raw.daypartStrategy) || '',
    programmingModel: asText(raw.programmingModel) || '',
    atmosphereNotes: asText(raw.atmosphereNotes) || '',
    evidenceSummary: asText(raw.evidenceSummary) || '',
  };
}

function normalizePlaceProfile(raw: any): PlaceProfile {
  return {
    placeIdentity: asText(raw.placeIdentity) || '',
    communityProfile: asText(raw.communityProfile) || '',
    culturalAssets: asTextList(raw.culturalAssets),
    commercialSupply: asText(raw.commercialSupply) || '',
    behaviouralSignals: asText(raw.behaviouralSignals) || '',
    unmetNeeds: asTextList(raw.unmetNeeds),
    evidenceQuality: ['strong', 'moderate', 'insufficient'].includes(raw.evidenceQuality) ? raw.evidenceQuality : 'moderate',
  };
}

function normalizeStrategy(raw: any, runId: string): Strategy {
  return {
    id: asText(raw.id) || generateId('strat'),
    analysisRunId: runId,
    selected: Boolean(raw.selected),
    direction: asText(raw.direction ?? raw.type) || 'mixed',
    title: asText(raw.title) || 'Untitled strategy',
    whoServes: asText(raw.whoServes ?? raw.who_serves),
    why: asText(raw.why),
    experienceThesis: asText(raw.experienceThesis ?? raw.experience_thesis),
    competitors: asTextList(raw.competitors),
    risks: asTextList(raw.risks),
    differentiation: asText(raw.differentiation),
    evidenceRefs: asTextList(raw.evidenceRefs ?? raw.evidence_refs),
    assumptions: asTextList(raw.assumptions),
    uncertainties: asTextList(raw.uncertainties),
    physicalExperience: asOptionalText(raw.physicalExperience ?? raw.physical_experience),
    qlooEstablished: asOptionalText(raw.qlooEstablished ?? raw.qloo_established),
    locallyEstablished: asOptionalText(raw.locallyEstablished ?? raw.locally_established),
    inferred: asOptionalText(raw.inferred),
    conceptType: asOptionalText(raw.conceptType),
    fitForAudience: asOptionalText(raw.fitForAudience),
    culturalRelationships: asTextList(raw.culturalRelationships),
    opportunityCaptured: asOptionalText(raw.opportunityCaptured),
    whyWeakerThanAlternatives: asOptionalText(raw.whyWeakerThanAlternatives),
    qlooEvidenceSummary: asOptionalText(raw.qlooEvidenceSummary),
    opportunityId: asOptionalText(raw.opportunityId),
    evidenceClaimIds: asTextList(raw.evidenceClaimIds ?? raw.evidence_claim_ids),
    decisionFit: asOptionalText(raw.decisionFit)
  };
}

function normalizeLandscapes(raw: any, fallback: any) {
  let source = raw && typeof raw === 'object' ? raw : fallback;
  if (Array.isArray(raw)) {
    source = {
      existing: raw.find((l: any) => l?.type === 'existing') || raw[0],
      potential: raw.find((l: any) => l?.type === 'potential') || raw[1],
      proposed: raw.find((l: any) => l?.type === 'proposed') || raw[2]
    };
  }
  const mapOne = (landscape: any, type: 'existing' | 'potential' | 'proposed') => {
    const value = landscape || fallback?.[type] || {};
    const quality = ['strong', 'moderate', 'insufficient'].includes(value.evidenceQuality)
      ? value.evidenceQuality
      : 'moderate';
    return {
      type,
      summary: asText(value.summary),
      experiences: (Array.isArray(value.experiences) ? value.experiences : []).map((e: any) => ({
        name: asText(e?.name ?? e),
        category: asOptionalText(e?.category),
        notes: asOptionalText(e?.notes),
        source: ['local', 'qloo', 'inference'].includes(e?.source) ? e.source : undefined,
        affinity: typeof e?.affinity === 'number' ? e.affinity : undefined
      })),
      audiencesServed: asTextList(value.audiencesServed),
      crowdedPatterns: asTextList(value.crowdedPatterns),
      gaps: asTextList(value.gaps),
      evidenceQuality: quality
    };
  };
  return {
    existing: mapOne(source?.existing, 'existing'),
    potential: mapOne(source?.potential, 'potential'),
    proposed: mapOne(source?.proposed, 'proposed')
  };
}

function normalizeAudienceAnalysis(raw: any, fallback: any) {
  const value = raw && typeof raw === 'object' ? raw : fallback || {};
  return {
    shared: asTextList(value.shared),
    complementary: asTextList(value.complementary),
    conflicting: asTextList(value.conflicting),
    spatialImplications: asText(value.spatialImplications)
  };
}

function buildStageStates(input: {
  qloo: QlooContext;
  location: Awaited<ReturnType<typeof gatherLocationContext>>;
  claims: any[];
  relationships: any[];
  opportunities: any[];
  strategies: any[];
  llmFailures?: StageLlmFailure[];
}): StageState[] {
  const now = nowIso();
  const qlooStatus: StageState['status'] =
    input.qloo.source === 'failed' || input.qloo.source === 'unavailable'
      ? 'failed'
      : input.qloo.insufficient
        ? 'degraded'
        : 'complete';
  const audienceClaims = input.claims.filter((claim) => claim.stage === 'audience_resolution');
  const failureFor = (stage: StageState['stage']) =>
    (input.llmFailures || []).find((entry) => entry.stage === stage)?.failure;
  const failureMessage = (failure?: LLMFailure) =>
    failure ? ` Live LLM stage failed; fallback used: ${failure.message}` : '';
  const placeFailure = failureFor('place_resolution');
  const opportunityFailure = failureFor('opportunities');
  const strategyFailure = failureFor('strategies');
  return [
    {
      stage: 'place_resolution' as const,
      status: placeFailure ? ('degraded' as const) : input.location.evidenceQuality === 'insufficient' ? ('degraded' as const) : ('complete' as const),
      source: placeFailure ? 'fallback' : 'local',
      quality: input.location.evidenceQuality,
      message: `Local inventory: ${input.location.pois.length} places observed.${failureMessage(placeFailure)}`,
      evidenceClaimIds: [],
      updatedAt: now
    },
    {
      stage: 'audience_resolution' as const,
      status: input.qloo.source === 'live' ? ('complete' as const) : (qlooStatus === 'failed' ? ('failed' as const) : ('degraded' as const)),
      source: input.qloo.source,
      quality: input.qloo.insufficient ? ('insufficient' as const) : ('moderate' as const),
      message: `${input.qloo.audienceResolutions?.length || 0} audience profiles, ${audienceClaims.length} audience claims.`,
      evidenceClaimIds: audienceClaims.map((claim) => claim.id),
      updatedAt: now
    },
    {
      stage: 'affinity_collection' as const,
      status: qlooStatus,
      source: input.qloo.source,
      quality: input.qloo.insufficient ? ('insufficient' as const) : ('moderate' as const),
      message: `${input.qloo.affinities.length} scored affinities.`,
      evidenceClaimIds: input.claims.filter((claim) => claim.evidenceType === 'qloo_affinity').map((claim) => claim.id),
      updatedAt: now
    },
    {
      stage: 'cultural_patterns' as const,
      status: qlooStatus,
      source: input.qloo.source,
      quality: input.qloo.insufficient ? ('insufficient' as const) : ('moderate' as const),
      message: `${input.qloo.culturalPatterns.length} inferred patterns.`,
      evidenceClaimIds: [],
      updatedAt: now
    },
    {
      stage: 'opportunities' as const,
      status: opportunityFailure ? ('degraded' as const) : input.opportunities.length ? ('complete' as const) : ('degraded' as const),
      source: opportunityFailure ? 'fallback' : 'inference',
      quality: input.qloo.insufficient ? ('insufficient' as const) : ('moderate' as const),
      message: `${input.opportunities.length} opportunity hypotheses, ${input.opportunities.filter((opportunity) => opportunity.eligible !== false).length} eligible.${failureMessage(opportunityFailure)}`,
      evidenceClaimIds: input.opportunities.flatMap((opportunity) => opportunity.evidenceClaimIds || []),
      updatedAt: now
    },
    {
      stage: 'strategies' as const,
      status: strategyFailure ? ('degraded' as const) : input.strategies.length ? ('complete' as const) : ('degraded' as const),
      source: strategyFailure ? 'fallback' : 'inference',
      quality: input.qloo.insufficient ? ('insufficient' as const) : ('moderate' as const),
      message: `${input.strategies.length} strategic directions.${failureMessage(strategyFailure)}`,
      evidenceClaimIds: input.strategies.flatMap((strategy) => strategy.evidenceClaimIds || []),
      updatedAt: now
    }
  ];
}

export class AgentOrchestrator {
  private llm: LLMProvider;

  constructor(llm?: LLMProvider) {
    this.llm = llm || createLLMProvider();
  }

  private async json<T>(prompt: string, fallback: T, system?: string, maxTokens = 2200): Promise<LlmCallResult<T>> {
    if (!this.llm.available) {
      return {
        value: fallback,
        failure: {
          kind: 'authentication',
          message: 'No LLM API key is configured.',
          model: 'unavailable',
          retryable: false
        }
      };
    }
    const extra = system || 'You are PlaceGraph. Return only valid JSON. Distinguish Qloo evidence, local evidence, inference, and uncertainty.';
    const trimmed = prompt.length > 120000 ? prompt.slice(0, 120000) + '\n\n[TRIMMED]' : prompt;
    console.info(`[llm] promptChars=${trimmed.length} maxTokens=${maxTokens}`);
    const resp = await this.llm.complete(
      [
        { role: 'system', content: extra },
        { role: 'user', content: trimmed }
      ],
      { json: true, maxTokens }
    );
    if (resp.failure) return { value: fallback, failure: resp.failure };
    if (!resp.content.trim()) {
      return {
        value: fallback,
        failure: {
          kind: 'parse',
          message: 'The LLM returned an empty response.',
          model: resp.model,
          retryable: false
        }
      };
    }
    const value = parseJsonFromLlm(resp.content, fallback);
    if (value === fallback) {
      return {
        value: fallback,
        failure: {
          kind: 'parse',
          message: 'The LLM response was not valid JSON; structured fallback was used.',
          model: resp.model,
          retryable: false
        }
      };
    }
    return { value };
  }

  async analyze(input: OrchestratorInput, onProgress?: ProgressFn): Promise<AnalysisSnapshot> {
    const runId = generateId('run');
    const isDiscoverMode = input.project.mode === 'discover';
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Cultural intelligence analysis started', { parentId: null });
    prov.setRoot(root.id);

    onProgress?.('place', 'Reading location and floor plan…');
    const locationContext = await gatherLocationContext(input.project);
    const [qlooContext, floorPlan] = await Promise.all([
      (async () => {
        if (input.noQloo) return withheldQlooContext(input.project);
        onProgress?.('culture', 'Gathering Qloo cultural relationships…');
        return gatherQlooContext(input.project, input.useMock, locationContext);
      })(),
      readFloorPlan(input.project, this.llm)
    ]);
    const culturalLabels = (qlooContext.culturalPatterns || []).map((pattern) => pattern.label);
    const gate = buildEvidenceGate({
      llmAvailable: this.llm.available,
      location: locationContext,
      qloo: qlooContext,
      project: input.project
    });

    // Keep prompts within the Groq free-tier token budget (8k TPM per model).
    const llmFailures: StageLlmFailure[] = [];
    const promptProject = compactProject(input.project);
    const promptLocation = compactLocation(locationContext);
    const promptQloo = compactQloo(qlooContext);
    const { profiles: organisationProfiles, primaryProfileId: resolvedPrimaryProfileId } =
      resolveOrganisationProfiles(input.project);
    const decisionFrame = resolveDecisionFrame(input.project);
    const relationshipResult = deriveCulturalRelationships({
      audiences: qlooContext.audienceResolutions || [],
      pois: locationContext.pois,
      placeAffinities: qlooContext.affinities,
      crossDomain: qlooContext.crossDomain,
      placeLabel: input.project.location.neighborhood || input.project.location.city || input.project.name,
      environment: qlooContext.environment
    });
    const evidenceClaims = [...(qlooContext.evidenceClaims || []), ...relationshipResult.claims];

    prov.create('external', `Location evidence: ${locationContext.evidenceQuality}. ${locationContext.notes.join(' ')}`, {
      parentId: root.id,
      metadata: { poiCount: locationContext.pois.length }
    });
    prov.create('qloo_evidence', `Qloo source=${qlooContext.source}. ${(qlooContext.notes || []).join(' ')}`, {
      parentId: root.id,
      qlooRefs: (qlooContext.affinities || []).slice(0, 8).map((a: any) => a.target)
    });
    prov.create('constraint', `Floor plan source=${floorPlan.source}. ${floorPlan.summary}`, { parentId: root.id });
    if (!gate.allowConfidentRecommendation) {
      prov.create('assumption', gate.warnings.join(' '), { parentId: root.id, confidence: 0.3 });
    }

    let snapshot: AnalysisSnapshot = {
      runId,
      projectId: input.project.id,
      status: 'analyzing',
      locationContext,
      qlooContext,
      floorPlan,
      evidenceGate: gate,
      intelligenceMode: gate.intelligenceMode,
      decisionFrame,
      organisationProfiles,
      primaryProfileId: resolvedPrimaryProfileId,
      audienceResolutions: qlooContext.audienceResolutions || [],
      evidenceClaims,
      relationships: relationshipResult.relationships,
      stageStates: [],
      deliverables: [],
      opportunities: [],
      strategies: [],
      requirements: [],
      decisions: [],
      visualizations: [],
      provenance: [],
      reviews: [],
      updatedAt: nowIso()
    };

    // Discover mode: run place investigation before landscape/opportunity prompts
    if (isDiscoverMode) {
      onProgress?.('place', 'Investigating place character and community profile…');
      const placeInvFallback = fallbackPlaceProfile(input.project, snapshot);
      const placeInvPrompt = replaceVars(PLACE_INVESTIGATION_PROMPT, {
        project: promptProject,
        locationContext: promptLocation,
        qlooContext: compactPromptQloo(qlooContext),
      });
      const placeInvResult = await this.json<any>(placeInvPrompt, placeInvFallback, undefined, 1600);
      if (placeInvResult.failure) llmFailures.push({ stage: 'place_resolution', failure: placeInvResult.failure });
      snapshot.placeProfile = normalizePlaceProfile(placeInvResult.value);
    }

    onProgress?.('opportunity', 'Comparing existing, potential and proposed cultural landscapes…');
    const landscapeFallback = fallbackLandscapes(input.project, snapshot);
    const landscapePrompt = replaceVars(LANDSCAPE_PROMPT, {
      project: promptProject,
      locationContext: promptLocation,
      qlooContext: promptQloo,
      audienceAffinities: JSON.stringify(promptQloo.audienceAffinities ?? {})
    });
    const landscapeResult = await this.json<any>(landscapePrompt, { landscapes: landscapeFallback, audienceAnalysis: {
      shared: input.project.audiences.map((a) => a.name),
      complementary: [],
      conflicting: [],
      spatialImplications: 'Shared affinities should inform public rooms; conflicting ones need separate zones.'
    }}, undefined, 2000);
    if (landscapeResult.failure) llmFailures.push({ stage: 'opportunities', failure: landscapeResult.failure });
    const landscapeJson = landscapeResult.value;

    snapshot.landscapes = normalizeLandscapes(landscapeJson.landscapes, landscapeFallback);
    if (snapshot.landscapes.potential) {
      const actual = affinityTargets(qlooContext);
      snapshot.landscapes.potential = {
        ...snapshot.landscapes.potential,
        summary: affinitySummary(input.project, qlooContext),
        experiences: actual.slice(0, 10).map((a: any) => ({
          name: a.target,
          category: a.genre || 'place',
          notes: `Scored Qloo affinity ${a.strength.toFixed(3)}${a.city ? ` · ${a.city}` : ''}`,
          source: 'qloo' as const,
          affinity: a.strength
        })),
        evidenceQuality: qlooContext.insufficient ? 'insufficient' : 'strong'
      };
    }
    snapshot.audienceAnalysis = normalizeAudienceAnalysis(landscapeJson.audienceAnalysis, {
      shared: [],
      complementary: [],
      conflicting: [],
      spatialImplications: ''
    });

    onProgress?.('opportunity', 'Forming opportunity hypotheses…');
    const oppFallback = fallbackOpportunities(input.project, runId, snapshot);
    const oppPrompt = replaceVars(OPPORTUNITY_ANALYSIS_PROMPT, {
      mode: isDiscoverMode ? 'DISCOVER' : 'EVALUATE',
      operatorContext: input.project.operatorType
        ? `Operator type: ${input.project.operatorType}. Tailor opportunity types to decisions this type of operator actually makes.`
        : '',
      project: promptProject,
      landscapes: compactPromptLandscapes(snapshot.landscapes),
      audienceAnalysis: snapshot.audienceAnalysis,
      locationContext: promptLocation,
      qlooContext: compactPromptQloo(qlooContext),
      relationships: compactRelationships(relationshipResult.relationships),
      hardConstraints: constraintPrompt(input.project)
    }) + (input.guidance ? `\nAdditional professional guidance:\n${input.guidance}` : '');
    const oppResult = await this.json<any>(oppPrompt, { opportunities: oppFallback }, undefined, 2200);
    if (oppResult.failure) llmFailures.push({ stage: 'opportunities', failure: oppResult.failure });
    const oppJson = oppResult.value;
    const opportunityRows = Array.isArray(oppJson.opportunities) ? oppJson.opportunities : oppFallback;
    const opportunities = opportunityRows
      .map((o: any) => normalizeOpportunity(o, runId))
      .map(
        (o: Opportunity) => sanitizeOpportunityConstraints([o], input.project, culturalLabels)[0]
      );
    snapshot.opportunities = opportunities
      .map((o: any) => ({
        ...o,
        qlooEstablished: sanitizeQlooList(o.qlooEstablished, qlooContext)
      }))
      .map((opportunity: Opportunity) => traceOpportunity(opportunity, relationshipResult.relationships));

    onProgress?.('strategy', 'Drafting distinct strategic directions…');
    const stratFallback = fallbackStrategies(input.project, runId, snapshot.opportunities, qlooContext);
    const stratPrompt = replaceVars(STRATEGY_GENERATION_PROMPT, {
      mode: isDiscoverMode ? 'DISCOVER' : 'EVALUATE',
      project: promptProject,
      opportunities: compactPromptOpportunities(snapshot.opportunities),
      landscapes: compactPromptLandscapes(snapshot.landscapes),
      audienceAnalysis: snapshot.audienceAnalysis,
      qlooContext: compactPromptQloo(qlooContext),
      relationships: compactRelationships(relationshipResult.relationships),
      hardConstraints: constraintPrompt(input.project)
    }) + (input.guidance ? `\nAdditional professional guidance:\n${input.guidance}` : '');
    let stratResult = await this.json<any>(stratPrompt, { strategies: stratFallback }, undefined, 2200);
    if (stratResult.failure) llmFailures.push({ stage: 'strategies', failure: stratResult.failure });

    // A single strategy is valid. Only retry when the model returned no array at all.
    if (!Array.isArray(stratResult.value.strategies)) {
      const retryPrompt = stratPrompt + '\n\nReturn only the genuinely distinct evidence-qualified strategies the analysis supports. Do not pad to a fixed count.';
      stratResult = await this.json<any>(retryPrompt, { strategies: stratFallback }, undefined, 1800);
      if (stratResult.failure) llmFailures.push({ stage: 'strategies', failure: stratResult.failure });
    }

    const stratJson = stratResult.value;
    const strategyRows = Array.isArray(stratJson.strategies) ? stratJson.strategies : stratFallback;
    const strategies = strategyRows
      .map((s: any) => normalizeStrategy(s, runId))
      .map((s: Strategy) => sanitizeStrategyConstraints(s, input.project, culturalLabels));
    snapshot.strategies = strategies
      .map((s: any) => ({
        ...s,
        qlooEstablished: sanitizeQlooText(s.qlooEstablished, qlooContext)
      }))
      .map((strategy: Strategy) => traceStrategy(strategy, snapshot.opportunities, relationshipResult.relationships));
    snapshot.strategies = applyConstraintFeasibility(snapshot.strategies, input.project);

    if (llmFailures.length) {
      const failureMessages = [...new Set(llmFailures.map((entry) => {
        const model = entry.failure.model ? ` (${entry.failure.model})` : '';
        return `${entry.stage}${model}: ${entry.failure.message}`;
      }))];
      gate.warnings = [...new Set([
        ...gate.warnings,
        `Live LLM reasoning was unavailable or degraded for ${llmFailures.length} stage${llmFailures.length === 1 ? '' : 's'}; structured fallback output was used.`,
        ...failureMessages
      ])];
      gate.allowConfidentRecommendation = false;
      gate.blockedReason = [
        gate.blockedReason,
        'One or more reasoning stages used structured fallback rather than live LLM output.'
      ].filter(Boolean).join(' ');
    }

    const decisionBrief = buildDecisionBrief({
      project: input.project,
      frame: decisionFrame,
      profiles: organisationProfiles,
      primaryProfileId: snapshot.primaryProfileId,
      location: locationContext,
      qloo: qlooContext,
      relationships: snapshot.relationships,
      opportunities: snapshot.opportunities,
      claims: evidenceClaims,
      gate
    });
    snapshot.decisionBrief = decisionBrief;
    snapshot.deliverables = decisionBrief.deliverables;
    snapshot.stageStates = buildStageStates({
      qloo: qlooContext,
      location: locationContext,
      claims: evidenceClaims,
      relationships: snapshot.relationships,
      opportunities: snapshot.opportunities.map((opportunity) => ({
        ...opportunity,
        eligible: opportunity.eligible !== false && gate.allowConfidentRecommendation
      })),
      strategies: snapshot.strategies,
      llmFailures
    });

    prov.create('inference', `Generated ${snapshot.opportunities.length} opportunities and ${snapshot.strategies.length} strategies`, {
      parentId: root.id
    });

    snapshot.status = 'ready';
    snapshot.provenance = prov.all();
    snapshot.updatedAt = nowIso();
    snapshot = applyEvidenceGateToSnapshot(snapshot, gate);
    onProgress?.('strategy', 'Cultural analysis ready for professional selection.');
    return snapshot;
  }

  async design(
    project: Project,
    analysis: AnalysisSnapshot,
    strategyId?: string,
    guidance?: string,
    onProgress?: ProgressFn
  ): Promise<AnalysisSnapshot> {
    const strategy =
      analysis.strategies.find((s) => s.id === (strategyId || analysis.selectedStrategyId)) ||
      analysis.strategies[0];
    const culturalLabels = (analysis.qlooContext?.culturalPatterns || []).map((pattern) => pattern.label);
    if (!strategy) throw new Error('No strategy available to design from');
    assertSpatialTranslationAllowed(project, analysis, strategy);

    const next: AnalysisSnapshot = {
      ...analysis,
      selectedStrategyId: strategy.id,
      strategies: analysis.strategies.map((s) => ({ ...s, selected: s.id === strategy.id })),
      status: 'designed',
      updatedAt: nowIso()
    };

    const operatorType = project.operatorType;

    // ── Retail brand: category strategy + format brief, no architecture ──────
    if (operatorType === 'retail') {
      onProgress?.('architecture', 'Building retail category strategy and format recommendation…');
      const retailFallback = fallbackRetailOutput(project, strategy);
      const retailPrompt = replaceVars(RETAIL_OUTPUT_PROMPT, {
        project: compactProject(project),
        strategy,
        qlooContext: compactQloo(analysis.qlooContext),
        audienceAnalysis: analysis.audienceAnalysis,
        locationContext: compactLocation(analysis.locationContext),
        hardConstraints: constraintPrompt(project)
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
      const retailResult = await this.json<any>(retailPrompt, retailFallback, undefined, 1800);
      if (retailResult.failure) {
        next.error = `Retail strategy used structured fallback: ${retailResult.failure.message}`;
      }
      next.retailOutput = normalizeRetailOutput(retailResult.value, project);
      next.provenance = [
        ...analysis.provenance,
        { id: generateId('prov'), kind: 'decision', explanation: `Retail strategy output derived from strategy "${strategy.title}"`, refs: [], qlooRefs: strategy.evidenceRefs }
      ];
      return next;
    }

    // ── Facility operator: programming model, no architecture ────────────────
    if (operatorType === 'operator') {
      onProgress?.('architecture', 'Building programming model and experience mix…');
      const operatorFallback = fallbackOperatorOutput(project, strategy);
      const operatorPrompt = replaceVars(OPERATOR_OUTPUT_PROMPT, {
        project: compactProject(project),
        strategy,
        qlooContext: compactQloo(analysis.qlooContext),
        audienceAnalysis: analysis.audienceAnalysis,
        locationContext: compactLocation(analysis.locationContext),
        hardConstraints: constraintPrompt(project)
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
      const operatorResult = await this.json<any>(operatorPrompt, operatorFallback, undefined, 1800);
      if (operatorResult.failure) {
        next.error = `Operator programming model used structured fallback: ${operatorResult.failure.message}`;
      }
      next.operatorOutput = normalizeOperatorOutput(operatorResult.value);
      next.provenance = [
        ...analysis.provenance,
        { id: generateId('prov'), kind: 'decision', explanation: `Operator programming model derived from strategy "${strategy.title}"`, refs: [], qlooRefs: strategy.evidenceRefs }
      ];
      return next;
    }

    // ── Developer / Hospitality: standard experience → architecture pipeline ─
    onProgress?.('experience', 'Translating strategy into experience requirements…');
    const reqFallback = fallbackRequirements(project, strategy);
    const reqPrompt =
      replaceVars(EXPERIENCE_REQ_PROMPT, {
        project: compactProject(project),
        strategy,
        audienceAnalysis: analysis.audienceAnalysis,
        floorPlan: compactFloorPlan(analysis.floorPlan),
        qlooContext: compactQloo(analysis.qlooContext),
        evidenceGate: analysis.evidenceGate,
        hardConstraints: constraintPrompt(project)
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
    const reqResult = await this.json<any>(reqPrompt, { requirements: reqFallback }, undefined, 1800);
    if (reqResult.failure) {
      next.error = `Experience requirements used structured fallback: ${reqResult.failure.message}`;
    }
    const reqJson = reqResult.value;
    const requirements: ExperienceRequirement[] = (reqJson.requirements || reqFallback).map((r: any) => ({
      id: asText(r.id) || generateId('req'),
      strategyId: strategy.id,
      requirement: asText(r.requirement),
      rationale: asText(r.rationale),
      priority: ['low', 'medium', 'high'].includes(r.priority) ? r.priority : 'medium',
      source: ['evidence', 'inference', 'constraint', 'operation'].includes(r.source) ? r.source : 'inference',
      zone: asOptionalText(r.zone)
    }));
    next.requirements = sanitizeRequirementConstraints(
      requirements.length ? requirements : reqFallback,
      project,
      culturalLabels
    );

    onProgress?.('architecture', 'Deriving architectural decisions from the experience…');
    const archFallback = fallbackArchitecture(project, strategy, next.requirements);
    const archPrompt =
      replaceVars(ARCHITECTURE_PROMPT, {
        project: compactProject(project),
        strategy,
        requirements: next.requirements,
        floorPlan: compactFloorPlan(analysis.floorPlan),
        qlooContext: compactQloo(analysis.qlooContext),
        evidenceGate: analysis.evidenceGate,
        hardConstraints: constraintPrompt(project)
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
    const archResult = await this.json<any>(archPrompt, archFallback, undefined, 2000);
    if (archResult.failure) {
      next.error = `Architectural decisions used structured fallback: ${archResult.failure.message}`;
    }
    const archJson = archResult.value;
    const decisions: ArchitecturalDecision[] = (archJson.decisions || archFallback.decisions).map((d: any) => ({
      id: asText(d.id) || generateId('dec'),
      strategyId: strategy.id,
      zone: asText(d.zone) || 'General',
      decision: asText(d.decision),
      whyChain: (Array.isArray(d.whyChain) ? d.whyChain : []).map((n: any) => ({
        id: asText(n?.id) || generateId('prov'),
        parentId: asOptionalText(n?.parentId),
        kind: ['qloo_evidence', 'inference', 'assumption', 'decision', 'external', 'constraint'].includes(n?.kind)
          ? n.kind
          : 'decision',
        explanation: asText(n?.explanation ?? n),
        refs: asTextList(n?.refs),
        qlooRefs: asTextList(n?.qlooRefs)
      })),
      alternatives: asTextList(d.alternatives),
      constraintsConsidered: asTextList(d.constraintsConsidered),
      qlooEstablished: sanitizeQlooText(d.qlooEstablished, analysis.qlooContext),
      locallyEstablished: asOptionalText(d.locallyEstablished),
      inferred: asOptionalText(d.inferred),
      unverified: asOptionalText(d.unverified)
    }));
    const rawConcept = archJson.concept || archFallback.concept;
    const concept: SpatialConcept = ensureLayout(
      project,
      {
        organization: asText(rawConcept?.organization),
        zones: (Array.isArray(rawConcept?.zones) ? rawConcept.zones : []).map((z: any) => ({
          name: asText(z?.name),
          purpose: asText(z?.purpose),
          character: asOptionalText(z?.character),
          adjacency: asOptionalText(z?.adjacency)
        })),
        materials: asTextList(rawConcept?.materials),
        lighting: asTextList(rawConcept?.lighting),
        furniture: asTextList(rawConcept?.furniture),
        circulation: asOptionalText(rawConcept?.circulation),
        exterior: asOptionalText(rawConcept?.exterior),
        opsNotes: asTextList(rawConcept?.opsNotes)
      },
      analysis.floorPlan
    );
    next.decisions = sanitizeDecisionConstraints(decisions, project, culturalLabels);
    next.concept = sanitizeConceptConstraints(concept, project, culturalLabels);
    next.provenance = [
      ...analysis.provenance,
      {
        id: generateId('prov'),
        kind: 'decision',
        explanation: `Architectural concept derived from strategy "${strategy.title}"`,
        refs: next.requirements.map((r) => r.id),
        qlooRefs: strategy.evidenceRefs
      }
    ];

    // ── Hospitality: add concept identity + F&B strategy on top of architecture
    if (operatorType === 'hospitality') {
      onProgress?.('hospitality', 'Formalising hospitality concept identity, F&B strategy, and programming model…');
      const hospitalityFallback = fallbackHospitalityOutput(project, strategy);
      const hospitalityPrompt = replaceVars(HOSPITALITY_OUTPUT_PROMPT, {
        project: compactProject(project),
        strategy,
        requirements: next.requirements,
        concept: next.concept,
        qlooContext: compactQloo(analysis.qlooContext),
        audienceAnalysis: analysis.audienceAnalysis,
        hardConstraints: constraintPrompt(project)
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
      const hospitalityResult = await this.json<any>(hospitalityPrompt, hospitalityFallback, undefined, 1600);
      if (hospitalityResult.failure) {
        next.error = `Hospitality output used structured fallback: ${hospitalityResult.failure.message}`;
      }
      next.hospitalityOutput = normalizeHospitalityOutput(hospitalityResult.value);
    }

    return next;
  }

  async visualize(project: Project, analysis: AnalysisSnapshot, onProgress?: ProgressFn): Promise<AnalysisSnapshot> {
    const strategy = analysis.strategies.find((s) => s.selected) || analysis.strategies[0];
    onProgress?.('visualization', 'Generating spatial diagram from the reasoning chain…');
    const vis = new VisualizationService();
    const result = await vis.generateVisualization({
      project,
      strategy,
      decisions: analysis.decisions,
      concept: analysis.concept,
      requirements: analysis.requirements
    });
    return {
      ...analysis,
      status: 'visualized',
      visualizations: [
        {
          id: generateId('viz'),
          prompt: result.prompt,
          images: result.images,
          viewLabels: result.views.map((view) => view.label),
          model: result.model,
          createdAt: nowIso()
        },
        ...analysis.visualizations
      ],
      provenance: [...analysis.provenance, ...result.prov.all()],
      updatedAt: nowIso()
    };
  }

  async review(
    project: Project,
    analysis: AnalysisSnapshot,
    feedback: string,
    onProgress?: ProgressFn
  ): Promise<AnalysisSnapshot> {
    const strategy = analysis.strategies.find((s) => s.selected) || analysis.strategies[0];
    const classifiedResult = await this.json<any>(
      replaceVars(REVIEW_PROMPT, {
        project: compactProject(project),
        strategy,
        requirements: analysis.requirements,
        decisions: analysis.decisions,
        concept: analysis.concept,
        qlooContext: compactQloo(analysis.qlooContext),
        feedback
      }),
      {
        chainLevel: 'architecture',
        diagnosis: 'Feedback captured; defaulting to architectural revision.',
        guidance: feedback
      },
      undefined,
      1200
    );
    const classified = classifiedResult.value;

    const before = reviewClip(analysis);
    const chainLevels = ['evidence', 'opportunity', 'strategy', 'experience', 'architecture', 'visualization'];
    const review: Review = {
      id: generateId('rev'),
      feedback,
      chainLevel: chainLevels.includes(classified.chainLevel) ? classified.chainLevel : 'architecture',
      diagnosis: asText(classified.diagnosis),
      guidance: asOptionalText(classified.guidance),
      resolved: true,
      createdAt: nowIso(),
      before
    };

    const guidance = `${classified.diagnosis}\n\nGuidance:\n${classified.guidance || feedback}`;
    let next = { ...analysis, reviews: [review, ...analysis.reviews], status: 'review' as const };

    const level = review.chainLevel;
    onProgress?.('review', `Revising from ${level}: ${classified.diagnosis}`);
    if (level === 'evidence' || level === 'opportunity' || level === 'strategy') {
      next = await this.analyze({ project, guidance }, onProgress) as typeof next;
      next.reviews = [review, ...analysis.reviews];
      if (analysis.selectedStrategyId) {
        const match =
          next.strategies.find((s) => s.direction === strategy?.direction) || next.strategies[0];
        if (match) next = await this.design(project, next, match.id, guidance, onProgress) as typeof next;
      }
    } else if (level === 'experience' || level === 'architecture') {
      next = await this.design(project, next, analysis.selectedStrategyId, guidance, onProgress) as typeof next;
    } else {
      next = await this.visualize(project, next, onProgress) as typeof next;
    }

    next.status = 'review';
    const after = reviewClip(next);
    const stamped = { ...review, after };
    next.reviews = [stamped, ...(next.reviews || []).filter((r) => r.id !== review.id)];
    return next;
  }

  async counterfactual(project: Project, cultural: AnalysisSnapshot): Promise<AnalysisSnapshot> {
    const generic = await this.analyze({
      project,
      noQloo: true,
      guidance:
        'Qloo is unavailable for this analysis. Reason only from ordinary architectural knowledge, nearby businesses, and the brief. Do not invent cultural affinities, artists, brands, or scores.'
    });

    const genericTop = generic.strategies.find((s) => s.selected) || generic.strategies[0];
    const culturalTop =
      cultural.strategies.find((s) => s.id === cultural.selectedStrategyId) || cultural.strategies[0];
    const targets = affinityTargets(cultural.qlooContext).slice(0, 5);
    const place = project.location.neighborhood || project.location.city || project.name;
    const genericTitle = genericTop?.title || 'No strategy was generated';
    const culturalTitle = culturalTop?.title || 'No strategy was generated';
    const targetList = targets.map((a) => `${a.target} (${a.strength.toFixed(3)})`).join(', ');
    const thesis = cultural.qlooContext?.culturalThesis?.trim();

    const degradedStages = [...(generic.stageStates || []), ...(cultural.stageStates || [])]
      .filter((stage) => stage.status === 'degraded' || stage.status === 'failed')
      .map((stage) => stage.stage);
    const summary = targets.length
      ? `Generic analysis without Qloo produced "${genericTitle}" from the brief, local observation and inference. The Qloo run produced "${culturalTitle}" and cites ${targets.length} scored place affinities around ${place}: ${targetList}. This is a single paired comparison; it shows which evidence the Qloo run cites, not that Qloo caused a different commercial decision.${degradedStages.length ? ` Degraded stages were present: ${[...new Set(degradedStages)].join(', ')}.` : ''}`
      : `Generic analysis without Qloo produced "${genericTitle}". The Qloo pass returned no scored place affinities around ${place}, so it added no cultural graph evidence.`;

    return {
      ...cultural,
      counterfactual: {
        summary,
        genericStrategy: genericTop
          ? `${genericTitle} — ${genericTop.direction}. Generic AI/business analysis based only on local observation, the brief and inference (no Qloo cultural intelligence).`
          : genericTitle,
        culturalStrategy: culturalTop
          ? `${culturalTitle} — ${culturalTop.direction}.${targetList ? ` Qloo-informed: cites scored place affinities: ${targetList}.` : ' No scored place affinities were available.'}${thesis ? ` Cultural thesis: ${thesis}` : ''}`
          : culturalTitle,
        whatQlooChanged: counterfactualChanges(generic, cultural).length
          ? counterfactualChanges(generic, cultural)
          : targets.length
            ? [`The Qloo run cites scored affinities (${targetList}) that the generic run cannot cite. This does not establish that Qloo caused a changed decision.`]
            : ['No scored Qloo affinities were available; the difference is limited to how evidence is framed.'],
        caveat: 'This is a single paired comparison. Prompt size, LLM availability, model variation, and local POI variation can all differ between runs. Repeat controlled runs with matched model availability before attributing any decision change to Qloo. Scored affinity data is real; causal claims are not established here.'
      },
      updatedAt: nowIso()
    };
  }

  // Back-compat wrappers used by older routes
  async discoverOpportunities(input: OrchestratorInput) {
    const analysis = await this.analyze(input);
    return { opportunities: analysis.opportunities, qlooContext: analysis.qlooContext, analysis };
  }

  async generateStrategies(input: OrchestratorInput & { opportunities: any[] }) {
    const analysis = await this.analyze(input);
    return { strategies: analysis.strategies, analysis };
  }

  async generateExperienceRequirements(input: OrchestratorInput & { strategy: any }) {
    const stub: AnalysisSnapshot = {
      runId: generateId('run'),
      projectId: input.project.id,
      status: 'strategy_selected',
      organisationProfiles: resolveOrganisationProfiles(input.project).profiles,
      primaryProfileId: resolveOrganisationProfiles(input.project).primaryProfileId,
      decisionFrame: resolveDecisionFrame(input.project),
      audienceResolutions: [],
      evidenceClaims: [],
      relationships: [],
      stageStates: [],
      deliverables: [],
      opportunities: [],
      strategies: [{ ...input.strategy, selected: true }],
      selectedStrategyId: input.strategy.id,
      requirements: [],
      decisions: [],
      visualizations: [],
      provenance: [],
      reviews: [],
      updatedAt: nowIso()
    };
    const designed = await this.design(input.project, stub, input.strategy.id);
    return { requirements: designed.requirements };
  }

  async generateArchitecturalConcept(input: OrchestratorInput & { strategy: any; requirements?: any[] }) {
    const stub: AnalysisSnapshot = {
      runId: generateId('run'),
      projectId: input.project.id,
      status: 'strategy_selected',
      organisationProfiles: resolveOrganisationProfiles(input.project).profiles,
      primaryProfileId: resolveOrganisationProfiles(input.project).primaryProfileId,
      decisionFrame: resolveDecisionFrame(input.project),
      audienceResolutions: [],
      evidenceClaims: [],
      relationships: [],
      stageStates: [],
      deliverables: [],
      opportunities: [],
      strategies: [{ ...input.strategy, selected: true }],
      selectedStrategyId: input.strategy.id,
      requirements: input.requirements || [],
      decisions: [],
      visualizations: [],
      provenance: [],
      reviews: [],
      updatedAt: nowIso()
    };
    const designed = await this.design(input.project, stub, input.strategy.id);
    return { decisions: designed.decisions, concept: designed.concept, requirements: designed.requirements };
  }
}
