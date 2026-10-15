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
export declare class AnalysisPipeline {
    run(input: PipelineInput): Promise<PipelineOutput>;
}
