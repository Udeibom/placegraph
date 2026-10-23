import type {
  AnalysisSnapshot,
  ArchitecturalDecision,
  ExperienceRequirement,
  Opportunity,
  Project,
  Review,
  SpatialConcept,
  Strategy
} from '@placegraph/types';
import { ProvenanceBuilder, generateId, nowIso, parseJsonFromLlm, replaceVars } from '@placegraph/core';
import {
  ARCHITECTURE_PROMPT,
  COUNTERFACTUAL_PROMPT,
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

export interface OrchestratorInput {
  project: Project;
  useMock?: boolean;
  guidance?: string;
}

export type ProgressFn = (stage: string, message: string) => void;

function reviewClip(analysis: AnalysisSnapshot) {
  return {
    strategyTitle: (analysis.strategies.find((s) => s.selected) || analysis.strategies[0])?.title,
    requirementCount: analysis.requirements.length,
    decisionSummaries: analysis.decisions.slice(0, 6).map((d) => `${d.zone}: ${d.decision}`)
  };
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
    domain: a.domain
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
    notes: (qloo.notes || []).slice(0, 3)
  };
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
    id: raw.id || generateId('opp'),
    analysisRunId: runId,
    type: ['alignment', 'whitespace', 'destination', 'mixed'].includes(raw.type) ? raw.type : 'mixed',
    title: raw.title || 'Untitled opportunity',
    whoServes: raw.whoServes || raw.who_serves || '',
    why: raw.why || '',
    evidenceRefs: raw.evidenceRefs || raw.evidence_refs || [],
    assumptions: raw.assumptions || [],
    uncertainties: raw.uncertainties || [],
    competitors: raw.competitors || [],
    rationale: raw.rationale || '',
    qlooEstablished: raw.qlooEstablished || [],
    locallyEstablished: raw.locallyEstablished || [],
    inferred: raw.inferred || []
  };
}

function normalizeStrategy(raw: any, runId: string): Strategy {
  return {
    id: raw.id || generateId('strat'),
    analysisRunId: runId,
    selected: Boolean(raw.selected),
    direction: raw.direction || raw.type || 'mixed',
    title: raw.title || 'Untitled strategy',
    whoServes: raw.whoServes || raw.who_serves || '',
    why: raw.why || '',
    experienceThesis: raw.experienceThesis || raw.experience_thesis || '',
    competitors: raw.competitors || [],
    risks: raw.risks || [],
    differentiation: raw.differentiation || '',
    evidenceRefs: raw.evidenceRefs || raw.evidence_refs || [],
    assumptions: raw.assumptions || [],
    uncertainties: raw.uncertainties || [],
    physicalExperience: raw.physicalExperience || raw.physical_experience,
    qlooEstablished: raw.qlooEstablished || raw.qloo_established || undefined,
    locallyEstablished: raw.locallyEstablished || raw.locally_established || undefined,
    inferred: raw.inferred || undefined,
  };
}

export class AgentOrchestrator {
  private llm: LLMProvider;

  constructor(llm?: LLMProvider) {
    this.llm = llm || createLLMProvider();
  }

  private async json<T>(prompt: string, fallback: T, system?: string): Promise<T> {
    if (!this.llm.available) return fallback;
    const extra = system || 'You are PlaceGraph. Return only valid JSON. Distinguish Qloo evidence, local evidence, inference, and uncertainty.';
    const trimmed = prompt.length > 120000 ? prompt.slice(0, 120000) + '\n\n[TRIMMED]' : prompt;
    console.info(`[llm] promptChars=${trimmed.length}`);
    const resp = await this.llm.complete(
      [
        { role: 'system', content: extra },
        { role: 'user', content: trimmed }
      ],
      { json: true, maxTokens: 3000 }
    );
    return parseJsonFromLlm(resp.content, fallback);
  }

