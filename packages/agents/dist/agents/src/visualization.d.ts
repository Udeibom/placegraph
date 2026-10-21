import type { Project } from '@placegraph/types';
import { ProvenanceBuilder } from '@placegraph/core';
import { LLMProvider } from './providers/llm';
export interface VisualizationInput {
    project: Project;
    strategy: any;
    decisions: any[];
    concept: any;
    requirements: any[];
    useMock?: boolean;
    style?: string;
}
interface ViewPrompt {
    label: string;
    prompt: string;
    negativePrompt: string;
}
export declare class VisualizationService {
    private llm;
    constructor(llm?: LLMProvider);
    generateVisualization(input: VisualizationInput): Promise<{
        prov: ProvenanceBuilder;
        prompt: string;
        images: string[];
        model: string;
        views: ViewPrompt[];
    }>;
}
export {};
