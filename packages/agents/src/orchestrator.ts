import { Project } from '@placegraph/types';
import { ProvenanceBuilder, generateId, replaceVars } from '@placegraph/core';
import { QlooMockClient, createQlooClient } from '@placegraph/qloo';
import { OPPORTUNITY_ANALYSIS_PROMPT, STRATEGY_GENERATION_PROMPT, EXPERIENCE_REQ_PROMPT, ARCHITECTURE_PROMPT } from './prompts';

export interface OrchestratorInput {
  project: Project;
  useMock?: boolean;
  qlooContext?: any;
  locationContext?: any;
}

export class AgentOrchestrator {
  private llm: any;
  private qlooMock: QlooMockClient;
  private qloo: any;

  constructor(llm?: any, opts?: { useMock?: boolean }) {
    this.llm = llm;
    this.qlooMock = new QlooMockClient();
    this.qloo = opts?.useMock === false ? createQlooClient() : this.qlooMock;
  }

  async analyzeCulturalIntelligence(input: OrchestratorInput) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Cultural intelligence analysis initiated', { parentId: null });
    prov.setRoot(root.id);

    const qlooCtx = input.qlooContext || {
      affinities: await this.qloo.getAffinities(input.project.location.city || input.project.name || 'location'),
      entities: await this.qloo.searchEntities(input.project.location.city || 'neighborhood')
    };

    prov.create('qloo_evidence', 'Retrieved cultural context via Qloo (mock or real)', {
      parentId: root.id,
      qlooRefs: qlooCtx.affinities?.slice(0, 5).map((a: any) => a.target)
    });
    return { prov, qlooContext: qlooCtx };
  }

  async discoverOpportunities(input: OrchestratorInput) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Opportunity discovery initiated', { parentId: null });
    prov.setRoot(root.id);

    const ci = await this.analyzeCulturalIntelligence(input);
    const qlooCtx = ci.qlooContext;
    const prompt = replaceVars(OPPORTUNITY_ANALYSIS_PROMPT, {
      project: input.project,
      locationContext: input.locationContext || {},
      qlooContext: qlooCtx
    });

    const resp = await this.llm?.complete([{ role: 'user', content: prompt }]) || { content: '[]' };
    let opportunities: any[] = [];
    try {
      opportunities = JSON.parse(resp.content);
    } catch (e) {
      opportunities = [];
    }

    opportunities = opportunities.map(op => ({
      ...op,
      id: op.id || generateId('opp'),
      analysisRunId: generateId('run'),
      provenance: op.provenance || root
    }));

    prov.create('inference', `Generated ${opportunities.length} opportunity hypotheses`, {
      parentId: root.id,
      qlooRefs: (qlooCtx.affinities || []).map((a: any) => a.target)
    });
    return { prov, opportunities, qlooContext: qlooCtx, analysisRunId: opportunities[0]?.analysisRunId };
  }

  async generateStrategies(input: OrchestratorInput & { opportunities: any[] }) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Strategy generation initiated', { parentId: null });
    prov.setRoot(root.id);

    const qlooCtx = input.qlooContext || (await this.analyzeCulturalIntelligence(input)).qlooContext;
    const prompt = replaceVars(STRATEGY_GENERATION_PROMPT, {
      project: input.project,
      opportunities: input.opportunities,
      qlooContext: qlooCtx
    });

    const resp = await this.llm?.complete([{ role: 'user', content: prompt }]) || { content: '[]' };
    let strategies: any[] = [];
    try {
      strategies = JSON.parse(resp.content);
    } catch (e) {
      strategies = [];
    }

    const runId = input.opportunities[0]?.analysisRunId || generateId('run');
    strategies = strategies.map(s => ({
      ...s,
      id: s.id || generateId('strat'),
      analysisRunId: runId,
      provenance: s.provenance || root
    }));

    prov.create('inference', `Generated ${strategies.length} distinct strategic directions`, { parentId: root.id });
    return { prov, strategies, analysisRunId: runId };
  }

  async generateExperienceRequirements(input: OrchestratorInput & { strategy: any }) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Experience requirements generation initiated', { parentId: null });
    prov.setRoot(root.id);

    const qlooCtx = input.qlooContext || (await this.analyzeCulturalIntelligence(input)).qlooContext;
    const prompt = replaceVars(EXPERIENCE_REQ_PROMPT, {
      project: input.project,
      strategy: input.strategy,
      qlooContext: qlooCtx
    });

    const resp = await this.llm?.complete([{ role: 'user', content: prompt }]) || { content: '[]' };
    let requirements: any[] = [];
    try {
      requirements = JSON.parse(resp.content);
    } catch (e) {
      requirements = [];
    }

    requirements = requirements.map(r => ({
      ...r,
      id: r.id || generateId('req'),
      strategyId: input.strategy.id
    }));

    prov.create('inference', `Generated ${requirements.length} experience requirements`, { parentId: root.id });
    return { prov, requirements };
  }

  async generateArchitecturalConcept(input: OrchestratorInput & { strategy: any; requirements?: any[] }) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Architectural concept generation initiated', { parentId: null });
    prov.setRoot(root.id);

    const qlooCtx = input.qlooContext || (await this.analyzeCulturalIntelligence(input)).qlooContext;
    const requirements = input.requirements || (await this.generateExperienceRequirements(input)).requirements;
    const prompt = replaceVars(ARCHITECTURE_PROMPT, {
      project: input.project,
      strategy: input.strategy,
      requirements,
      qlooContext: qlooCtx
    });

    const resp = await this.llm?.complete([{ role: 'user', content: prompt }]) || { content: '{}' };
    let result: any = {};
    try {
      result = JSON.parse(resp.content);
    } catch (e) {
      result = { decisions: [], concept: { zones: [], organization: 'tbd' } };
    }

    prov.create('decision', 'Derived architectural decisions from strategy + experience requirements', { parentId: root.id });
    return { prov, decisions: result.decisions || [], concept: result.concept || { zones: [] }, requirements };
  }
}
