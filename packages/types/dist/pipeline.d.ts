import { z } from 'zod';
import { ProjectSchema } from './project';
export declare const OpportunityTypeSchema: z.ZodEnum<["alignment", "whitespace", "destination", "mixed"]>;
export declare const OpportunitySchema: z.ZodObject<{
    id: z.ZodString;
    analysisRunId: z.ZodString;
    type: z.ZodEnum<["alignment", "whitespace", "destination", "mixed"]>;
    title: z.ZodString;
    whoServes: z.ZodString;
    why: z.ZodString;
    evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    assumptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    uncertainties: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    competitors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    rationale: z.ZodString;
    qlooEstablished: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    locallyEstablished: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    inferred: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    provenance: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        kind: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
        explanation: z.ZodString;
        refs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        refs: string[];
        qlooRefs: string[];
        parentId?: string | null | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "mixed" | "alignment" | "whitespace" | "destination";
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
}, {
    type: "mixed" | "alignment" | "whitespace" | "destination";
    id: string;
    analysisRunId: string;
    title: string;
    whoServes: string;
    why: string;
    rationale: string;
    evidenceRefs?: string[] | undefined;
    assumptions?: string[] | undefined;
    uncertainties?: string[] | undefined;
    competitors?: string[] | undefined;
    qlooEstablished?: string[] | undefined;
    locallyEstablished?: string[] | undefined;
    inferred?: string[] | undefined;
    provenance?: {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    } | undefined;
}>;
export declare const StrategySchema: z.ZodObject<{
    id: z.ZodString;
    analysisRunId: z.ZodString;
    selected: z.ZodDefault<z.ZodBoolean>;
    direction: z.ZodString;
    title: z.ZodString;
    whoServes: z.ZodString;
    why: z.ZodString;
    experienceThesis: z.ZodString;
    competitors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    risks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    differentiation: z.ZodString;
    evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    assumptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    uncertainties: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    physicalExperience: z.ZodOptional<z.ZodString>;
    qlooEstablished: z.ZodOptional<z.ZodString>;
    locallyEstablished: z.ZodOptional<z.ZodString>;
    inferred: z.ZodOptional<z.ZodString>;
    provenance: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        kind: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
        explanation: z.ZodString;
        refs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        refs: string[];
        qlooRefs: string[];
        parentId?: string | null | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
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
}, {
    id: string;
    analysisRunId: string;
    title: string;
    whoServes: string;
    why: string;
    direction: string;
    experienceThesis: string;
    differentiation: string;
    evidenceRefs?: string[] | undefined;
    assumptions?: string[] | undefined;
    uncertainties?: string[] | undefined;
    competitors?: string[] | undefined;
    qlooEstablished?: string | undefined;
    locallyEstablished?: string | undefined;
    inferred?: string | undefined;
    provenance?: {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    } | undefined;
    selected?: boolean | undefined;
    risks?: string[] | undefined;
    physicalExperience?: string | undefined;
}>;
export declare const ExperienceRequirementSchema: z.ZodObject<{
    id: z.ZodString;
    strategyId: z.ZodString;
    requirement: z.ZodString;
    rationale: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    source: z.ZodDefault<z.ZodEnum<["evidence", "inference", "constraint", "operation"]>>;
    zone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    priority: "low" | "medium" | "high";
    rationale: string;
    strategyId: string;
    requirement: string;
    source: "inference" | "constraint" | "evidence" | "operation";
    zone?: string | undefined;
}, {
    id: string;
    rationale: string;
    strategyId: string;
    requirement: string;
    priority?: "low" | "medium" | "high" | undefined;
    source?: "inference" | "constraint" | "evidence" | "operation" | undefined;
    zone?: string | undefined;
}>;
export declare const ArchitecturalDecisionSchema: z.ZodObject<{
    id: z.ZodString;
    strategyId: z.ZodString;
    zone: z.ZodString;
    decision: z.ZodString;
    whyChain: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        kind: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
        explanation: z.ZodString;
        refs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        refs: string[];
        qlooRefs: string[];
        parentId?: string | null | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }>, "many">>;
    alternatives: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    constraintsConsidered: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    qlooEstablished: z.ZodOptional<z.ZodString>;
    locallyEstablished: z.ZodOptional<z.ZodString>;
    inferred: z.ZodOptional<z.ZodString>;
    unverified: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
}, {
    decision: string;
    id: string;
    strategyId: string;
    zone: string;
    qlooEstablished?: string | undefined;
    locallyEstablished?: string | undefined;
    inferred?: string | undefined;
    whyChain?: {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }[] | undefined;
    alternatives?: string[] | undefined;
    constraintsConsidered?: string[] | undefined;
    unverified?: string | undefined;
}>;
export declare const LandscapeExperienceSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["local", "qloo", "inference"]>>;
    affinity: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    source?: "inference" | "local" | "qloo" | undefined;
    category?: string | undefined;
    notes?: string | undefined;
    affinity?: number | undefined;
}, {
    name: string;
    source?: "inference" | "local" | "qloo" | undefined;
    category?: string | undefined;
    notes?: string | undefined;
    affinity?: number | undefined;
}>;
export declare const CulturalLandscapeSchema: z.ZodObject<{
    type: z.ZodEnum<["existing", "potential", "proposed"]>;
    summary: z.ZodString;
    experiences: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodEnum<["local", "qloo", "inference"]>>;
        affinity: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        source?: "inference" | "local" | "qloo" | undefined;
        category?: string | undefined;
        notes?: string | undefined;
        affinity?: number | undefined;
    }, {
        name: string;
        source?: "inference" | "local" | "qloo" | undefined;
        category?: string | undefined;
        notes?: string | undefined;
        affinity?: number | undefined;
    }>, "many">>;
    audiencesServed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    crowdedPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    gaps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
}, "strip", z.ZodTypeAny, {
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
}, {
    type: "existing" | "potential" | "proposed";
    summary: string;
    experiences?: {
        name: string;
        source?: "inference" | "local" | "qloo" | undefined;
        category?: string | undefined;
        notes?: string | undefined;
        affinity?: number | undefined;
    }[] | undefined;
    audiencesServed?: string[] | undefined;
    crowdedPatterns?: string[] | undefined;
    gaps?: string[] | undefined;
    evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
}>;
export declare const AudienceRelationshipSchema: z.ZodObject<{
    shared: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    complementary: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    conflicting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    spatialImplications: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    shared: string[];
    complementary: string[];
    conflicting: string[];
    spatialImplications: string;
}, {
    shared?: string[] | undefined;
    complementary?: string[] | undefined;
    conflicting?: string[] | undefined;
    spatialImplications?: string | undefined;
}>;
export declare const SpatialZoneSchema: z.ZodObject<{
    name: z.ZodString;
    purpose: z.ZodString;
    character: z.ZodOptional<z.ZodString>;
    adjacency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    purpose: string;
    character?: string | undefined;
    adjacency?: string | undefined;
}, {
    name: string;
    purpose: string;
    character?: string | undefined;
    adjacency?: string | undefined;
}>;
export declare const SpatialLayoutRoomSchema: z.ZodObject<{
    name: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    w: z.ZodNumber;
    h: z.ZodNumber;
    purpose: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    purpose?: string | undefined;
}, {
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    purpose?: string | undefined;
}>;
export declare const SpatialConceptSchema: z.ZodObject<{
    organization: z.ZodDefault<z.ZodString>;
    zones: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        purpose: z.ZodString;
        character: z.ZodOptional<z.ZodString>;
        adjacency: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        purpose: string;
        character?: string | undefined;
        adjacency?: string | undefined;
    }, {
        name: string;
        purpose: string;
        character?: string | undefined;
        adjacency?: string | undefined;
    }>, "many">>;
    materials: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    lighting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    furniture: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    circulation: z.ZodOptional<z.ZodString>;
    exterior: z.ZodOptional<z.ZodString>;
    opsNotes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    layout: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodNumber;
        h: z.ZodNumber;
        purpose: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        x: number;
        y: number;
        w: number;
        h: number;
        purpose?: string | undefined;
    }, {
        name: string;
        x: number;
        y: number;
        w: number;
        h: number;
        purpose?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
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
}, {
    organization?: string | undefined;
    zones?: {
        name: string;
        purpose: string;
        character?: string | undefined;
        adjacency?: string | undefined;
    }[] | undefined;
    materials?: string[] | undefined;
    lighting?: string[] | undefined;
    furniture?: string[] | undefined;
    circulation?: string | undefined;
    exterior?: string | undefined;
    opsNotes?: string[] | undefined;
    layout?: {
        name: string;
        x: number;
        y: number;
        w: number;
        h: number;
        purpose?: string | undefined;
    }[] | undefined;
}>;
export declare const VisualizationSchema: z.ZodObject<{
    id: z.ZodString;
    prompt: z.ZodString;
    images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    model: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    prompt: string;
    images: string[];
    model: string;
}, {
    id: string;
    createdAt: string;
    prompt: string;
    model: string;
    images?: string[] | undefined;
}>;
export declare const ReviewSnapshotSchema: z.ZodObject<{
    strategyTitle: z.ZodOptional<z.ZodString>;
    requirementCount: z.ZodOptional<z.ZodNumber>;
    decisionSummaries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    decisionSummaries: string[];
    strategyTitle?: string | undefined;
    requirementCount?: number | undefined;
}, {
    strategyTitle?: string | undefined;
    requirementCount?: number | undefined;
    decisionSummaries?: string[] | undefined;
}>;
export declare const ReviewSchema: z.ZodObject<{
    id: z.ZodString;
    feedback: z.ZodString;
    chainLevel: z.ZodEnum<["evidence", "opportunity", "strategy", "experience", "architecture", "visualization"]>;
    diagnosis: z.ZodString;
    guidance: z.ZodOptional<z.ZodString>;
    resolved: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    before: z.ZodOptional<z.ZodObject<{
        strategyTitle: z.ZodOptional<z.ZodString>;
        requirementCount: z.ZodOptional<z.ZodNumber>;
        decisionSummaries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        decisionSummaries: string[];
        strategyTitle?: string | undefined;
        requirementCount?: number | undefined;
    }, {
        strategyTitle?: string | undefined;
        requirementCount?: number | undefined;
        decisionSummaries?: string[] | undefined;
    }>>;
    after: z.ZodOptional<z.ZodObject<{
        strategyTitle: z.ZodOptional<z.ZodString>;
        requirementCount: z.ZodOptional<z.ZodNumber>;
        decisionSummaries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        decisionSummaries: string[];
        strategyTitle?: string | undefined;
        requirementCount?: number | undefined;
    }, {
        strategyTitle?: string | undefined;
        requirementCount?: number | undefined;
        decisionSummaries?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
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
}, {
    id: string;
    createdAt: string;
    feedback: string;
    chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
    diagnosis: string;
    guidance?: string | undefined;
    resolved?: boolean | undefined;
    before?: {
        strategyTitle?: string | undefined;
        requirementCount?: number | undefined;
        decisionSummaries?: string[] | undefined;
    } | undefined;
    after?: {
        strategyTitle?: string | undefined;
        requirementCount?: number | undefined;
        decisionSummaries?: string[] | undefined;
    } | undefined;
}>;
export declare const FloorPlanRoomSchema: z.ZodObject<{
    name: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    approxShare: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    notes?: string | undefined;
    approxShare?: number | undefined;
}, {
    name: string;
    notes?: string | undefined;
    approxShare?: number | undefined;
}>;
export declare const FloorPlanReadingSchema: z.ZodObject<{
    source: z.ZodEnum<["vision", "brief", "none"]>;
    summary: z.ZodString;
    rooms: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
        approxShare: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        notes?: string | undefined;
        approxShare?: number | undefined;
    }, {
        name: string;
        notes?: string | undefined;
        approxShare?: number | undefined;
    }>, "many">>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    usable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    constraints: string[];
    source: "vision" | "brief" | "none";
    summary: string;
    rooms: {
        name: string;
        notes?: string | undefined;
        approxShare?: number | undefined;
    }[];
    usable: boolean;
}, {
    source: "vision" | "brief" | "none";
    summary: string;
    constraints?: string[] | undefined;
    rooms?: {
        name: string;
        notes?: string | undefined;
        approxShare?: number | undefined;
    }[] | undefined;
    usable?: boolean | undefined;
}>;
export declare const EvidenceGateSchema: z.ZodObject<{
    locationQuality: z.ZodEnum<["strong", "moderate", "insufficient"]>;
    qlooQuality: z.ZodEnum<["strong", "moderate", "insufficient"]>;
    llmAvailable: z.ZodBoolean;
    intelligenceMode: z.ZodEnum<["live", "mixed", "template"]>;
    allowConfidentRecommendation: z.ZodBoolean;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    locationQuality: "strong" | "moderate" | "insufficient";
    qlooQuality: "strong" | "moderate" | "insufficient";
    llmAvailable: boolean;
    intelligenceMode: "mixed" | "live" | "template";
    allowConfidentRecommendation: boolean;
    warnings: string[];
}, {
    locationQuality: "strong" | "moderate" | "insufficient";
    qlooQuality: "strong" | "moderate" | "insufficient";
    llmAvailable: boolean;
    intelligenceMode: "mixed" | "live" | "template";
    allowConfidentRecommendation: boolean;
    warnings?: string[] | undefined;
}>;
export declare const JobProgressSchema: z.ZodObject<{
    stage: z.ZodString;
    message: z.ZodString;
    at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    at: string;
    message: string;
    stage: string;
}, {
    at: string;
    message: string;
    stage: string;
}>;
export declare const PlacePoiSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    distanceM: z.ZodOptional<z.ZodNumber>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    lat?: number | undefined;
    lng?: number | undefined;
    category?: string | undefined;
    distanceM?: number | undefined;
}, {
    name: string;
    lat?: number | undefined;
    lng?: number | undefined;
    category?: string | undefined;
    distanceM?: number | undefined;
}>;
export declare const LocationContextSchema: z.ZodObject<{
    query: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    city: z.ZodOptional<z.ZodString>;
    evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
    pois: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        distanceM: z.ZodOptional<z.ZodNumber>;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        lat?: number | undefined;
        lng?: number | undefined;
        category?: string | undefined;
        distanceM?: number | undefined;
    }, {
        name: string;
        lat?: number | undefined;
        lng?: number | undefined;
        category?: string | undefined;
        distanceM?: number | undefined;
    }>, "many">>;
    notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
}, {
    query: string;
    lat?: number | undefined;
    lng?: number | undefined;
    city?: string | undefined;
    notes?: string[] | undefined;
    evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
    displayName?: string | undefined;
    pois?: {
        name: string;
        lat?: number | undefined;
        lng?: number | undefined;
        category?: string | undefined;
        distanceM?: number | undefined;
    }[] | undefined;
}>;
export declare const QlooContextSchema: z.ZodObject<{
    source: z.ZodDefault<z.ZodEnum<["live", "mock", "mixed"]>>;
    entities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    affinities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    audienceAffinities: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>>;
    crossDomain: z.ZodOptional<z.ZodAny>;
    notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    insufficient: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    source: "mixed" | "live" | "mock";
    notes: string[];
    insufficient: boolean;
    entities: any[];
    affinities: any[];
    audienceAffinities?: Record<string, any[]> | undefined;
    crossDomain?: any;
}, {
    source?: "mixed" | "live" | "mock" | undefined;
    notes?: string[] | undefined;
    insufficient?: boolean | undefined;
    entities?: any[] | undefined;
    affinities?: any[] | undefined;
    audienceAffinities?: Record<string, any[]> | undefined;
    crossDomain?: any;
}>;
export declare const CounterfactualSchema: z.ZodObject<{
    summary: z.ZodString;
    genericStrategy: z.ZodString;
    culturalStrategy: z.ZodString;
    whatQlooChanged: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    caveat: z.ZodString;
}, "strip", z.ZodTypeAny, {
    summary: string;
    genericStrategy: string;
    culturalStrategy: string;
    whatQlooChanged: string[];
    caveat: string;
}, {
    summary: string;
    genericStrategy: string;
    culturalStrategy: string;
    caveat: string;
    whatQlooChanged?: string[] | undefined;
}>;
export declare const AnalysisSnapshotSchema: z.ZodObject<{
    runId: z.ZodString;
    projectId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["idle", "analyzing", "ready", "strategy_selected", "designed", "visualized", "review"]>>;
    locationContext: z.ZodOptional<z.ZodObject<{
        query: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
        city: z.ZodOptional<z.ZodString>;
        evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
        pois: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            category: z.ZodOptional<z.ZodString>;
            distanceM: z.ZodOptional<z.ZodNumber>;
            lat: z.ZodOptional<z.ZodNumber>;
            lng: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            lat?: number | undefined;
            lng?: number | undefined;
            category?: string | undefined;
            distanceM?: number | undefined;
        }, {
            name: string;
            lat?: number | undefined;
            lng?: number | undefined;
            category?: string | undefined;
            distanceM?: number | undefined;
        }>, "many">>;
        notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        query: string;
        lat?: number | undefined;
        lng?: number | undefined;
        city?: string | undefined;
        notes?: string[] | undefined;
        evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        displayName?: string | undefined;
        pois?: {
            name: string;
            lat?: number | undefined;
            lng?: number | undefined;
            category?: string | undefined;
            distanceM?: number | undefined;
        }[] | undefined;
    }>>;
    qlooContext: z.ZodOptional<z.ZodObject<{
        source: z.ZodDefault<z.ZodEnum<["live", "mock", "mixed"]>>;
        entities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
        affinities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
        audienceAffinities: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>>;
        crossDomain: z.ZodOptional<z.ZodAny>;
        notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        insufficient: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        source: "mixed" | "live" | "mock";
        notes: string[];
        insufficient: boolean;
        entities: any[];
        affinities: any[];
        audienceAffinities?: Record<string, any[]> | undefined;
        crossDomain?: any;
    }, {
        source?: "mixed" | "live" | "mock" | undefined;
        notes?: string[] | undefined;
        insufficient?: boolean | undefined;
        entities?: any[] | undefined;
        affinities?: any[] | undefined;
        audienceAffinities?: Record<string, any[]> | undefined;
        crossDomain?: any;
    }>>;
    landscapes: z.ZodOptional<z.ZodObject<{
        existing: z.ZodObject<{
            type: z.ZodEnum<["existing", "potential", "proposed"]>;
            summary: z.ZodString;
            experiences: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                category: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
                source: z.ZodOptional<z.ZodEnum<["local", "qloo", "inference"]>>;
                affinity: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }, {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }>, "many">>;
            audiencesServed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            crowdedPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            gaps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        }>;
        potential: z.ZodObject<{
            type: z.ZodEnum<["existing", "potential", "proposed"]>;
            summary: z.ZodString;
            experiences: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                category: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
                source: z.ZodOptional<z.ZodEnum<["local", "qloo", "inference"]>>;
                affinity: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }, {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }>, "many">>;
            audiencesServed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            crowdedPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            gaps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        }>;
        proposed: z.ZodObject<{
            type: z.ZodEnum<["existing", "potential", "proposed"]>;
            summary: z.ZodString;
            experiences: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                category: z.ZodOptional<z.ZodString>;
                notes: z.ZodOptional<z.ZodString>;
                source: z.ZodOptional<z.ZodEnum<["local", "qloo", "inference"]>>;
                affinity: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }, {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }>, "many">>;
            audiencesServed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            crowdedPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            gaps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        existing: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        };
        potential: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        };
        proposed: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        };
    }>>;
    audienceAnalysis: z.ZodOptional<z.ZodObject<{
        shared: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        complementary: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        conflicting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        spatialImplications: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        shared: string[];
        complementary: string[];
        conflicting: string[];
        spatialImplications: string;
    }, {
        shared?: string[] | undefined;
        complementary?: string[] | undefined;
        conflicting?: string[] | undefined;
        spatialImplications?: string | undefined;
    }>>;
    opportunities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        analysisRunId: z.ZodString;
        type: z.ZodEnum<["alignment", "whitespace", "destination", "mixed"]>;
        title: z.ZodString;
        whoServes: z.ZodString;
        why: z.ZodString;
        evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        assumptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        uncertainties: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        competitors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        rationale: z.ZodString;
        qlooEstablished: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        locallyEstablished: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        inferred: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        provenance: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            kind: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
            explanation: z.ZodString;
            refs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            confidence: z.ZodOptional<z.ZodNumber>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            refs: string[];
            qlooRefs: string[];
            parentId?: string | null | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }, {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "mixed" | "alignment" | "whitespace" | "destination";
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
    }, {
        type: "mixed" | "alignment" | "whitespace" | "destination";
        id: string;
        analysisRunId: string;
        title: string;
        whoServes: string;
        why: string;
        rationale: string;
        evidenceRefs?: string[] | undefined;
        assumptions?: string[] | undefined;
        uncertainties?: string[] | undefined;
        competitors?: string[] | undefined;
        qlooEstablished?: string[] | undefined;
        locallyEstablished?: string[] | undefined;
        inferred?: string[] | undefined;
        provenance?: {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        } | undefined;
    }>, "many">>;
    strategies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        analysisRunId: z.ZodString;
        selected: z.ZodDefault<z.ZodBoolean>;
        direction: z.ZodString;
        title: z.ZodString;
        whoServes: z.ZodString;
        why: z.ZodString;
        experienceThesis: z.ZodString;
        competitors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        risks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        differentiation: z.ZodString;
        evidenceRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        assumptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        uncertainties: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        physicalExperience: z.ZodOptional<z.ZodString>;
        qlooEstablished: z.ZodOptional<z.ZodString>;
        locallyEstablished: z.ZodOptional<z.ZodString>;
        inferred: z.ZodOptional<z.ZodString>;
        provenance: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            kind: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
            explanation: z.ZodString;
            refs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            confidence: z.ZodOptional<z.ZodNumber>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            refs: string[];
            qlooRefs: string[];
            parentId?: string | null | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }, {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        id: string;
        analysisRunId: string;
        title: string;
        whoServes: string;
        why: string;
        direction: string;
        experienceThesis: string;
        differentiation: string;
        evidenceRefs?: string[] | undefined;
        assumptions?: string[] | undefined;
        uncertainties?: string[] | undefined;
        competitors?: string[] | undefined;
        qlooEstablished?: string | undefined;
        locallyEstablished?: string | undefined;
        inferred?: string | undefined;
        provenance?: {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        } | undefined;
        selected?: boolean | undefined;
        risks?: string[] | undefined;
        physicalExperience?: string | undefined;
    }>, "many">>;
    selectedStrategyId: z.ZodOptional<z.ZodString>;
    requirements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        strategyId: z.ZodString;
        requirement: z.ZodString;
        rationale: z.ZodString;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
        source: z.ZodDefault<z.ZodEnum<["evidence", "inference", "constraint", "operation"]>>;
        zone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        priority: "low" | "medium" | "high";
        rationale: string;
        strategyId: string;
        requirement: string;
        source: "inference" | "constraint" | "evidence" | "operation";
        zone?: string | undefined;
    }, {
        id: string;
        rationale: string;
        strategyId: string;
        requirement: string;
        priority?: "low" | "medium" | "high" | undefined;
        source?: "inference" | "constraint" | "evidence" | "operation" | undefined;
        zone?: string | undefined;
    }>, "many">>;
    decisions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        strategyId: z.ZodString;
        zone: z.ZodString;
        decision: z.ZodString;
        whyChain: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            kind: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
            explanation: z.ZodString;
            refs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            confidence: z.ZodOptional<z.ZodNumber>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            refs: string[];
            qlooRefs: string[];
            parentId?: string | null | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }, {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }>, "many">>;
        alternatives: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        constraintsConsidered: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        qlooEstablished: z.ZodOptional<z.ZodString>;
        locallyEstablished: z.ZodOptional<z.ZodString>;
        inferred: z.ZodOptional<z.ZodString>;
        unverified: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        decision: string;
        id: string;
        strategyId: string;
        zone: string;
        qlooEstablished?: string | undefined;
        locallyEstablished?: string | undefined;
        inferred?: string | undefined;
        whyChain?: {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }[] | undefined;
        alternatives?: string[] | undefined;
        constraintsConsidered?: string[] | undefined;
        unverified?: string | undefined;
    }>, "many">>;
    concept: z.ZodOptional<z.ZodObject<{
        organization: z.ZodDefault<z.ZodString>;
        zones: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            purpose: z.ZodString;
            character: z.ZodOptional<z.ZodString>;
            adjacency: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            purpose: string;
            character?: string | undefined;
            adjacency?: string | undefined;
        }, {
            name: string;
            purpose: string;
            character?: string | undefined;
            adjacency?: string | undefined;
        }>, "many">>;
        materials: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        lighting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        furniture: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        circulation: z.ZodOptional<z.ZodString>;
        exterior: z.ZodOptional<z.ZodString>;
        opsNotes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        layout: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
            purpose: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            x: number;
            y: number;
            w: number;
            h: number;
            purpose?: string | undefined;
        }, {
            name: string;
            x: number;
            y: number;
            w: number;
            h: number;
            purpose?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        organization?: string | undefined;
        zones?: {
            name: string;
            purpose: string;
            character?: string | undefined;
            adjacency?: string | undefined;
        }[] | undefined;
        materials?: string[] | undefined;
        lighting?: string[] | undefined;
        furniture?: string[] | undefined;
        circulation?: string | undefined;
        exterior?: string | undefined;
        opsNotes?: string[] | undefined;
        layout?: {
            name: string;
            x: number;
            y: number;
            w: number;
            h: number;
            purpose?: string | undefined;
        }[] | undefined;
    }>>;
    visualizations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        prompt: z.ZodString;
        images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        model: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        prompt: string;
        images: string[];
        model: string;
    }, {
        id: string;
        createdAt: string;
        prompt: string;
        model: string;
        images?: string[] | undefined;
    }>, "many">>;
    provenance: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        kind: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
        explanation: z.ZodString;
        refs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodOptional<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        refs: string[];
        qlooRefs: string[];
        parentId?: string | null | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }>, "many">>;
    reviews: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        feedback: z.ZodString;
        chainLevel: z.ZodEnum<["evidence", "opportunity", "strategy", "experience", "architecture", "visualization"]>;
        diagnosis: z.ZodString;
        guidance: z.ZodOptional<z.ZodString>;
        resolved: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodString;
        before: z.ZodOptional<z.ZodObject<{
            strategyTitle: z.ZodOptional<z.ZodString>;
            requirementCount: z.ZodOptional<z.ZodNumber>;
            decisionSummaries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            decisionSummaries: string[];
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
        }, {
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
            decisionSummaries?: string[] | undefined;
        }>>;
        after: z.ZodOptional<z.ZodObject<{
            strategyTitle: z.ZodOptional<z.ZodString>;
            requirementCount: z.ZodOptional<z.ZodNumber>;
            decisionSummaries: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            decisionSummaries: string[];
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
        }, {
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
            decisionSummaries?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        id: string;
        createdAt: string;
        feedback: string;
        chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
        diagnosis: string;
        guidance?: string | undefined;
        resolved?: boolean | undefined;
        before?: {
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
            decisionSummaries?: string[] | undefined;
        } | undefined;
        after?: {
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
            decisionSummaries?: string[] | undefined;
        } | undefined;
    }>, "many">>;
    counterfactual: z.ZodOptional<z.ZodObject<{
        summary: z.ZodString;
        genericStrategy: z.ZodString;
        culturalStrategy: z.ZodString;
        whatQlooChanged: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        caveat: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        genericStrategy: string;
        culturalStrategy: string;
        whatQlooChanged: string[];
        caveat: string;
    }, {
        summary: string;
        genericStrategy: string;
        culturalStrategy: string;
        caveat: string;
        whatQlooChanged?: string[] | undefined;
    }>>;
    floorPlan: z.ZodOptional<z.ZodObject<{
        source: z.ZodEnum<["vision", "brief", "none"]>;
        summary: z.ZodString;
        rooms: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            notes: z.ZodOptional<z.ZodString>;
            approxShare: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            notes?: string | undefined;
            approxShare?: number | undefined;
        }, {
            name: string;
            notes?: string | undefined;
            approxShare?: number | undefined;
        }>, "many">>;
        constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        usable: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        constraints: string[];
        source: "vision" | "brief" | "none";
        summary: string;
        rooms: {
            name: string;
            notes?: string | undefined;
            approxShare?: number | undefined;
        }[];
        usable: boolean;
    }, {
        source: "vision" | "brief" | "none";
        summary: string;
        constraints?: string[] | undefined;
        rooms?: {
            name: string;
            notes?: string | undefined;
            approxShare?: number | undefined;
        }[] | undefined;
        usable?: boolean | undefined;
    }>>;
    evidenceGate: z.ZodOptional<z.ZodObject<{
        locationQuality: z.ZodEnum<["strong", "moderate", "insufficient"]>;
        qlooQuality: z.ZodEnum<["strong", "moderate", "insufficient"]>;
        llmAvailable: z.ZodBoolean;
        intelligenceMode: z.ZodEnum<["live", "mixed", "template"]>;
        allowConfidentRecommendation: z.ZodBoolean;
        warnings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        locationQuality: "strong" | "moderate" | "insufficient";
        qlooQuality: "strong" | "moderate" | "insufficient";
        llmAvailable: boolean;
        intelligenceMode: "mixed" | "live" | "template";
        allowConfidentRecommendation: boolean;
        warnings: string[];
    }, {
        locationQuality: "strong" | "moderate" | "insufficient";
        qlooQuality: "strong" | "moderate" | "insufficient";
        llmAvailable: boolean;
        intelligenceMode: "mixed" | "live" | "template";
        allowConfidentRecommendation: boolean;
        warnings?: string[] | undefined;
    }>>;
    intelligenceMode: z.ZodOptional<z.ZodEnum<["live", "mixed", "template"]>>;
    progress: z.ZodOptional<z.ZodObject<{
        stage: z.ZodString;
        message: z.ZodString;
        at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        at: string;
        message: string;
        stage: string;
    }, {
        at: string;
        message: string;
        stage: string;
    }>>;
    error: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
        type: "mixed" | "alignment" | "whitespace" | "destination";
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
}, {
    updatedAt: string;
    runId: string;
    projectId: string;
    status?: "analyzing" | "review" | "idle" | "ready" | "strategy_selected" | "designed" | "visualized" | undefined;
    provenance?: {
        id: string;
        kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
        explanation: string;
        parentId?: string | null | undefined;
        refs?: string[] | undefined;
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        metadata?: Record<string, any> | undefined;
    }[] | undefined;
    intelligenceMode?: "mixed" | "live" | "template" | undefined;
    locationContext?: {
        query: string;
        lat?: number | undefined;
        lng?: number | undefined;
        city?: string | undefined;
        notes?: string[] | undefined;
        evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        displayName?: string | undefined;
        pois?: {
            name: string;
            lat?: number | undefined;
            lng?: number | undefined;
            category?: string | undefined;
            distanceM?: number | undefined;
        }[] | undefined;
    } | undefined;
    qlooContext?: {
        source?: "mixed" | "live" | "mock" | undefined;
        notes?: string[] | undefined;
        insufficient?: boolean | undefined;
        entities?: any[] | undefined;
        affinities?: any[] | undefined;
        audienceAffinities?: Record<string, any[]> | undefined;
        crossDomain?: any;
    } | undefined;
    landscapes?: {
        existing: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        };
        potential: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        };
        proposed: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "local" | "qloo" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }[] | undefined;
            audiencesServed?: string[] | undefined;
            crowdedPatterns?: string[] | undefined;
            gaps?: string[] | undefined;
            evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        };
    } | undefined;
    audienceAnalysis?: {
        shared?: string[] | undefined;
        complementary?: string[] | undefined;
        conflicting?: string[] | undefined;
        spatialImplications?: string | undefined;
    } | undefined;
    opportunities?: {
        type: "mixed" | "alignment" | "whitespace" | "destination";
        id: string;
        analysisRunId: string;
        title: string;
        whoServes: string;
        why: string;
        rationale: string;
        evidenceRefs?: string[] | undefined;
        assumptions?: string[] | undefined;
        uncertainties?: string[] | undefined;
        competitors?: string[] | undefined;
        qlooEstablished?: string[] | undefined;
        locallyEstablished?: string[] | undefined;
        inferred?: string[] | undefined;
        provenance?: {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        } | undefined;
    }[] | undefined;
    strategies?: {
        id: string;
        analysisRunId: string;
        title: string;
        whoServes: string;
        why: string;
        direction: string;
        experienceThesis: string;
        differentiation: string;
        evidenceRefs?: string[] | undefined;
        assumptions?: string[] | undefined;
        uncertainties?: string[] | undefined;
        competitors?: string[] | undefined;
        qlooEstablished?: string | undefined;
        locallyEstablished?: string | undefined;
        inferred?: string | undefined;
        provenance?: {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        } | undefined;
        selected?: boolean | undefined;
        risks?: string[] | undefined;
        physicalExperience?: string | undefined;
    }[] | undefined;
    selectedStrategyId?: string | undefined;
    requirements?: {
        id: string;
        rationale: string;
        strategyId: string;
        requirement: string;
        priority?: "low" | "medium" | "high" | undefined;
        source?: "inference" | "constraint" | "evidence" | "operation" | undefined;
        zone?: string | undefined;
    }[] | undefined;
    decisions?: {
        decision: string;
        id: string;
        strategyId: string;
        zone: string;
        qlooEstablished?: string | undefined;
        locallyEstablished?: string | undefined;
        inferred?: string | undefined;
        whyChain?: {
            id: string;
            kind: "qloo_evidence" | "inference" | "assumption" | "decision" | "external" | "constraint";
            explanation: string;
            parentId?: string | null | undefined;
            refs?: string[] | undefined;
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            metadata?: Record<string, any> | undefined;
        }[] | undefined;
        alternatives?: string[] | undefined;
        constraintsConsidered?: string[] | undefined;
        unverified?: string | undefined;
    }[] | undefined;
    concept?: {
        organization?: string | undefined;
        zones?: {
            name: string;
            purpose: string;
            character?: string | undefined;
            adjacency?: string | undefined;
        }[] | undefined;
        materials?: string[] | undefined;
        lighting?: string[] | undefined;
        furniture?: string[] | undefined;
        circulation?: string | undefined;
        exterior?: string | undefined;
        opsNotes?: string[] | undefined;
        layout?: {
            name: string;
            x: number;
            y: number;
            w: number;
            h: number;
            purpose?: string | undefined;
        }[] | undefined;
    } | undefined;
    visualizations?: {
        id: string;
        createdAt: string;
        prompt: string;
        model: string;
        images?: string[] | undefined;
    }[] | undefined;
    reviews?: {
        id: string;
        createdAt: string;
        feedback: string;
        chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
        diagnosis: string;
        guidance?: string | undefined;
        resolved?: boolean | undefined;
        before?: {
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
            decisionSummaries?: string[] | undefined;
        } | undefined;
        after?: {
            strategyTitle?: string | undefined;
            requirementCount?: number | undefined;
            decisionSummaries?: string[] | undefined;
        } | undefined;
    }[] | undefined;
    counterfactual?: {
        summary: string;
        genericStrategy: string;
        culturalStrategy: string;
        caveat: string;
        whatQlooChanged?: string[] | undefined;
    } | undefined;
    floorPlan?: {
        source: "vision" | "brief" | "none";
        summary: string;
        constraints?: string[] | undefined;
        rooms?: {
            name: string;
            notes?: string | undefined;
            approxShare?: number | undefined;
        }[] | undefined;
        usable?: boolean | undefined;
    } | undefined;
    evidenceGate?: {
        locationQuality: "strong" | "moderate" | "insufficient";
        qlooQuality: "strong" | "moderate" | "insufficient";
        llmAvailable: boolean;
        intelligenceMode: "mixed" | "live" | "template";
        allowConfidentRecommendation: boolean;
        warnings?: string[] | undefined;
    } | undefined;
    progress?: {
        at: string;
        message: string;
        stage: string;
    } | undefined;
    error?: string | undefined;
}>;
export declare const PIPELINE_STAGES: readonly [{
    readonly id: "place";
    readonly label: "Place & objective";
}, {
    readonly id: "culture";
    readonly label: "Cultural intelligence";
}, {
    readonly id: "opportunity";
    readonly label: "Opportunity discovery";
}, {
    readonly id: "strategy";
    readonly label: "Commercial strategy";
}, {
    readonly id: "experience";
    readonly label: "Experience requirements";
}, {
    readonly id: "architecture";
    readonly label: "Architectural decisions";
}, {
    readonly id: "concept";
    readonly label: "Spatial concept";
}, {
    readonly id: "visualization";
    readonly label: "Concept render";
}, {
    readonly id: "review";
    readonly label: "Professional review";
}];
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Strategy = z.infer<typeof StrategySchema>;
export type ExperienceRequirement = z.infer<typeof ExperienceRequirementSchema>;
export type ArchitecturalDecision = z.infer<typeof ArchitecturalDecisionSchema>;
export type CulturalLandscape = z.infer<typeof CulturalLandscapeSchema>;
export type AudienceRelationship = z.infer<typeof AudienceRelationshipSchema>;
export type SpatialLayoutRoom = z.infer<typeof SpatialLayoutRoomSchema>;
export type SpatialConcept = z.infer<typeof SpatialConceptSchema>;
export type FloorPlanReading = z.infer<typeof FloorPlanReadingSchema>;
export type EvidenceGate = z.infer<typeof EvidenceGateSchema>;
export type JobProgress = z.infer<typeof JobProgressSchema>;
export type ReviewSnapshot = z.infer<typeof ReviewSnapshotSchema>;
export type Visualization = z.infer<typeof VisualizationSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type PlacePoi = z.infer<typeof PlacePoiSchema>;
export type LocationContext = z.infer<typeof LocationContextSchema>;
export type QlooContext = z.infer<typeof QlooContextSchema>;
export type Counterfactual = z.infer<typeof CounterfactualSchema>;
export type AnalysisSnapshot = z.infer<typeof AnalysisSnapshotSchema>;
export type ProjectRecord = z.infer<typeof ProjectSchema>;
//# sourceMappingURL=pipeline.d.ts.map