import type { Project } from '@placegraph/types';
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
export interface ViewPrompt {
    label: string;
    prompt: string;
    negativePrompt: string;
}
export type VisualizationResult = {
    prov: ProvenanceBuilder;
    prompt: string;
    images: string[];
    model: string;
    views: ViewPrompt[];
};
export declare class VisualizationService {
    generateVisualization(input: VisualizationInput): Promise<VisualizationResult>;
}
export declare function buildVisualizationPrompts(input: VisualizationInput): ViewPrompt[];
