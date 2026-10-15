import { Project } from '@placegraph/types';
import { ProvenanceBuilder } from '@placegraph/core';
export interface OrchestratorInput {
    project: Project;
    useMock?: boolean;
    qlooContext?: any;
    locationContext?: any;
}
export declare class AgentOrchestrator {
    private llm;
    private qlooMock;
    private qloo;
    constructor(llm?: any, opts?: {
        useMock?: boolean;
    });
    analyzeCulturalIntelligence(input: OrchestratorInput): Promise<{
        prov: ProvenanceBuilder;
        qlooContext: any;
    }>;
    discoverOpportunities(input: OrchestratorInput): Promise<{
        prov: ProvenanceBuilder;
        opportunities: any[];
        qlooContext: any;
        analysisRunId: any;
    }>;
    generateStrategies(input: OrchestratorInput & {
        opportunities: any[];
    }): Promise<{
        prov: ProvenanceBuilder;
        strategies: any[];
        analysisRunId: any;
    }>;
    generateExperienceRequirements(input: OrchestratorInput & {
        strategy: any;
    }): Promise<{
        prov: ProvenanceBuilder;
        requirements: any[];
    }>;
    generateArchitecturalConcept(input: OrchestratorInput & {
        strategy: any;
        requirements?: any[];
    }): Promise<{
        prov: ProvenanceBuilder;
        decisions: any;
        concept: any;
        requirements: any[];
    }>;
}
