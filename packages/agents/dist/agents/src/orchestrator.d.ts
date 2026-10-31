import type { AnalysisSnapshot, Project } from '@placegraph/types';
import { LLMProvider } from './providers/llm';
export interface OrchestratorInput {
    project: Project;
    useMock?: boolean;
    noQloo?: boolean;
    guidance?: string;
}
export type ProgressFn = (stage: string, message: string) => void;
export declare function compactLocation(location: any, maxPois?: number): any;
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
            type: "mixed" | "alignment" | "whitespace" | "destination";
            id: string;
            evidenceClaimIds: string[];
            title: string;
            relationships: string[];
            analysisRunId: string;
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
            validationRequirements: string[];
            eligible: boolean;
            confidence?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
            commercialLogic?: string | undefined;
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
            insufficient: boolean;
            source: "failed" | "mixed" | "live" | "mock" | "unavailable";
            affinities: any[];
            notes: string[];
            entities: any[];
            culturalPatterns: {
                implication: string;
                key: string;
                label: string;
                count: number;
                places: string[];
                genres: string[];
            }[];
            culturalThesis: string;
            audienceResolutions: {
                status: "approximate" | "failed" | "unresolved" | "resolved";
                id: string;
                name: string;
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                limitations: string[];
                query: string;
                identifiers: {
                    displayName: string;
                    uuid?: string | undefined;
                    urn?: string | undefined;
                    entityType?: string | undefined;
                    domain?: string | undefined;
                    environment?: string | undefined;
                }[];
                seeds: {
                    displayName: string;
                    uuid?: string | undefined;
                    urn?: string | undefined;
                    entityType?: string | undefined;
                    domain?: string | undefined;
                    environment?: string | undefined;
                }[];
                affinities: {
                    target: string;
                    strength: number;
                    seedCount: number;
                    urn?: string | undefined;
                    domain?: string | undefined;
                    targetId?: string | undefined;
                    genre?: string | undefined;
                    city?: string | undefined;
                    evidenceClaimId?: string | undefined;
                }[];
                evidenceClaimIds: string[];
                priority?: number | undefined;
                description?: string | undefined;
            }[];
            evidenceClaims: {
                id: string;
                qlooRefs: string[];
                stage: string;
                claim: string;
                evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                source: "inference" | "assumption" | "qloo" | "local";
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                scope: {
                    audienceIds: string[];
                    place?: string | undefined;
                    geography?: string | undefined;
                };
                localRefs: string[];
                supporting: string[];
                limitations: string[];
                validationRequired: string[];
                confidence?: number | undefined;
                interpretation?: string | undefined;
                implication?: string | undefined;
                sourceEnvironment?: string | undefined;
                observedAt?: string | undefined;
            }[];
            environment?: string | undefined;
            locationResolution?: {
                scope: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global";
                resolved: boolean;
                candidatesTried: string[];
                query?: string | undefined;
            } | undefined;
            audienceAffinities?: Record<string, any[]> | undefined;
            crossDomain?: any;
            failure?: {
                message: string;
                kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
                retryable: boolean;
                status?: number | undefined;
                environment?: string | undefined;
                endpoint?: string | undefined;
            } | undefined;
        } | undefined;
        analysis: {
            status: "review" | "analyzing" | "ready" | "idle" | "strategy_selected" | "designed" | "visualized";
            deliverables: {
                type: string;
                id: string;
                limitations: string[];
                evidenceClaimIds: string[];
                title: string;
                body: string;
            }[];
            opportunities: {
                type: "mixed" | "alignment" | "whitespace" | "destination";
                id: string;
                evidenceClaimIds: string[];
                title: string;
                relationships: string[];
                analysisRunId: string;
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
                validationRequirements: string[];
                eligible: boolean;
                confidence?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
                commercialLogic?: string | undefined;
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
                evidenceClaimIds: string[];
                title: string;
                analysisRunId: string;
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
                culturalRelationships: string[];
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
                conceptType?: string | undefined;
                fitForAudience?: string | undefined;
                opportunityCaptured?: string | undefined;
                whyWeakerThanAlternatives?: string | undefined;
                qlooEvidenceSummary?: string | undefined;
                opportunityId?: string | undefined;
                decisionFit?: string | undefined;
            }[];
            updatedAt: string;
            relationships: {
                object: string;
                id: string;
                subject: string;
                audienceIds: string[];
                evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                limitations: string[];
                interpretation: string;
                evidenceClaimIds: string[];
                relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
                commercialRelevance: string;
                seedCount?: number | undefined;
                score?: number | undefined;
            }[];
            organisationProfiles: {
                type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
                id: string;
                name: string;
                primary: boolean;
                deliverables: string[];
                mandate?: string | undefined;
            }[];
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
            audienceResolutions: {
                status: "approximate" | "failed" | "unresolved" | "resolved";
                id: string;
                name: string;
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                limitations: string[];
                query: string;
                identifiers: {
                    displayName: string;
                    uuid?: string | undefined;
                    urn?: string | undefined;
                    entityType?: string | undefined;
                    domain?: string | undefined;
                    environment?: string | undefined;
                }[];
                seeds: {
                    displayName: string;
                    uuid?: string | undefined;
                    urn?: string | undefined;
                    entityType?: string | undefined;
                    domain?: string | undefined;
                    environment?: string | undefined;
                }[];
                affinities: {
                    target: string;
                    strength: number;
                    seedCount: number;
                    urn?: string | undefined;
                    domain?: string | undefined;
                    targetId?: string | undefined;
                    genre?: string | undefined;
                    city?: string | undefined;
                    evidenceClaimId?: string | undefined;
                }[];
                evidenceClaimIds: string[];
                priority?: number | undefined;
                description?: string | undefined;
            }[];
            evidenceClaims: {
                id: string;
                qlooRefs: string[];
                stage: string;
                claim: string;
                evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                source: "inference" | "assumption" | "qloo" | "local";
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                scope: {
                    audienceIds: string[];
                    place?: string | undefined;
                    geography?: string | undefined;
                };
                localRefs: string[];
                supporting: string[];
                limitations: string[];
                validationRequired: string[];
                confidence?: number | undefined;
                interpretation?: string | undefined;
                implication?: string | undefined;
                sourceEnvironment?: string | undefined;
                observedAt?: string | undefined;
            }[];
            runId: string;
            projectId: string;
            stageStates: {
                message: string;
                status: "failed" | "degraded" | "complete" | "skipped" | "pending";
                stage: "cross_domain" | "decision_frame" | "place_resolution" | "audience_resolution" | "affinity_collection" | "audience_profiles" | "evidence_gate" | "cultural_patterns" | "opportunities" | "strategies" | "spatial_translation" | "review";
                evidenceClaimIds: string[];
                source?: string | undefined;
                quality?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
                updatedAt?: string | undefined;
            }[];
            requirements: {
                id: string;
                source: "inference" | "constraint" | "evidence" | "operation";
                priority: "low" | "medium" | "high";
                rationale: string;
                strategyId: string;
                requirement: string;
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
                viewLabels: string[];
                model: string;
            }[];
            reviews: {
                id: string;
                resolved: boolean;
                createdAt: string;
                feedback: string;
                chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
                diagnosis: string;
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
            primaryProfileId?: string | undefined;
            decisionFrame?: {
                type: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice";
                subject: string;
                successTests: string[];
                constraints: string[];
                timeHorizon?: string | undefined;
                capitalIntent?: string | undefined;
            } | undefined;
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
            intelligenceMode?: "mixed" | "live" | "template" | undefined;
            locationContext?: {
                query: string;
                notes: string[];
                evidenceQuality: "strong" | "moderate" | "insufficient";
                coverageQuality: "comprehensive" | "partial" | "sparse";
                pois: {
                    name: string;
                    lat?: number | undefined;
                    lng?: number | undefined;
                    category?: string | undefined;
                    distanceM?: number | undefined;
                }[];
                displayName?: string | undefined;
                city?: string | undefined;
                lat?: number | undefined;
                lng?: number | undefined;
            } | undefined;
            qlooContext?: {
                insufficient: boolean;
                source: "failed" | "mixed" | "live" | "mock" | "unavailable";
                affinities: any[];
                notes: string[];
                entities: any[];
                culturalPatterns: {
                    implication: string;
                    key: string;
                    label: string;
                    count: number;
                    places: string[];
                    genres: string[];
                }[];
                culturalThesis: string;
                audienceResolutions: {
                    status: "approximate" | "failed" | "unresolved" | "resolved";
                    id: string;
                    name: string;
                    quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                    limitations: string[];
                    query: string;
                    identifiers: {
                        displayName: string;
                        uuid?: string | undefined;
                        urn?: string | undefined;
                        entityType?: string | undefined;
                        domain?: string | undefined;
                        environment?: string | undefined;
                    }[];
                    seeds: {
                        displayName: string;
                        uuid?: string | undefined;
                        urn?: string | undefined;
                        entityType?: string | undefined;
                        domain?: string | undefined;
                        environment?: string | undefined;
                    }[];
                    affinities: {
                        target: string;
                        strength: number;
                        seedCount: number;
                        urn?: string | undefined;
                        domain?: string | undefined;
                        targetId?: string | undefined;
                        genre?: string | undefined;
                        city?: string | undefined;
                        evidenceClaimId?: string | undefined;
                    }[];
                    evidenceClaimIds: string[];
                    priority?: number | undefined;
                    description?: string | undefined;
                }[];
                evidenceClaims: {
                    id: string;
                    qlooRefs: string[];
                    stage: string;
                    claim: string;
                    evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                    source: "inference" | "assumption" | "qloo" | "local";
                    quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                    scope: {
                        audienceIds: string[];
                        place?: string | undefined;
                        geography?: string | undefined;
                    };
                    localRefs: string[];
                    supporting: string[];
                    limitations: string[];
                    validationRequired: string[];
                    confidence?: number | undefined;
                    interpretation?: string | undefined;
                    implication?: string | undefined;
                    sourceEnvironment?: string | undefined;
                    observedAt?: string | undefined;
                }[];
                environment?: string | undefined;
                locationResolution?: {
                    scope: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global";
                    resolved: boolean;
                    candidatesTried: string[];
                    query?: string | undefined;
                } | undefined;
                audienceAffinities?: Record<string, any[]> | undefined;
                crossDomain?: any;
                failure?: {
                    message: string;
                    kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
                    retryable: boolean;
                    status?: number | undefined;
                    environment?: string | undefined;
                    endpoint?: string | undefined;
                } | undefined;
            } | undefined;
            decisionBrief?: {
                deliverables: {
                    type: string;
                    id: string;
                    limitations: string[];
                    evidenceClaimIds: string[];
                    title: string;
                    body: string;
                }[];
                mode: "discover" | "evaluate";
                frame: {
                    type: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice";
                    subject: string;
                    successTests: string[];
                    constraints: string[];
                    timeHorizon?: string | undefined;
                    capitalIntent?: string | undefined;
                };
                profiles: {
                    type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
                    id: string;
                    name: string;
                    primary: boolean;
                    deliverables: string[];
                    mandate?: string | undefined;
                }[];
                placeSummary: string;
                audienceSummary: string;
                culturalSummary: string;
                relationships: {
                    object: string;
                    id: string;
                    subject: string;
                    audienceIds: string[];
                    evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                    quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                    limitations: string[];
                    interpretation: string;
                    evidenceClaimIds: string[];
                    relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
                    commercialRelevance: string;
                    seedCount?: number | undefined;
                    score?: number | undefined;
                }[];
                opportunityIds: string[];
                uncertainty: string[];
                nextInvestigation: string[];
                primaryProfileId?: string | undefined;
            } | undefined;
            landscapes?: {
                existing: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "qloo" | "local" | undefined;
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
                        source?: "inference" | "qloo" | "local" | undefined;
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
                        source?: "inference" | "qloo" | "local" | undefined;
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
                qlooStatus?: "failed" | "degraded" | "ready" | "missing" | undefined;
                blockedReason?: string | undefined;
                contractFailure?: {
                    message: string;
                    kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
                    retryable: boolean;
                    status?: number | undefined;
                    environment?: string | undefined;
                    endpoint?: string | undefined;
                } | undefined;
                evidenceSummary?: {
                    canRecommend: boolean;
                    canDiscover: boolean;
                    missingEvidence: string[];
                    whatWouldResolveIt: string[];
                } | undefined;
            } | undefined;
            progress?: {
                at: string;
                message: string;
                stage: string;
            } | undefined;
            error?: string | undefined;
            placeProfile?: {
                evidenceQuality: "strong" | "moderate" | "insufficient";
                placeIdentity: string;
                communityProfile: string;
                culturalAssets: string[];
                commercialSupply: string;
                behaviouralSignals: string;
                unmetNeeds: string[];
            } | undefined;
            retailOutput?: {
                positioning: string;
                gaps: string[];
                evidenceSummary: string;
                categoryMix: {
                    confidence: "strong" | "moderate" | "weak";
                    alignment: string;
                    evidence: string[];
                    category: string;
                }[];
                formatRecommendation: string;
                communityFit: string;
                localCollaborations: string[];
            } | undefined;
            operatorOutput?: {
                evidenceSummary: string;
                programmingModel: string;
                experienceMix: {
                    type: string;
                    rationale: string;
                    evidence: string[];
                    proportion: "primary" | "secondary" | "supplementary";
                }[];
                activations: {
                    rationale: string;
                    evidence: string[];
                    activity: string;
                    audience: string;
                    frequency: string;
                    spaceRequired?: string | undefined;
                }[];
                tenantRationale: {
                    why: string;
                    evidence: string[];
                    tenantType: string;
                }[];
                whatToStop: string[];
            } | undefined;
            hospitalityOutput?: {
                evidenceSummary: string;
                programmingModel: string;
                conceptIdentity: string;
                fbStrategy: string;
                daypartStrategy: string;
                atmosphereNotes: string;
            } | undefined;
        };
    }>;
    generateStrategies(input: OrchestratorInput & {
        opportunities: any[];
    }): Promise<{
        strategies: {
            id: string;
            evidenceClaimIds: string[];
            title: string;
            analysisRunId: string;
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
            culturalRelationships: string[];
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
            conceptType?: string | undefined;
            fitForAudience?: string | undefined;
            opportunityCaptured?: string | undefined;
            whyWeakerThanAlternatives?: string | undefined;
            qlooEvidenceSummary?: string | undefined;
            opportunityId?: string | undefined;
            decisionFit?: string | undefined;
        }[];
        analysis: {
            status: "review" | "analyzing" | "ready" | "idle" | "strategy_selected" | "designed" | "visualized";
            deliverables: {
                type: string;
                id: string;
                limitations: string[];
                evidenceClaimIds: string[];
                title: string;
                body: string;
            }[];
            opportunities: {
                type: "mixed" | "alignment" | "whitespace" | "destination";
                id: string;
                evidenceClaimIds: string[];
                title: string;
                relationships: string[];
                analysisRunId: string;
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
                validationRequirements: string[];
                eligible: boolean;
                confidence?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
                commercialLogic?: string | undefined;
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
                evidenceClaimIds: string[];
                title: string;
                analysisRunId: string;
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
                culturalRelationships: string[];
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
                conceptType?: string | undefined;
                fitForAudience?: string | undefined;
                opportunityCaptured?: string | undefined;
                whyWeakerThanAlternatives?: string | undefined;
                qlooEvidenceSummary?: string | undefined;
                opportunityId?: string | undefined;
                decisionFit?: string | undefined;
            }[];
            updatedAt: string;
            relationships: {
                object: string;
                id: string;
                subject: string;
                audienceIds: string[];
                evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                limitations: string[];
                interpretation: string;
                evidenceClaimIds: string[];
                relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
                commercialRelevance: string;
                seedCount?: number | undefined;
                score?: number | undefined;
            }[];
            organisationProfiles: {
                type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
                id: string;
                name: string;
                primary: boolean;
                deliverables: string[];
                mandate?: string | undefined;
            }[];
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
            audienceResolutions: {
                status: "approximate" | "failed" | "unresolved" | "resolved";
                id: string;
                name: string;
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                limitations: string[];
                query: string;
                identifiers: {
                    displayName: string;
                    uuid?: string | undefined;
                    urn?: string | undefined;
                    entityType?: string | undefined;
                    domain?: string | undefined;
                    environment?: string | undefined;
                }[];
                seeds: {
                    displayName: string;
                    uuid?: string | undefined;
                    urn?: string | undefined;
                    entityType?: string | undefined;
                    domain?: string | undefined;
                    environment?: string | undefined;
                }[];
                affinities: {
                    target: string;
                    strength: number;
                    seedCount: number;
                    urn?: string | undefined;
                    domain?: string | undefined;
                    targetId?: string | undefined;
                    genre?: string | undefined;
                    city?: string | undefined;
                    evidenceClaimId?: string | undefined;
                }[];
                evidenceClaimIds: string[];
                priority?: number | undefined;
                description?: string | undefined;
            }[];
            evidenceClaims: {
                id: string;
                qlooRefs: string[];
                stage: string;
                claim: string;
                evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                source: "inference" | "assumption" | "qloo" | "local";
                quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                scope: {
                    audienceIds: string[];
                    place?: string | undefined;
                    geography?: string | undefined;
                };
                localRefs: string[];
                supporting: string[];
                limitations: string[];
                validationRequired: string[];
                confidence?: number | undefined;
                interpretation?: string | undefined;
                implication?: string | undefined;
                sourceEnvironment?: string | undefined;
                observedAt?: string | undefined;
            }[];
            runId: string;
            projectId: string;
            stageStates: {
                message: string;
                status: "failed" | "degraded" | "complete" | "skipped" | "pending";
                stage: "cross_domain" | "decision_frame" | "place_resolution" | "audience_resolution" | "affinity_collection" | "audience_profiles" | "evidence_gate" | "cultural_patterns" | "opportunities" | "strategies" | "spatial_translation" | "review";
                evidenceClaimIds: string[];
                source?: string | undefined;
                quality?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
                updatedAt?: string | undefined;
            }[];
            requirements: {
                id: string;
                source: "inference" | "constraint" | "evidence" | "operation";
                priority: "low" | "medium" | "high";
                rationale: string;
                strategyId: string;
                requirement: string;
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
                viewLabels: string[];
                model: string;
            }[];
            reviews: {
                id: string;
                resolved: boolean;
                createdAt: string;
                feedback: string;
                chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
                diagnosis: string;
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
            primaryProfileId?: string | undefined;
            decisionFrame?: {
                type: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice";
                subject: string;
                successTests: string[];
                constraints: string[];
                timeHorizon?: string | undefined;
                capitalIntent?: string | undefined;
            } | undefined;
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
            intelligenceMode?: "mixed" | "live" | "template" | undefined;
            locationContext?: {
                query: string;
                notes: string[];
                evidenceQuality: "strong" | "moderate" | "insufficient";
                coverageQuality: "comprehensive" | "partial" | "sparse";
                pois: {
                    name: string;
                    lat?: number | undefined;
                    lng?: number | undefined;
                    category?: string | undefined;
                    distanceM?: number | undefined;
                }[];
                displayName?: string | undefined;
                city?: string | undefined;
                lat?: number | undefined;
                lng?: number | undefined;
            } | undefined;
            qlooContext?: {
                insufficient: boolean;
                source: "failed" | "mixed" | "live" | "mock" | "unavailable";
                affinities: any[];
                notes: string[];
                entities: any[];
                culturalPatterns: {
                    implication: string;
                    key: string;
                    label: string;
                    count: number;
                    places: string[];
                    genres: string[];
                }[];
                culturalThesis: string;
                audienceResolutions: {
                    status: "approximate" | "failed" | "unresolved" | "resolved";
                    id: string;
                    name: string;
                    quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                    limitations: string[];
                    query: string;
                    identifiers: {
                        displayName: string;
                        uuid?: string | undefined;
                        urn?: string | undefined;
                        entityType?: string | undefined;
                        domain?: string | undefined;
                        environment?: string | undefined;
                    }[];
                    seeds: {
                        displayName: string;
                        uuid?: string | undefined;
                        urn?: string | undefined;
                        entityType?: string | undefined;
                        domain?: string | undefined;
                        environment?: string | undefined;
                    }[];
                    affinities: {
                        target: string;
                        strength: number;
                        seedCount: number;
                        urn?: string | undefined;
                        domain?: string | undefined;
                        targetId?: string | undefined;
                        genre?: string | undefined;
                        city?: string | undefined;
                        evidenceClaimId?: string | undefined;
                    }[];
                    evidenceClaimIds: string[];
                    priority?: number | undefined;
                    description?: string | undefined;
                }[];
                evidenceClaims: {
                    id: string;
                    qlooRefs: string[];
                    stage: string;
                    claim: string;
                    evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                    source: "inference" | "assumption" | "qloo" | "local";
                    quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                    scope: {
                        audienceIds: string[];
                        place?: string | undefined;
                        geography?: string | undefined;
                    };
                    localRefs: string[];
                    supporting: string[];
                    limitations: string[];
                    validationRequired: string[];
                    confidence?: number | undefined;
                    interpretation?: string | undefined;
                    implication?: string | undefined;
                    sourceEnvironment?: string | undefined;
                    observedAt?: string | undefined;
                }[];
                environment?: string | undefined;
                locationResolution?: {
                    scope: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global";
                    resolved: boolean;
                    candidatesTried: string[];
                    query?: string | undefined;
                } | undefined;
                audienceAffinities?: Record<string, any[]> | undefined;
                crossDomain?: any;
                failure?: {
                    message: string;
                    kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
                    retryable: boolean;
                    status?: number | undefined;
                    environment?: string | undefined;
                    endpoint?: string | undefined;
                } | undefined;
            } | undefined;
            decisionBrief?: {
                deliverables: {
                    type: string;
                    id: string;
                    limitations: string[];
                    evidenceClaimIds: string[];
                    title: string;
                    body: string;
                }[];
                mode: "discover" | "evaluate";
                frame: {
                    type: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice";
                    subject: string;
                    successTests: string[];
                    constraints: string[];
                    timeHorizon?: string | undefined;
                    capitalIntent?: string | undefined;
                };
                profiles: {
                    type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
                    id: string;
                    name: string;
                    primary: boolean;
                    deliverables: string[];
                    mandate?: string | undefined;
                }[];
                placeSummary: string;
                audienceSummary: string;
                culturalSummary: string;
                relationships: {
                    object: string;
                    id: string;
                    subject: string;
                    audienceIds: string[];
                    evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
                    quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
                    limitations: string[];
                    interpretation: string;
                    evidenceClaimIds: string[];
                    relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
                    commercialRelevance: string;
                    seedCount?: number | undefined;
                    score?: number | undefined;
                }[];
                opportunityIds: string[];
                uncertainty: string[];
                nextInvestigation: string[];
                primaryProfileId?: string | undefined;
            } | undefined;
            landscapes?: {
                existing: {
                    type: "existing" | "potential" | "proposed";
                    summary: string;
                    experiences: {
                        name: string;
                        source?: "inference" | "qloo" | "local" | undefined;
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
                        source?: "inference" | "qloo" | "local" | undefined;
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
                        source?: "inference" | "qloo" | "local" | undefined;
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
                qlooStatus?: "failed" | "degraded" | "ready" | "missing" | undefined;
                blockedReason?: string | undefined;
                contractFailure?: {
                    message: string;
                    kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
                    retryable: boolean;
                    status?: number | undefined;
                    environment?: string | undefined;
                    endpoint?: string | undefined;
                } | undefined;
                evidenceSummary?: {
                    canRecommend: boolean;
                    canDiscover: boolean;
                    missingEvidence: string[];
                    whatWouldResolveIt: string[];
                } | undefined;
            } | undefined;
            progress?: {
                at: string;
                message: string;
                stage: string;
            } | undefined;
            error?: string | undefined;
            placeProfile?: {
                evidenceQuality: "strong" | "moderate" | "insufficient";
                placeIdentity: string;
                communityProfile: string;
                culturalAssets: string[];
                commercialSupply: string;
                behaviouralSignals: string;
                unmetNeeds: string[];
            } | undefined;
            retailOutput?: {
                positioning: string;
                gaps: string[];
                evidenceSummary: string;
                categoryMix: {
                    confidence: "strong" | "moderate" | "weak";
                    alignment: string;
                    evidence: string[];
                    category: string;
                }[];
                formatRecommendation: string;
                communityFit: string;
                localCollaborations: string[];
            } | undefined;
            operatorOutput?: {
                evidenceSummary: string;
                programmingModel: string;
                experienceMix: {
                    type: string;
                    rationale: string;
                    evidence: string[];
                    proportion: "primary" | "secondary" | "supplementary";
                }[];
                activations: {
                    rationale: string;
                    evidence: string[];
                    activity: string;
                    audience: string;
                    frequency: string;
                    spaceRequired?: string | undefined;
                }[];
                tenantRationale: {
                    why: string;
                    evidence: string[];
                    tenantType: string;
                }[];
                whatToStop: string[];
            } | undefined;
            hospitalityOutput?: {
                evidenceSummary: string;
                programmingModel: string;
                conceptIdentity: string;
                fbStrategy: string;
                daypartStrategy: string;
                atmosphereNotes: string;
            } | undefined;
        };
    }>;
    generateExperienceRequirements(input: OrchestratorInput & {
        strategy: any;
    }): Promise<{
        requirements: {
            id: string;
            source: "inference" | "constraint" | "evidence" | "operation";
            priority: "low" | "medium" | "high";
            rationale: string;
            strategyId: string;
            requirement: string;
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
            source: "inference" | "constraint" | "evidence" | "operation";
            priority: "low" | "medium" | "high";
            rationale: string;
            strategyId: string;
            requirement: string;
            zone?: string | undefined;
        }[];
    }>;
}
