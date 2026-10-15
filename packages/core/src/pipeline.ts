import { Project, Opportunity, Strategy } from '@placegraph/types';
import { ProvenanceBuilder } from './provenance';

export interface PipelineInput {
  project: Project;
  locationContext?: any;
  qlooContext?: any;
}

export interface PipelineOutput {
  opportunities: Opportunity[];
  strategies: Strategy[];
  provenance: ReturnType<ProvenanceBuilder['all']>;
}

export class AnalysisPipeline {
  async run(input: PipelineInput): Promise<PipelineOutput> {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Analysis pipeline initiated', { parentId: null });
    prov.setRoot(root.id);

    // Stub - will be filled with real logic in Phase 2/3
    const opportunities: Opportunity[] = [];
    const strategies: Strategy[] = [];

    return {
      opportunities,
      strategies,
      provenance: prov.all()
    };
  }
}
