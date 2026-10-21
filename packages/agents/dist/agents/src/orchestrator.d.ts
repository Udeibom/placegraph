import type { AnalysisSnapshot, Project } from '@placegraph/types';
import { LLMProvider } from './providers/llm';
export interface OrchestratorInput {
    project: Project;
    useMock?: boolean;
    guidance?: string;
}
export type ProgressFn = (stage: string, message: string) => void;
export declare class AgentOrchestrator {
    private llm;
    constructor(llm?: LLMProvider);
    private json;
    analyze(input: OrchestratorInput, onProgress?: ProgressFn): Promise<AnalysisSnapshot>;
    design(project: Project, analysis: AnalysisSnapshot, strategyId?: string, guidance?: string, onProgress?: ProgressFn): Promise<AnalysisSnapshot>;
    visualize(project: Project, analysis: AnalysisSnapshot, onProgress?: ProgressFn): Promise<AnalysisSnapshot>;
    review(project: Project, analysis: AnalysisSnapshot, feedback: string, onProgress?: ProgressFn): Promise<AnalysisSnapshot>;
    counterfactual(project: Project, cultural: AnalysisSnapshot): Promise<AnalysisSnapshot>;
    discoverOpportunities(input: OrchestratorInput): Promise<{
        opportunities: {
            type: "alignment" | "whitespace" | "destination" | "mixed";
            id: string;
            analysisRunId: string;
            title: string;
            whoServes: string;
            why: string;
            evidenceRefs: string[];
            assumptions: string[];
            uncertainties: string[];
            competitors: string[];
            rationale: string;
            qlooEstablished: string[];
            locallyEstablished: string[];
            inferred: string[];
            provenance?: {
                id: string;
                kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                explanation: string;
                refs: string[];
                qlooRefs: string[];
                parentId?: string | null | undefined;
                confidence?: number | undefined;
                metadata?: Record<string, any> | undefined;
            } | undefined;
        }[];
        qlooContext: {
            source: "mixed" | "live" | "mock";
            notes: string[];
            insufficient: boolean;
            entities: any[];
            affinities: any[];
            audienceAffinities?: Record<string, any[]> | undefined;
            crossDomain?: any;
        } | undefined;
        analysis: {
            status: "analyzing" | "review" | "idle" | "ready" | "strategy_selected" | "designed" | "visualized";
            updatedAt: string;
            provenance: {
                id: string;
                kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                explanation: string;
                refs: string[];
                qlooRefs: string[];
                parentId?: string | null | undefined;
                confidence?: number | undefined;
                metadata?: Record<string, any> | undefined;
            }[];
            runId: string;
            projectId: string;
            opportunities: {
                type: "alignment" | "whitespace" | "destination" | "mixed";
                id: string;
                analysisRunId: string;
                title: string;
                whoServes: string;
                why: string;
                evidenceRefs: string[];
                assumptions: string[];
                uncertainties: string[];
                competitors: string[];
                rationale: string;
                qlooEstablished: string[];
                locallyEstablished: string[];
                inferred: string[];
                provenance?: {
                    id: string;
                    kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                    explanation: string;
                    refs: string[];
                    qlooRefs: string[];
                    parentId?: string | null | undefined;
                    confidence?: number | undefined;
                    metadata?: Record<string, any> | undefined;
                } | undefined;
            }[];
            strategies: {
                id: string;
                analysisRunId: string;
                title: string;
                whoServes: string;
                why: string;
                evidenceRefs: string[];
                assumptions: string[];
                uncertainties: string[];
                competitors: string[];
                selected: boolean;
                direction: string;
                experienceThesis: string;
                risks: string[];
                differentiation: string;
                qlooEstablished?: string | undefined;
                locallyEstablished?: string | undefined;
                inferred?: string | undefined;
                provenance?: {
                    id: string;
                    kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                    explanation: string;
                    refs: string[];
                    qlooRefs: string[];
                    parentId?: string | null | undefined;
                    confidence?: number | undefined;
                    metadata?: Record<string, any> | undefined;
                } | undefined;
                physicalExperience?: string | undefined;
            }[];
            requirements: {
                id: string;
                priority: "low" | "medium" | "high";
                rationale: string;
                strategyId: string;
                requirement: string;
                source: "inference" | "constraint" | "evidence" | "operation";
                zone?: string | undefined;
            }[];
            decisions: {
                decision: string;
                id: string;
                strategyId: string;
                zone: string;
                whyChain: {
                    id: string;
                    kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                    explanation: string;
                    refs: string[];
                    qlooRefs: string[];
                    parentId?: string | null | undefined;
                    confidence?: number | undefined;
                    metadata?: Record<string, any> | undefined;
                }[];
                alternatives: string[];
                constraintsConsidered: string[];
                qlooEstablished?: string | undefined;
                locallyEstablished?: string | undefined;
                inferred?: string | undefined;
                unverified?: string | undefined;
            }[];
            visualizations: {
                id: string;
                createdAt: string;
                prompt: string;
                images: string[];
                model: string;
            }[];
            reviews: {
                id: string;
                createdAt: string;
                feedback: string;
                chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
                diagnosis: string;
                resolved: boolean;
                guidance?: string | undefined;
                before?: {
                    decisionSummaries: string[];
                    strategyTitle?: string | undefined;
                    requirementCount?: number | undefined;
                } | undefined;
                after?: {
                    decisionSummaries: string[];
                    strategyTitle?: string | undefined;
                    requirementCount?: number | undefined;
                } | undefined;
            }[];
            intelligenceMode?: "mixed" | "live" | "template" | undefined;
            locationContext?: {
                notes: string[];
                evidenceQuality: "strong" | "moderate" | "insufficient";
                query: string;
                pois: {
                    name: string;
                    lat?: number | undefined;
                    lng?: number | undefined;
                    category?: string | undefined;
                    distanceM?: number | undefined;
                }[];
                lat?: number | undefined;
                lng?: number | undefined;
                city?: string | undefined;
                displayName?: string | undefined;
            } | undefined;
            qlooContext?: {
                source: "mixed" | "live" | "mock";
                notes: string[];
                insufficient: boolean;
                entities: any[];
                affinities: any[];
                audienceAffinities?: Record<string, any[]> | undefined;
                crossDomain?: any;
            } | undefined;
            landscapes?: {
                existing: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "local" | "qloo" | undefined;
                        category?: string | undefined;
                        notes?: string | undefined;
                        affinity?: number | undefined;
                    }[];
                    audiencesServed: string[];
                    crowdedPatterns: string[];
                    gaps: string[];
                    evidenceQuality: "strong" | "moderate" | "insufficient";
                };
                potential: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "local" | "qloo" | undefined;
                        category?: string | undefined;
                        notes?: string | undefined;
                        affinity?: number | undefined;
                    }[];
                    audiencesServed: string[];
                    crowdedPatterns: string[];
                    gaps: string[];
                    evidenceQuality: "strong" | "moderate" | "insufficient";
                };
                proposed: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "local" | "qloo" | undefined;
                        category?: string | undefined;
                        notes?: string | undefined;
                        affinity?: number | undefined;
                    }[];
                    audiencesServed: string[];
                    crowdedPatterns: string[];
                    gaps: string[];
                    evidenceQuality: "strong" | "moderate" | "insufficient";
                };
            } | undefined;
            audienceAnalysis?: {
                shared: string[];
                complementary: string[];
                conflicting: string[];
                spatialImplications: string;
            } | undefined;
            selectedStrategyId?: string | undefined;
            concept?: {
                organization: string;
                zones: {
                    name: string;
                    purpose: string;
                    character?: string | undefined;
                    adjacency?: string | undefined;
                }[];
                materials: string[];
                lighting: string[];
                furniture: string[];
                opsNotes: string[];
                circulation?: string | undefined;
                exterior?: string | undefined;
                layout?: {
                    name: string;
                    x: number;
                    y: number;
                    w: number;
                    h: number;
                    purpose?: string | undefined;
                }[] | undefined;
            } | undefined;
            counterfactual?: {
                summary: string;
                genericStrategy: string;
                culturalStrategy: string;
                whatQlooChanged: string[];
                caveat: string;
            } | undefined;
            floorPlan?: {
                constraints: string[];
                source: "vision" | "brief" | "none";
                summary: string;
                rooms: {
                    name: string;
                    notes?: string | undefined;
                    approxShare?: number | undefined;
                }[];
                usable: boolean;
            } | undefined;
            evidenceGate?: {
                locationQuality: "strong" | "moderate" | "insufficient";
                qlooQuality: "strong" | "moderate" | "insufficient";
                llmAvailable: boolean;
                intelligenceMode: "mixed" | "live" | "template";
                allowConfidentRecommendation: boolean;
                warnings: string[];
            } | undefined;
            progress?: {
                at: string;
                message: string;
                stage: string;
            } | undefined;
            error?: string | undefined;
        };
    }>;
    generateStrategies(input: OrchestratorInput & {
        opportunities: any[];
    }): Promise<{
        strategies: {
            id: string;
            analysisRunId: string;
            title: string;
            whoServes: string;
            why: string;
            evidenceRefs: string[];
            assumptions: string[];
            uncertainties: string[];
            competitors: string[];
            selected: boolean;
            direction: string;
            experienceThesis: string;
            risks: string[];
            differentiation: string;
            qlooEstablished?: string | undefined;
            locallyEstablished?: string | undefined;
            inferred?: string | undefined;
            provenance?: {
                id: string;
                kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                explanation: string;
                refs: string[];
                qlooRefs: string[];
                parentId?: string | null | undefined;
                confidence?: number | undefined;
                metadata?: Record<string, any> | undefined;
            } | undefined;
            physicalExperience?: string | undefined;
        }[];
        analysis: {
            status: "analyzing" | "review" | "idle" | "ready" | "strategy_selected" | "designed" | "visualized";
            updatedAt: string;
            provenance: {
                id: string;
                kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                explanation: string;
                refs: string[];
                qlooRefs: string[];
                parentId?: string | null | undefined;
                confidence?: number | undefined;
                metadata?: Record<string, any> | undefined;
            }[];
            runId: string;
            projectId: string;
            opportunities: {
                type: "alignment" | "whitespace" | "destination" | "mixed";
                id: string;
                analysisRunId: string;
                title: string;
                whoServes: string;
                why: string;
                evidenceRefs: string[];
                assumptions: string[];
                uncertainties: string[];
                competitors: string[];
                rationale: string;
                qlooEstablished: string[];
                locallyEstablished: string[];
                inferred: string[];
                provenance?: {
                    id: string;
                    kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                    explanation: string;
                    refs: string[];
                    qlooRefs: string[];
                    parentId?: string | null | undefined;
                    confidence?: number | undefined;
                    metadata?: Record<string, any> | undefined;
                } | undefined;
            }[];
            strategies: {
                id: string;
                analysisRunId: string;
                title: string;
                whoServes: string;
                why: string;
                evidenceRefs: string[];
                assumptions: string[];
                uncertainties: string[];
                competitors: string[];
                selected: boolean;
                direction: string;
                experienceThesis: string;
                risks: string[];
                differentiation: string;
                qlooEstablished?: string | undefined;
                locallyEstablished?: string | undefined;
                inferred?: string | undefined;
                provenance?: {
                    id: string;
                    kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                    explanation: string;
                    refs: string[];
                    qlooRefs: string[];
                    parentId?: string | null | undefined;
                    confidence?: number | undefined;
                    metadata?: Record<string, any> | undefined;
                } | undefined;
                physicalExperience?: string | undefined;
            }[];
            requirements: {
                id: string;
                priority: "low" | "medium" | "high";
                rationale: string;
                strategyId: string;
                requirement: string;
                source: "inference" | "constraint" | "evidence" | "operation";
                zone?: string | undefined;
            }[];
            decisions: {
                decision: string;
                id: string;
                strategyId: string;
                zone: string;
                whyChain: {
                    id: string;
                    kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                    explanation: string;
                    refs: string[];
                    qlooRefs: string[];
                    parentId?: string | null | undefined;
                    confidence?: number | undefined;
                    metadata?: Record<string, any> | undefined;
                }[];
                alternatives: string[];
                constraintsConsidered: string[];
                qlooEstablished?: string | undefined;
                locallyEstablished?: string | undefined;
                inferred?: string | undefined;
                unverified?: string | undefined;
            }[];
            visualizations: {
                id: string;
                createdAt: string;
                prompt: string;
                images: string[];
                model: string;
            }[];
            reviews: {
                id: string;
                createdAt: string;
                feedback: string;
                chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
                diagnosis: string;
                resolved: boolean;
                guidance?: string | undefined;
                before?: {
                    decisionSummaries: string[];
                    strategyTitle?: string | undefined;
                    requirementCount?: number | undefined;
                } | undefined;
                after?: {
                    decisionSummaries: string[];
                    strategyTitle?: string | undefined;
                    requirementCount?: number | undefined;
                } | undefined;
            }[];
            intelligenceMode?: "mixed" | "live" | "template" | undefined;
            locationContext?: {
                notes: string[];
                evidenceQuality: "strong" | "moderate" | "insufficient";
                query: string;
                pois: {
                    name: string;
                    lat?: number | undefined;
                    lng?: number | undefined;
                    category?: string | undefined;
                    distanceM?: number | undefined;
                }[];
                lat?: number | undefined;
                lng?: number | undefined;
                city?: string | undefined;
                displayName?: string | undefined;
            } | undefined;
            qlooContext?: {
                source: "mixed" | "live" | "mock";
                notes: string[];
                insufficient: boolean;
                entities: any[];
                affinities: any[];
                audienceAffinities?: Record<string, any[]> | undefined;
                crossDomain?: any;
            } | undefined;
            landscapes?: {
                existing: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "local" | "qloo" | undefined;
                        category?: string | undefined;
                        notes?: string | undefined;
                        affinity?: number | undefined;
                    }[];
                    audiencesServed: string[];
                    crowdedPatterns: string[];
                    gaps: string[];
                    evidenceQuality: "strong" | "moderate" | "insufficient";
                };
                potential: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "local" | "qloo" | undefined;
                        category?: string | undefined;
                        notes?: string | undefined;
                        affinity?: number | undefined;
                    }[];
                    audiencesServed: string[];
                    crowdedPatterns: string[];
                    gaps: string[];
                    evidenceQuality: "strong" | "moderate" | "insufficient";
                };
                proposed: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "local" | "qloo" | undefined;
                        category?: string | undefined;
                        notes?: string | undefined;
                        affinity?: number | undefined;
                    }[];
                    audiencesServed: string[];
                    crowdedPatterns: string[];
                    gaps: string[];
                    evidenceQuality: "strong" | "moderate" | "insufficient";
                };
            } | undefined;
            audienceAnalysis?: {
                shared: string[];
                complementary: string[];
                conflicting: string[];
                spatialImplications: string;
            } | undefined;
            selectedStrategyId?: string | undefined;
            concept?: {
                organization: string;
                zones: {
                    name: string;
                    purpose: string;
                    character?: string | undefined;
                    adjacency?: string | undefined;
                }[];
                materials: string[];
                lighting: string[];
                furniture: string[];
                opsNotes: string[];
                circulation?: string | undefined;
                exterior?: string | undefined;
                layout?: {
                    name: string;
                    x: number;
                    y: number;
                    w: number;
                    h: number;
                    purpose?: string | undefined;
                }[] | undefined;
            } | undefined;
            counterfactual?: {
                summary: string;
                genericStrategy: string;
                culturalStrategy: string;
                whatQlooChanged: string[];
                caveat: string;
            } | undefined;
            floorPlan?: {
                constraints: string[];
                source: "vision" | "brief" | "none";
                summary: string;
                rooms: {
                    name: string;
                    notes?: string | undefined;
                    approxShare?: number | undefined;
                }[];
                usable: boolean;
            } | undefined;
            evidenceGate?: {
                locationQuality: "strong" | "moderate" | "insufficient";
                qlooQuality: "strong" | "moderate" | "insufficient";
                llmAvailable: boolean;
                intelligenceMode: "mixed" | "live" | "template";
                allowConfidentRecommendation: boolean;
                warnings: string[];
            } | undefined;
            progress?: {
                at: string;
                message: string;
                stage: string;
            } | undefined;
            error?: string | undefined;
        };
    }>;
    generateExperienceRequirements(input: OrchestratorInput & {
        strategy: any;
    }): Promise<{
        requirements: {
            id: string;
            priority: "low" | "medium" | "high";
            rationale: string;
            strategyId: string;
            requirement: string;
            source: "inference" | "constraint" | "evidence" | "operation";
            zone?: string | undefined;
        }[];
    }>;
    generateArchitecturalConcept(input: OrchestratorInput & {
        strategy: any;
        requirements?: any[];
    }): Promise<{
        decisions: {
            decision: string;
            id: string;
            strategyId: string;
            zone: string;
            whyChain: {
                id: string;
                kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
                explanation: string;
                refs: string[];
                qlooRefs: string[];
                parentId?: string | null | undefined;
                confidence?: number | undefined;
                metadata?: Record<string, any> | undefined;
            }[];
            alternatives: string[];
            constraintsConsidered: string[];
            qlooEstablished?: string | undefined;
            locallyEstablished?: string | undefined;
            inferred?: string | undefined;
            unverified?: string | undefined;
        }[];
        concept: {
            organization: string;
            zones: {
                name: string;
                purpose: string;
                character?: string | undefined;
                adjacency?: string | undefined;
            }[];
            materials: string[];
            lighting: string[];
            furniture: string[];
            opsNotes: string[];
            circulation?: string | undefined;
            exterior?: string | undefined;
            layout?: {
                name: string;
                x: number;
                y: number;
                w: number;
                h: number;
                purpose?: string | undefined;
            }[] | undefined;
        } | undefined;
        requirements: {
            id: string;
            priority: "low" | "medium" | "high";
            rationale: string;
            strategyId: string;
            requirement: string;
            source: "inference" | "constraint" | "evidence" | "operation";
            zone?: string | undefined;
        }[];
    }>;
}
