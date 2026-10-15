import { Project } from '@placegraph/types';
import { ProvenanceBuilder } from '@placegraph/core';
export interface VisualizationInput {
    project: Project;
    strategy: any;
    decisions: any[];
    concept: any;
    requirements: any[];
    useMock?: boolean;
    style?: string;
}
export declare class VisualizationService {
    private llm;
    private imageMock;
    private image;
    constructor(llm?: any, opts?: {
        useMock?: boolean;
    });
    generateVisualization(input: VisualizationInput): Promise<{
        prov: ProvenanceBuilder;
        prompt: any;
        images: any;
        model: any;
    }>;
}
