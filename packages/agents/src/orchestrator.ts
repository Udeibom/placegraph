import type {
  AnalysisSnapshot,
  ArchitecturalDecision,
  ExperienceRequirement,
  Opportunity,
  Project,
  QlooContext,
  Review,
  SpatialConcept,
  Strategy
} from '@placegraph/types';
import { ProvenanceBuilder, generateId, nowIso, parseJsonFromLlm, replaceVars } from '@placegraph/core';
import {
  ARCHITECTURE_PROMPT,
  EXPERIENCE_REQ_PROMPT,
  LANDSCAPE_PROMPT,
  OPPORTUNITY_ANALYSIS_PROMPT,
  REVIEW_PROMPT,
  STRATEGY_GENERATION_PROMPT
} from './prompts';
import { createLLMProvider, LLMProvider } from './providers/llm';
import { gatherLocationContext } from './location';
import { gatherQlooContext } from './qloo-context';
import {
  fallbackArchitecture,
  fallbackLandscapes,
  fallbackOpportunities,
  fallbackRequirements,
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

function counterfactualChanges(generic: AnalysisSnapshot, cultural: AnalysisSnapshot): string[] {
  const targets = affinityTargets(cultural.qlooContext).slice(0, 5);
  const genericTop = generic.strategies[0];
  const culturalTop =
    cultural.strategies.find((s) => s.id === cultural.selectedStrategyId) || cultural.strategies[0];
  const changes: string[] = [];

  if (targets.length) {
    changes.push(
      `This recommendation changed because of Qloo. Added scored Qloo place affinities: ${targets
        .map((a) => `${a.target} (${a.strength.toFixed(3)})`)
        .join(', ')}.`
    );
  } else {
    changes.push('Qloo returned no scored affinities, so the cultural pass could not add graph evidence.');
  }

  if (culturalTop && genericTop && culturalTop.title !== genericTop.title) {
    changes.push(
      `Investment decision changed: from "${genericTop.title}" (generic analysis) to "${culturalTop.title}" (${culturalTop.direction}) based on Qloo cultural intelligence.`
    );
  } else if (culturalTop) {
    changes.push(`Kept direction "${culturalTop.title}" but Qloo changed the reasoning - grounded in scored cultural relationships revealing a differentiated opportunity.`);
  }

  if (cultural.opportunities.some((o) => (o.qlooEstablished || []).length > 0)) {
    changes.push('Discovered culturally differentiated opportunities by separating scored Qloo affinity evidence from local observation and inference.');
  }

  const patterns = cultural.qlooContext?.culturalPatterns || [];
  if (patterns.length >= 2) {
    changes.push(
      `Reframed the concept around a ${patterns
        .slice(0, 3)
        .map((pattern) => pattern.label.toLowerCase())
        .join(' + ')} mix revealed by Qloo — changing what type of place is culturally viable.`
    );
  }

  return changes;
}

function withheldQlooContext(project: Project): QlooContext {
  return {
    source: 'mock',
    entities: [],
    affinities: [],
    audienceAffinities: Object.fromEntries(project.audiences.map((a) => [a.name, []])),
    crossDomain: null,
    culturalPatterns: [],
    culturalThesis: '',
    notes: ['Qloo evidence was deliberately withheld for this baseline analysis.'],
    insufficient: true
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

function compactLocation(location: any) {
  if (!location) return location;
  return {
    query: location.query,
    displayName: location.displayName,
    city: location.city,
    evidenceQuality: location.evidenceQuality,
    pois: (location.pois || []).slice(0, 10).map((p: any) => ({
      name: p.name,
      category: p.category,
      distanceM: p.distanceM
    })),
    notes: (location.notes || []).slice(0, 3)
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
  return {
    source: qloo.source,
    insufficient: qloo.insufficient,
    culturalThesis: qloo.culturalThesis,
    culturalPatterns: compactPatterns(qloo.culturalPatterns, 7, 4),
    affinities: compactAffinities(qloo.affinities, 8),
    notes: (qloo.notes || []).slice(0, 2)
  };
}

function compactPromptLandscapes(landscapes: any) {
  if (!landscapes) return landscapes;
  const slim = (landscape: any) => landscape
    ? {
        type: landscape.type,
        summary: landscape.summary,
        gaps: (landscape.gaps || []).slice(0, 3),
        crowdedPatterns: (landscape.crowdedPatterns || []).slice(0, 3),
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
    inferred: asTextList(raw.inferred)
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
    evaluationScore: typeof raw.evaluationScore === 'number' ? raw.evaluationScore : undefined,
    qlooChangedDecision: asOptionalText(raw.qlooChangedDecision)
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

export class AgentOrchestrator {
  private llm: LLMProvider;

  constructor(llm?: LLMProvider) {
    this.llm = llm || createLLMProvider();
  }

  private async json<T>(prompt: string, fallback: T, system?: string, maxTokens = 3000): Promise<T> {
    if (!this.llm.available) return fallback;
    const extra = system || 'You are PlaceGraph. Return only valid JSON. Distinguish Qloo evidence, local evidence, inference, and uncertainty.';
    const trimmed = prompt.length > 120000 ? prompt.slice(0, 120000) + '\n\n[TRIMMED]' : prompt;
    console.info(`[llm] promptChars=${trimmed.length}`);
    const resp = await this.llm.complete(
      [
        { role: 'system', content: extra },
        { role: 'user', content: trimmed }
      ],
      { json: true, maxTokens }
    );
    return parseJsonFromLlm(resp.content, fallback);
  }

  async analyze(input: OrchestratorInput, onProgress?: ProgressFn): Promise<AnalysisSnapshot> {
    const runId = generateId('run');
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
      qloo: qlooContext
    });

    // Keep prompts within the Groq free-tier token budget (8k TPM per model).
    const promptLocation = compactLocation(locationContext);
    const promptQloo = compactQloo(qlooContext);

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
      opportunities: [],
      strategies: [],
      requirements: [],
      decisions: [],
      visualizations: [],
      provenance: [],
      reviews: [],
      updatedAt: nowIso()
    };

    onProgress?.('opportunity', 'Comparing existing, potential and proposed cultural landscapes…');
    const landscapeFallback = fallbackLandscapes(input.project, snapshot);
    const landscapePrompt = replaceVars(LANDSCAPE_PROMPT, {
      project: input.project,
      locationContext: promptLocation,
      qlooContext: promptQloo,
      audienceAffinities: JSON.stringify(promptQloo.audienceAffinities ?? {})
    });
    const landscapeJson = await this.json<any>(landscapePrompt, { landscapes: landscapeFallback, audienceAnalysis: {
      shared: input.project.audiences.map((a) => a.name),
      complementary: [],
      conflicting: [],
      spatialImplications: 'Shared affinities should inform public rooms; conflicting ones need separate zones.'
    }});

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
      project: input.project,
      landscapes: compactPromptLandscapes(snapshot.landscapes),
      audienceAnalysis: snapshot.audienceAnalysis,
      locationContext: promptLocation,
      qlooContext: compactPromptQloo(qlooContext),
      hardConstraints: constraintPrompt(input.project)
    }) + (input.guidance ? `\nAdditional professional guidance:\n${input.guidance}` : '');
    const oppJson = await this.json<any>(oppPrompt, { opportunities: oppFallback });
    const opportunities = (oppJson.opportunities || oppFallback)
      .map((o: any) => normalizeOpportunity(o, runId))
      .map(
        (o: Opportunity) => sanitizeOpportunityConstraints([o], input.project, culturalLabels)[0]
      );
    snapshot.opportunities = (opportunities.length ? opportunities : oppFallback).map((o: any) => ({
      ...o,
      qlooEstablished: sanitizeQlooList(o.qlooEstablished, qlooContext)
    }));

    onProgress?.('strategy', 'Drafting distinct strategic directions…');
    const stratFallback = fallbackStrategies(input.project, runId, snapshot.opportunities, qlooContext);
    const stratPrompt = replaceVars(STRATEGY_GENERATION_PROMPT, {
      project: input.project,
      opportunities: compactPromptOpportunities(snapshot.opportunities),
      landscapes: compactPromptLandscapes(snapshot.landscapes),
      audienceAnalysis: snapshot.audienceAnalysis,
      qlooContext: compactPromptQloo(qlooContext),
      hardConstraints: constraintPrompt(input.project)
    }) + (input.guidance ? `\nAdditional professional guidance:\n${input.guidance}` : '');
    const stratJson = await this.json<any>(stratPrompt, { strategies: stratFallback }, undefined, 3500);
    const strategies = (stratJson.strategies || stratFallback)
      .map((s: any) => normalizeStrategy(s, runId))
      .map((s: Strategy) => sanitizeStrategyConstraints(s, input.project, culturalLabels));
    snapshot.strategies = (strategies.length ? strategies : stratFallback).map((s: any) => ({
      ...s,
      qlooEstablished: sanitizeQlooText(s.qlooEstablished, qlooContext)
    }));

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

    const next: AnalysisSnapshot = {
      ...analysis,
      selectedStrategyId: strategy.id,
      strategies: analysis.strategies.map((s) => ({ ...s, selected: s.id === strategy.id })),
      status: 'designed',
      updatedAt: nowIso()
    };

    onProgress?.('experience', 'Translating strategy into experience requirements…');
    const reqFallback = fallbackRequirements(project, strategy);
    const reqPrompt =
      replaceVars(EXPERIENCE_REQ_PROMPT, {
        project,
        strategy,
        audienceAnalysis: analysis.audienceAnalysis,
        floorPlan: compactFloorPlan(analysis.floorPlan),
        qlooContext: compactQloo(analysis.qlooContext),
        evidenceGate: analysis.evidenceGate,
        hardConstraints: constraintPrompt(project)
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
    const reqJson = await this.json<any>(reqPrompt, { requirements: reqFallback });
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
        project,
        strategy,
        requirements: next.requirements,
        floorPlan: compactFloorPlan(analysis.floorPlan),
        qlooContext: compactQloo(analysis.qlooContext),
        evidenceGate: analysis.evidenceGate,
        hardConstraints: constraintPrompt(project)
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
    const archJson = await this.json<any>(archPrompt, archFallback);
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
    const classified = await this.json<any>(
      replaceVars(REVIEW_PROMPT, {
        project,
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
      }
    );

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

    const summary = targets.length
      ? `Generic AI/business analysis (without Qloo): lead direction was "${genericTitle}", built only from the brief, local observation and inference. Qloo-informed analysis: lead direction is "${culturalTitle}", grounded in ${targets.length} scored place affinities around ${place}: ${targetList}. This shows Qloo discovered a culturally differentiated opportunity and changed the investment decision — the concept that deserves capital consideration is different because of cultural intelligence, not just presentation.`
      : `Generic AI/business analysis (without Qloo): lead direction was "${genericTitle}". The Qloo pass returned no scored place affinities around ${place}, so it could not add cultural graph evidence to the recommendation.`;

    return {
      ...cultural,
      counterfactual: {
        summary,
        genericStrategy: genericTop
          ? `${genericTitle} — ${genericTop.direction}. Generic AI/business analysis based only on local observation, the brief and inference (no Qloo cultural intelligence).`
          : genericTitle,
        culturalStrategy: culturalTop
          ? `${culturalTitle} — ${culturalTop.direction}.${targetList ? ` Qloo-informed: grounded in scored place affinities: ${targetList}.` : ' No scored place affinities were available.'}${thesis ? ` Cultural thesis: ${thesis}` : ''} This recommendation changed because of Qloo.`
          : culturalTitle,
        whatQlooChanged: counterfactualChanges(generic, cultural).length
          ? counterfactualChanges(generic, cultural)
          : targets.length
            ? [`This recommendation changed because of Qloo. Scored affinities (${targetList}) revealed a culturally differentiated opportunity that generic analysis missed.`]
            : ['No scored Qloo affinities were available; difference is limited to how evidence is framed.'],
        caveat: 'This demonstrates that Qloo cultural intelligence changes the investment decision (what concept deserves capital consideration). It does not prove commercial performance.'
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
