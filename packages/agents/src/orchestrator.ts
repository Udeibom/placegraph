import { Project } from '@placegraph/types';
import { ProvenanceBuilder, generateId, replaceVars } from '@placegraph/core';
import { QlooMockClient } from '@placegraph/qloo';
import { OPPORTUNITY_ANALYSIS_PROMPT, STRATEGY_GENERATION_PROMPT } from './prompts';

export interface OrchestratorInput {
  project: Project;
  useMock?: boolean;
  qlooContext?: any;
  locationContext?: any;
}

export class AgentOrchestrator {
  private llm: any;
  private qloo: QlooMockClient;

  constructor(llm?: any) {
    this.llm = llm;
    this.qloo = new QlooMockClient();
  }

  async analyzeCulturalIntelligence(input: OrchestratorInput) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Cultural intelligence analysis initiated', { parentId: null });
    prov.setRoot(root.id);
    prov.create('qloo_evidence', 'Loaded Qloo mock context for development', { parentId: root.id });
    return { prov, qlooContext: input.qlooContext || { affinities: await this.qloo.getAffinities(input.project.location.city || 'location') } };
  }

  async discoverOpportunities(input: OrchestratorInput) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Opportunity discovery initiated', { parentId: null });
    prov.setRoot(root.id);

    const qlooCtx = input.qlooContext || (await this.analyzeCulturalIntelligence(input)).qlooContext;
    const prompt = replaceVars(OPPORTUNITY_ANALYSIS_PROMPT, {
      project: input.project,
      locationContext: input.locationContext || {},
      qlooContext: qlooCtx
    });

    const resp = await this.llm?.complete([{ role: 'user', content: prompt }]) || { content: JSON.stringify([]) };
    let opportunities: any[] = [];
    try {
      opportunities = JSON.parse(resp.content);
    } catch (e) {
      opportunities = [];
    }

    opportunities = opportunities.map(op => ({
      ...op,
      id: op.id || generateId('opp'),
      provenance: op.provenance || root.id
    }));

    prov.create('inference', `Generated ${opportunities.length} opportunity hypotheses`, { parentId: root.id, qlooRefs: qlooCtx.affinities?.map((a: any) => a.target) });
    return { prov, opportunities, qlooContext: qlooCtx };
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

    const resp = await this.llm?.complete([{ role: 'user', content: prompt }]) || { content: JSON.stringify([]) };
    let strategies: any[] = [];
    try {
      strategies = JSON.parse(resp.content);
    } catch (e) {
      strategies = [];
    }

    strategies = strategies.map(s => ({
      ...s,
      id: s.id || generateId('strat'),
      provenance: s.provenance || root.id
    }));

    prov.create('inference', `Generated ${strategies.length} distinct strategic directions`, { parentId: root.id });
    return { prov, strategies };
  }

  async generateArchitecturalConcept(input: OrchestratorInput & { strategyId: string; strategy: any; requirements?: any[] }) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Architectural concept generation initiated', { parentId: null });
    prov.setRoot(root.id);

    prov.create('decision', 'Conceptual/spatial reasoning derived from strategy and requirements', { parentId: root.id });
    return { prov, decisions: [], concept: { zones: [], organization: 'tbd' }, requirements: input.requirements || [] };
  }
}