  async analyze(input: OrchestratorInput, onProgress?: ProgressFn): Promise<AnalysisSnapshot> {
    const runId = generateId('run');
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Cultural intelligence analysis started', { parentId: null });
    prov.setRoot(root.id);

    onProgress?.('place', 'Reading location and floor plan…');
    const [locationContext, qlooContext, floorPlan] = await Promise.all([
      gatherLocationContext(input.project),
      (async () => {
        onProgress?.('culture', 'Gathering Qloo cultural relationships…');
        return gatherQlooContext(input.project, input.useMock);
      })(),
      readFloorPlan(input.project, this.llm)
    ]);
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

    snapshot.landscapes = landscapeJson.landscapes || landscapeFallback;
    snapshot.audienceAnalysis = landscapeJson.audienceAnalysis || {
      shared: [],
      complementary: [],
      conflicting: [],
      spatialImplications: ''
    };

    onProgress?.('opportunity', 'Forming opportunity hypotheses…');
    const oppFallback = fallbackOpportunities(input.project, runId, snapshot);
    const oppPrompt = replaceVars(OPPORTUNITY_ANALYSIS_PROMPT, {
      project: input.project,
      landscapes: snapshot.landscapes,
      audienceAnalysis: snapshot.audienceAnalysis,
      locationContext: promptLocation,
      qlooContext: promptQloo
    }) + (input.guidance ? `\nAdditional professional guidance:\n${input.guidance}` : '');
    const oppJson = await this.json<any>(oppPrompt, { opportunities: oppFallback });
    const opportunities = (oppJson.opportunities || oppFallback).map((o: any) => normalizeOpportunity(o, runId));
    snapshot.opportunities = opportunities.length ? opportunities : oppFallback;

    onProgress?.('strategy', 'Drafting distinct strategic directions…');
    const stratFallback = fallbackStrategies(input.project, runId, snapshot.opportunities);
    const stratPrompt = replaceVars(STRATEGY_GENERATION_PROMPT, {
      project: input.project,
      opportunities: snapshot.opportunities,
      landscapes: snapshot.landscapes,
      audienceAnalysis: snapshot.audienceAnalysis,
      qlooContext: promptQloo
    }) + (input.guidance ? `\nAdditional professional guidance:\n${input.guidance}` : '');
    const stratJson = await this.json<any>(stratPrompt, { strategies: stratFallback });
    const strategies = (stratJson.strategies || stratFallback).map((s: any) => normalizeStrategy(s, runId));
    snapshot.strategies = strategies.length ? strategies : stratFallback;

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
        evidenceGate: analysis.evidenceGate
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
    const reqJson = await this.json<any>(reqPrompt, { requirements: reqFallback });
    const requirements: ExperienceRequirement[] = (reqJson.requirements || reqFallback).map((r: any) => ({
      id: r.id || generateId('req'),
      strategyId: strategy.id,
      requirement: r.requirement || '',
      rationale: r.rationale || '',
      priority: r.priority || 'medium',
      source: r.source || 'inference',
      zone: r.zone
    }));
    next.requirements = requirements.length ? requirements : reqFallback;

    onProgress?.('architecture', 'Deriving architectural decisions from the experience…');
    const archFallback = fallbackArchitecture(project, strategy, next.requirements);
    const archPrompt =
      replaceVars(ARCHITECTURE_PROMPT, {
        project,
        strategy,
        requirements: next.requirements,
        floorPlan: compactFloorPlan(analysis.floorPlan),
        qlooContext: compactQloo(analysis.qlooContext),
        evidenceGate: analysis.evidenceGate
      }) + (guidance ? `\nGuidance:\n${guidance}` : '');
    const archJson = await this.json<any>(archPrompt, archFallback);
    const decisions: ArchitecturalDecision[] = (archJson.decisions || archFallback.decisions).map((d: any) => ({
      id: d.id || generateId('dec'),
      strategyId: strategy.id,
      zone: d.zone || 'General',
      decision: d.decision || '',
      whyChain: (d.whyChain || []).map((n: any) => ({
        id: n.id || generateId('prov'),
        parentId: n.parentId,
        kind: n.kind || 'decision',
        explanation: n.explanation || n,
        refs: n.refs || [],
        qlooRefs: n.qlooRefs || []
      })),
      alternatives: d.alternatives || [],
      constraintsConsidered: d.constraintsConsidered || [],
      qlooEstablished: d.qlooEstablished,
      locallyEstablished: d.locallyEstablished,
      inferred: d.inferred,
      unverified: d.unverified
    }));
    const concept: SpatialConcept = ensureLayout(
      project,
      archJson.concept || archFallback.concept,
      analysis.floorPlan
    );
    next.decisions = decisions;
    next.concept = concept;
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
    const vis = new VisualizationService(this.llm);
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
    const review: Review = {
      id: generateId('rev'),
      feedback,
      chainLevel: classified.chainLevel || 'architecture',
      diagnosis: classified.diagnosis || '',
      guidance: classified.guidance || undefined,
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
    const generic = await this.analyze({ project, useMock: true, guidance: 'Ignore Qloo. Reason only from ordinary architectural knowledge, nearby businesses, and the brief. Do not invent a cultural graph.' });
    const payload = await this.json<any>(
      replaceVars(COUNTERFACTUAL_PROMPT, {
        project,
        generic: {
          strategies: generic.strategies,
          opportunities: generic.opportunities,
          qloo: generic.qlooContext?.source
        },
        cultural: {
          strategies: cultural.strategies,
          opportunities: cultural.opportunities,
          qloo: cultural.qlooContext?.source
        }
      }),
      {
        summary: 'The culturally informed pass used affinity relationships the generic pass did not have.',
        genericStrategy: generic.strategies[0]?.title || '',
        culturalStrategy: cultural.strategies[0]?.title || '',
        whatQlooChanged: (cultural.qlooContext?.affinities || []).slice(0, 5).map((a: any) => a.target),
        caveat:
          'This demonstrates that cultural evidence changed the agent\'s conclusion. It does not prove commercial performance.'
      }
    );

    return {
      ...cultural,
      counterfactual: payload,
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
