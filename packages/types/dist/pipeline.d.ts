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
    relationships: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    commercialLogic: z.ZodOptional<z.ZodString>;
    validationRequirements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    confidence: z.ZodOptional<z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>>;
    eligible: z.ZodDefault<z.ZodBoolean>;
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
}, {
    type: "mixed" | "alignment" | "whitespace" | "destination";
    id: string;
    title: string;
    analysisRunId: string;
    whoServes: string;
    why: string;
    rationale: string;
    confidence?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
    evidenceClaimIds?: string[] | undefined;
    relationships?: string[] | undefined;
    evidenceRefs?: string[] | undefined;
    assumptions?: string[] | undefined;
    uncertainties?: string[] | undefined;
    competitors?: string[] | undefined;
    qlooEstablished?: string[] | undefined;
    locallyEstablished?: string[] | undefined;
    inferred?: string[] | undefined;
    commercialLogic?: string | undefined;
    validationRequirements?: string[] | undefined;
    eligible?: boolean | undefined;
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
    conceptType: z.ZodOptional<z.ZodString>;
    fitForAudience: z.ZodOptional<z.ZodString>;
    culturalRelationships: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    opportunityCaptured: z.ZodOptional<z.ZodString>;
    whyWeakerThanAlternatives: z.ZodOptional<z.ZodString>;
    qlooEvidenceSummary: z.ZodOptional<z.ZodString>;
    opportunityId: z.ZodOptional<z.ZodString>;
    evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    decisionFit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
}, {
    id: string;
    title: string;
    analysisRunId: string;
    whoServes: string;
    why: string;
    direction: string;
    experienceThesis: string;
    differentiation: string;
    evidenceClaimIds?: string[] | undefined;
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
    conceptType?: string | undefined;
    fitForAudience?: string | undefined;
    culturalRelationships?: string[] | undefined;
    opportunityCaptured?: string | undefined;
    whyWeakerThanAlternatives?: string | undefined;
    qlooEvidenceSummary?: string | undefined;
    opportunityId?: string | undefined;
    decisionFit?: string | undefined;
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
    source: "inference" | "constraint" | "evidence" | "operation";
    priority: "low" | "medium" | "high";
    rationale: string;
    strategyId: string;
    requirement: string;
    zone?: string | undefined;
}, {
    id: string;
    rationale: string;
    strategyId: string;
    requirement: string;
    source?: "inference" | "constraint" | "evidence" | "operation" | undefined;
    priority?: "low" | "medium" | "high" | undefined;
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
    source?: "inference" | "qloo" | "local" | undefined;
    category?: string | undefined;
    notes?: string | undefined;
    affinity?: number | undefined;
}, {
    name: string;
    source?: "inference" | "qloo" | "local" | undefined;
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
        source?: "inference" | "qloo" | "local" | undefined;
        category?: string | undefined;
        notes?: string | undefined;
        affinity?: number | undefined;
    }, {
        name: string;
        source?: "inference" | "qloo" | "local" | undefined;
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
        source?: "inference" | "qloo" | "local" | undefined;
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
        source?: "inference" | "qloo" | "local" | undefined;
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
    viewLabels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    model: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    prompt: string;
    images: string[];
    viewLabels: string[];
    model: string;
}, {
    id: string;
    createdAt: string;
    prompt: string;
    model: string;
    images?: string[] | undefined;
    viewLabels?: string[] | undefined;
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
}, {
    id: string;
    createdAt: string;
    feedback: string;
    chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
    diagnosis: string;
    resolved?: boolean | undefined;
    guidance?: string | undefined;
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
    qlooStatus: z.ZodOptional<z.ZodEnum<["ready", "degraded", "failed", "missing"]>>;
    blockedReason: z.ZodOptional<z.ZodString>;
    contractFailure: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<["missing_configuration", "authentication", "authorization", "invalid_request", "rate_limit", "upstream", "parse", "environment"]>;
        endpoint: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodNumber>;
        message: z.ZodString;
        retryable: z.ZodDefault<z.ZodBoolean>;
        environment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
        retryable: boolean;
        status?: number | undefined;
        environment?: string | undefined;
        endpoint?: string | undefined;
    }, {
        message: string;
        kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
        status?: number | undefined;
        environment?: string | undefined;
        endpoint?: string | undefined;
        retryable?: boolean | undefined;
    }>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceSummary: z.ZodOptional<z.ZodObject<{
        canRecommend: z.ZodBoolean;
        canDiscover: z.ZodBoolean;
        missingEvidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        whatWouldResolveIt: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        canRecommend: boolean;
        canDiscover: boolean;
        missingEvidence: string[];
        whatWouldResolveIt: string[];
    }, {
        canRecommend: boolean;
        canDiscover: boolean;
        missingEvidence?: string[] | undefined;
        whatWouldResolveIt?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
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
}, {
    locationQuality: "strong" | "moderate" | "insufficient";
    qlooQuality: "strong" | "moderate" | "insufficient";
    llmAvailable: boolean;
    intelligenceMode: "mixed" | "live" | "template";
    allowConfidentRecommendation: boolean;
    qlooStatus?: "failed" | "degraded" | "ready" | "missing" | undefined;
    blockedReason?: string | undefined;
    contractFailure?: {
        message: string;
        kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
        status?: number | undefined;
        environment?: string | undefined;
        endpoint?: string | undefined;
        retryable?: boolean | undefined;
    } | undefined;
    warnings?: string[] | undefined;
    evidenceSummary?: {
        canRecommend: boolean;
        canDiscover: boolean;
        missingEvidence?: string[] | undefined;
        whatWouldResolveIt?: string[] | undefined;
    } | undefined;
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
    query: string;
    notes: string[];
    evidenceQuality: "strong" | "moderate" | "insufficient";
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
}, {
    query: string;
    displayName?: string | undefined;
    city?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    notes?: string[] | undefined;
    evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
    pois?: {
        name: string;
        lat?: number | undefined;
        lng?: number | undefined;
        category?: string | undefined;
        distanceM?: number | undefined;
    }[] | undefined;
}>;
export declare const CulturalPatternSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    count: z.ZodNumber;
    places: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    genres: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    implication: z.ZodString;
}, "strip", z.ZodTypeAny, {
    implication: string;
    key: string;
    label: string;
    count: number;
    places: string[];
    genres: string[];
}, {
    implication: string;
    key: string;
    label: string;
    count: number;
    places?: string[] | undefined;
    genres?: string[] | undefined;
}>;
export declare const QlooLocationResolutionSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    resolved: z.ZodDefault<z.ZodBoolean>;
    scope: z.ZodDefault<z.ZodEnum<["neighborhood", "city", "region", "country", "global", "unresolved"]>>;
    candidatesTried: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    scope: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global";
    resolved: boolean;
    candidatesTried: string[];
    query?: string | undefined;
}, {
    scope?: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global" | undefined;
    query?: string | undefined;
    resolved?: boolean | undefined;
    candidatesTried?: string[] | undefined;
}>;
export declare const QlooContextSchema: z.ZodObject<{
    source: z.ZodDefault<z.ZodEnum<["live", "mock", "mixed", "failed", "unavailable"]>>;
    locationResolution: z.ZodOptional<z.ZodObject<{
        query: z.ZodOptional<z.ZodString>;
        resolved: z.ZodDefault<z.ZodBoolean>;
        scope: z.ZodDefault<z.ZodEnum<["neighborhood", "city", "region", "country", "global", "unresolved"]>>;
        candidatesTried: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        scope: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global";
        resolved: boolean;
        candidatesTried: string[];
        query?: string | undefined;
    }, {
        scope?: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global" | undefined;
        query?: string | undefined;
        resolved?: boolean | undefined;
        candidatesTried?: string[] | undefined;
    }>>;
    entities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    affinities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    audienceAffinities: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>>;
    crossDomain: z.ZodOptional<z.ZodAny>;
    culturalPatterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        count: z.ZodNumber;
        places: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        genres: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        implication: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        implication: string;
        key: string;
        label: string;
        count: number;
        places: string[];
        genres: string[];
    }, {
        implication: string;
        key: string;
        label: string;
        count: number;
        places?: string[] | undefined;
        genres?: string[] | undefined;
    }>, "many">>;
    culturalThesis: z.ZodDefault<z.ZodString>;
    notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    insufficient: z.ZodDefault<z.ZodBoolean>;
    failure: z.ZodOptional<z.ZodObject<{
        kind: z.ZodEnum<["missing_configuration", "authentication", "authorization", "invalid_request", "rate_limit", "upstream", "parse", "environment"]>;
        endpoint: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodNumber>;
        message: z.ZodString;
        retryable: z.ZodDefault<z.ZodBoolean>;
        environment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
        retryable: boolean;
        status?: number | undefined;
        environment?: string | undefined;
        endpoint?: string | undefined;
    }, {
        message: string;
        kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
        status?: number | undefined;
        environment?: string | undefined;
        endpoint?: string | undefined;
        retryable?: boolean | undefined;
    }>>;
    audienceResolutions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
        query: z.ZodString;
        status: z.ZodEnum<["resolved", "approximate", "unresolved", "failed"]>;
        quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
        identifiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
            uuid: z.ZodOptional<z.ZodString>;
            urn: z.ZodOptional<z.ZodString>;
            displayName: z.ZodString;
            entityType: z.ZodOptional<z.ZodString>;
            domain: z.ZodOptional<z.ZodString>;
            environment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }>, "many">>;
        seeds: z.ZodDefault<z.ZodArray<z.ZodObject<{
            uuid: z.ZodOptional<z.ZodString>;
            urn: z.ZodOptional<z.ZodString>;
            displayName: z.ZodString;
            entityType: z.ZodOptional<z.ZodString>;
            domain: z.ZodOptional<z.ZodString>;
            environment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }>, "many">>;
        affinities: z.ZodDefault<z.ZodArray<z.ZodObject<{
            target: z.ZodString;
            targetId: z.ZodOptional<z.ZodString>;
            urn: z.ZodOptional<z.ZodString>;
            strength: z.ZodNumber;
            domain: z.ZodOptional<z.ZodString>;
            genre: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            seedCount: z.ZodDefault<z.ZodNumber>;
            evidenceClaimId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            target: string;
            strength: number;
            seedCount: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            evidenceClaimId?: string | undefined;
        }, {
            target: string;
            strength: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            seedCount?: number | undefined;
            evidenceClaimId?: string | undefined;
        }>, "many">>;
        evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        status: "approximate" | "failed" | "unresolved" | "resolved";
        id: string;
        name: string;
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        query: string;
        limitations?: string[] | undefined;
        priority?: number | undefined;
        description?: string | undefined;
        identifiers?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        seeds?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        affinities?: {
            target: string;
            strength: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            seedCount?: number | undefined;
            evidenceClaimId?: string | undefined;
        }[] | undefined;
        evidenceClaimIds?: string[] | undefined;
    }>, "many">>;
    evidenceClaims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        stage: z.ZodString;
        claim: z.ZodString;
        evidenceType: z.ZodEnum<["qloo_search", "qloo_affinity", "qloo_demographics", "qloo_trend", "qloo_tag", "qloo_heatmap", "local_observation", "placegraph_inference", "assumption"]>;
        source: z.ZodEnum<["qloo", "local", "inference", "assumption"]>;
        quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
        scope: z.ZodDefault<z.ZodObject<{
            place: z.ZodOptional<z.ZodString>;
            audienceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geography: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            audienceIds: string[];
            place?: string | undefined;
            geography?: string | undefined;
        }, {
            place?: string | undefined;
            audienceIds?: string[] | undefined;
            geography?: string | undefined;
        }>>;
        confidence: z.ZodOptional<z.ZodNumber>;
        qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        localRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        supporting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        interpretation: z.ZodOptional<z.ZodString>;
        implication: z.ZodOptional<z.ZodString>;
        validationRequired: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        sourceEnvironment: z.ZodOptional<z.ZodString>;
        observedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        id: string;
        stage: string;
        claim: string;
        evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
        source: "inference" | "assumption" | "qloo" | "local";
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        scope?: {
            place?: string | undefined;
            audienceIds?: string[] | undefined;
            geography?: string | undefined;
        } | undefined;
        localRefs?: string[] | undefined;
        supporting?: string[] | undefined;
        limitations?: string[] | undefined;
        interpretation?: string | undefined;
        implication?: string | undefined;
        validationRequired?: string[] | undefined;
        sourceEnvironment?: string | undefined;
        observedAt?: string | undefined;
    }>, "many">>;
    environment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
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
}, {
    insufficient?: boolean | undefined;
    environment?: string | undefined;
    source?: "failed" | "mixed" | "live" | "mock" | "unavailable" | undefined;
    affinities?: any[] | undefined;
    notes?: string[] | undefined;
    locationResolution?: {
        scope?: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global" | undefined;
        query?: string | undefined;
        resolved?: boolean | undefined;
        candidatesTried?: string[] | undefined;
    } | undefined;
    entities?: any[] | undefined;
    audienceAffinities?: Record<string, any[]> | undefined;
    crossDomain?: any;
    culturalPatterns?: {
        implication: string;
        key: string;
        label: string;
        count: number;
        places?: string[] | undefined;
        genres?: string[] | undefined;
    }[] | undefined;
    culturalThesis?: string | undefined;
    failure?: {
        message: string;
        kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
        status?: number | undefined;
        environment?: string | undefined;
        endpoint?: string | undefined;
        retryable?: boolean | undefined;
    } | undefined;
    audienceResolutions?: {
        status: "approximate" | "failed" | "unresolved" | "resolved";
        id: string;
        name: string;
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        query: string;
        limitations?: string[] | undefined;
        priority?: number | undefined;
        description?: string | undefined;
        identifiers?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        seeds?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        affinities?: {
            target: string;
            strength: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            seedCount?: number | undefined;
            evidenceClaimId?: string | undefined;
        }[] | undefined;
        evidenceClaimIds?: string[] | undefined;
    }[] | undefined;
    evidenceClaims?: {
        id: string;
        stage: string;
        claim: string;
        evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
        source: "inference" | "assumption" | "qloo" | "local";
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        scope?: {
            place?: string | undefined;
            audienceIds?: string[] | undefined;
            geography?: string | undefined;
        } | undefined;
        localRefs?: string[] | undefined;
        supporting?: string[] | undefined;
        limitations?: string[] | undefined;
        interpretation?: string | undefined;
        implication?: string | undefined;
        validationRequired?: string[] | undefined;
        sourceEnvironment?: string | undefined;
        observedAt?: string | undefined;
    }[] | undefined;
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
export declare const RetailCategorySchema: z.ZodObject<{
    category: z.ZodString;
    alignment: z.ZodString;
    evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    confidence: z.ZodDefault<z.ZodEnum<["strong", "moderate", "weak"]>>;
}, "strip", z.ZodTypeAny, {
    confidence: "strong" | "moderate" | "weak";
    alignment: string;
    evidence: string[];
    category: string;
}, {
    alignment: string;
    category: string;
    confidence?: "strong" | "moderate" | "weak" | undefined;
    evidence?: string[] | undefined;
}>;
export declare const RetailStrategyOutputSchema: z.ZodObject<{
    positioning: z.ZodString;
    categoryMix: z.ZodDefault<z.ZodArray<z.ZodObject<{
        category: z.ZodString;
        alignment: z.ZodString;
        evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodDefault<z.ZodEnum<["strong", "moderate", "weak"]>>;
    }, "strip", z.ZodTypeAny, {
        confidence: "strong" | "moderate" | "weak";
        alignment: string;
        evidence: string[];
        category: string;
    }, {
        alignment: string;
        category: string;
        confidence?: "strong" | "moderate" | "weak" | undefined;
        evidence?: string[] | undefined;
    }>, "many">>;
    formatRecommendation: z.ZodString;
    communityFit: z.ZodString;
    localCollaborations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceSummary: z.ZodString;
    gaps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
}, {
    positioning: string;
    evidenceSummary: string;
    formatRecommendation: string;
    communityFit: string;
    gaps?: string[] | undefined;
    categoryMix?: {
        alignment: string;
        category: string;
        confidence?: "strong" | "moderate" | "weak" | undefined;
        evidence?: string[] | undefined;
    }[] | undefined;
    localCollaborations?: string[] | undefined;
}>;
export declare const ProgrammingActivitySchema: z.ZodObject<{
    activity: z.ZodString;
    rationale: z.ZodString;
    audience: z.ZodString;
    frequency: z.ZodString;
    spaceRequired: z.ZodOptional<z.ZodString>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    rationale: string;
    evidence: string[];
    activity: string;
    audience: string;
    frequency: string;
    spaceRequired?: string | undefined;
}, {
    rationale: string;
    activity: string;
    audience: string;
    frequency: string;
    evidence?: string[] | undefined;
    spaceRequired?: string | undefined;
}>;
export declare const ExperienceMixItemSchema: z.ZodObject<{
    type: z.ZodString;
    rationale: z.ZodString;
    proportion: z.ZodDefault<z.ZodEnum<["primary", "secondary", "supplementary"]>>;
    evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: string;
    rationale: string;
    evidence: string[];
    proportion: "primary" | "secondary" | "supplementary";
}, {
    type: string;
    rationale: string;
    evidence?: string[] | undefined;
    proportion?: "primary" | "secondary" | "supplementary" | undefined;
}>;
export declare const TenantRationaleSchema: z.ZodObject<{
    tenantType: z.ZodString;
    why: z.ZodString;
    evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    why: string;
    evidence: string[];
    tenantType: string;
}, {
    why: string;
    tenantType: string;
    evidence?: string[] | undefined;
}>;
export declare const OperatorOutputSchema: z.ZodObject<{
    programmingModel: z.ZodString;
    experienceMix: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        rationale: z.ZodString;
        proportion: z.ZodDefault<z.ZodEnum<["primary", "secondary", "supplementary"]>>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        rationale: string;
        evidence: string[];
        proportion: "primary" | "secondary" | "supplementary";
    }, {
        type: string;
        rationale: string;
        evidence?: string[] | undefined;
        proportion?: "primary" | "secondary" | "supplementary" | undefined;
    }>, "many">>;
    activations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        activity: z.ZodString;
        rationale: z.ZodString;
        audience: z.ZodString;
        frequency: z.ZodString;
        spaceRequired: z.ZodOptional<z.ZodString>;
        evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        rationale: string;
        evidence: string[];
        activity: string;
        audience: string;
        frequency: string;
        spaceRequired?: string | undefined;
    }, {
        rationale: string;
        activity: string;
        audience: string;
        frequency: string;
        evidence?: string[] | undefined;
        spaceRequired?: string | undefined;
    }>, "many">>;
    tenantRationale: z.ZodDefault<z.ZodArray<z.ZodObject<{
        tenantType: z.ZodString;
        why: z.ZodString;
        evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        why: string;
        evidence: string[];
        tenantType: string;
    }, {
        why: string;
        tenantType: string;
        evidence?: string[] | undefined;
    }>, "many">>;
    evidenceSummary: z.ZodString;
    whatToStop: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
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
}, {
    evidenceSummary: string;
    programmingModel: string;
    experienceMix?: {
        type: string;
        rationale: string;
        evidence?: string[] | undefined;
        proportion?: "primary" | "secondary" | "supplementary" | undefined;
    }[] | undefined;
    activations?: {
        rationale: string;
        activity: string;
        audience: string;
        frequency: string;
        evidence?: string[] | undefined;
        spaceRequired?: string | undefined;
    }[] | undefined;
    tenantRationale?: {
        why: string;
        tenantType: string;
        evidence?: string[] | undefined;
    }[] | undefined;
    whatToStop?: string[] | undefined;
}>;
export declare const HospitalityOutputSchema: z.ZodObject<{
    conceptIdentity: z.ZodString;
    fbStrategy: z.ZodString;
    daypartStrategy: z.ZodString;
    programmingModel: z.ZodString;
    atmosphereNotes: z.ZodString;
    evidenceSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    evidenceSummary: string;
    programmingModel: string;
    conceptIdentity: string;
    fbStrategy: string;
    daypartStrategy: string;
    atmosphereNotes: string;
}, {
    evidenceSummary: string;
    programmingModel: string;
    conceptIdentity: string;
    fbStrategy: string;
    daypartStrategy: string;
    atmosphereNotes: string;
}>;
export declare const PlaceProfileSchema: z.ZodObject<{
    placeIdentity: z.ZodString;
    communityProfile: z.ZodString;
    culturalAssets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    commercialSupply: z.ZodString;
    behaviouralSignals: z.ZodString;
    unmetNeeds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
}, "strip", z.ZodTypeAny, {
    evidenceQuality: "strong" | "moderate" | "insufficient";
    placeIdentity: string;
    communityProfile: string;
    culturalAssets: string[];
    commercialSupply: string;
    behaviouralSignals: string;
    unmetNeeds: string[];
}, {
    placeIdentity: string;
    communityProfile: string;
    commercialSupply: string;
    behaviouralSignals: string;
    evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
    culturalAssets?: string[] | undefined;
    unmetNeeds?: string[] | undefined;
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
        query: string;
        notes: string[];
        evidenceQuality: "strong" | "moderate" | "insufficient";
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
    }, {
        query: string;
        displayName?: string | undefined;
        city?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        notes?: string[] | undefined;
        evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        pois?: {
            name: string;
            lat?: number | undefined;
            lng?: number | undefined;
            category?: string | undefined;
            distanceM?: number | undefined;
        }[] | undefined;
    }>>;
    qlooContext: z.ZodOptional<z.ZodObject<{
        source: z.ZodDefault<z.ZodEnum<["live", "mock", "mixed", "failed", "unavailable"]>>;
        locationResolution: z.ZodOptional<z.ZodObject<{
            query: z.ZodOptional<z.ZodString>;
            resolved: z.ZodDefault<z.ZodBoolean>;
            scope: z.ZodDefault<z.ZodEnum<["neighborhood", "city", "region", "country", "global", "unresolved"]>>;
            candidatesTried: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            scope: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global";
            resolved: boolean;
            candidatesTried: string[];
            query?: string | undefined;
        }, {
            scope?: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global" | undefined;
            query?: string | undefined;
            resolved?: boolean | undefined;
            candidatesTried?: string[] | undefined;
        }>>;
        entities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
        affinities: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
        audienceAffinities: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodAny, "many">>>;
        crossDomain: z.ZodOptional<z.ZodAny>;
        culturalPatterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            count: z.ZodNumber;
            places: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            genres: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            implication: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            implication: string;
            key: string;
            label: string;
            count: number;
            places: string[];
            genres: string[];
        }, {
            implication: string;
            key: string;
            label: string;
            count: number;
            places?: string[] | undefined;
            genres?: string[] | undefined;
        }>, "many">>;
        culturalThesis: z.ZodDefault<z.ZodString>;
        notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        insufficient: z.ZodDefault<z.ZodBoolean>;
        failure: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<["missing_configuration", "authentication", "authorization", "invalid_request", "rate_limit", "upstream", "parse", "environment"]>;
            endpoint: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodNumber>;
            message: z.ZodString;
            retryable: z.ZodDefault<z.ZodBoolean>;
            environment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            retryable: boolean;
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
        }, {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
            retryable?: boolean | undefined;
        }>>;
        audienceResolutions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            priority: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
            query: z.ZodString;
            status: z.ZodEnum<["resolved", "approximate", "unresolved", "failed"]>;
            quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
            identifiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
                uuid: z.ZodOptional<z.ZodString>;
                urn: z.ZodOptional<z.ZodString>;
                displayName: z.ZodString;
                entityType: z.ZodOptional<z.ZodString>;
                domain: z.ZodOptional<z.ZodString>;
                environment: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }, {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }>, "many">>;
            seeds: z.ZodDefault<z.ZodArray<z.ZodObject<{
                uuid: z.ZodOptional<z.ZodString>;
                urn: z.ZodOptional<z.ZodString>;
                displayName: z.ZodString;
                entityType: z.ZodOptional<z.ZodString>;
                domain: z.ZodOptional<z.ZodString>;
                environment: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }, {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }>, "many">>;
            affinities: z.ZodDefault<z.ZodArray<z.ZodObject<{
                target: z.ZodString;
                targetId: z.ZodOptional<z.ZodString>;
                urn: z.ZodOptional<z.ZodString>;
                strength: z.ZodNumber;
                domain: z.ZodOptional<z.ZodString>;
                genre: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                seedCount: z.ZodDefault<z.ZodNumber>;
                evidenceClaimId: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                target: string;
                strength: number;
                seedCount: number;
                urn?: string | undefined;
                domain?: string | undefined;
                targetId?: string | undefined;
                genre?: string | undefined;
                city?: string | undefined;
                evidenceClaimId?: string | undefined;
            }, {
                target: string;
                strength: number;
                urn?: string | undefined;
                domain?: string | undefined;
                targetId?: string | undefined;
                genre?: string | undefined;
                city?: string | undefined;
                seedCount?: number | undefined;
                evidenceClaimId?: string | undefined;
            }>, "many">>;
            evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
            status: "approximate" | "failed" | "unresolved" | "resolved";
            id: string;
            name: string;
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            query: string;
            limitations?: string[] | undefined;
            priority?: number | undefined;
            description?: string | undefined;
            identifiers?: {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }[] | undefined;
            seeds?: {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }[] | undefined;
            affinities?: {
                target: string;
                strength: number;
                urn?: string | undefined;
                domain?: string | undefined;
                targetId?: string | undefined;
                genre?: string | undefined;
                city?: string | undefined;
                seedCount?: number | undefined;
                evidenceClaimId?: string | undefined;
            }[] | undefined;
            evidenceClaimIds?: string[] | undefined;
        }>, "many">>;
        evidenceClaims: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            stage: z.ZodString;
            claim: z.ZodString;
            evidenceType: z.ZodEnum<["qloo_search", "qloo_affinity", "qloo_demographics", "qloo_trend", "qloo_tag", "qloo_heatmap", "local_observation", "placegraph_inference", "assumption"]>;
            source: z.ZodEnum<["qloo", "local", "inference", "assumption"]>;
            quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
            scope: z.ZodDefault<z.ZodObject<{
                place: z.ZodOptional<z.ZodString>;
                audienceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                geography: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                audienceIds: string[];
                place?: string | undefined;
                geography?: string | undefined;
            }, {
                place?: string | undefined;
                audienceIds?: string[] | undefined;
                geography?: string | undefined;
            }>>;
            confidence: z.ZodOptional<z.ZodNumber>;
            qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            localRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            supporting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            interpretation: z.ZodOptional<z.ZodString>;
            implication: z.ZodOptional<z.ZodString>;
            validationRequired: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            sourceEnvironment: z.ZodOptional<z.ZodString>;
            observedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
            id: string;
            stage: string;
            claim: string;
            evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
            source: "inference" | "assumption" | "qloo" | "local";
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            scope?: {
                place?: string | undefined;
                audienceIds?: string[] | undefined;
                geography?: string | undefined;
            } | undefined;
            localRefs?: string[] | undefined;
            supporting?: string[] | undefined;
            limitations?: string[] | undefined;
            interpretation?: string | undefined;
            implication?: string | undefined;
            validationRequired?: string[] | undefined;
            sourceEnvironment?: string | undefined;
            observedAt?: string | undefined;
        }>, "many">>;
        environment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        insufficient?: boolean | undefined;
        environment?: string | undefined;
        source?: "failed" | "mixed" | "live" | "mock" | "unavailable" | undefined;
        affinities?: any[] | undefined;
        notes?: string[] | undefined;
        locationResolution?: {
            scope?: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global" | undefined;
            query?: string | undefined;
            resolved?: boolean | undefined;
            candidatesTried?: string[] | undefined;
        } | undefined;
        entities?: any[] | undefined;
        audienceAffinities?: Record<string, any[]> | undefined;
        crossDomain?: any;
        culturalPatterns?: {
            implication: string;
            key: string;
            label: string;
            count: number;
            places?: string[] | undefined;
            genres?: string[] | undefined;
        }[] | undefined;
        culturalThesis?: string | undefined;
        failure?: {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
            retryable?: boolean | undefined;
        } | undefined;
        audienceResolutions?: {
            status: "approximate" | "failed" | "unresolved" | "resolved";
            id: string;
            name: string;
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            query: string;
            limitations?: string[] | undefined;
            priority?: number | undefined;
            description?: string | undefined;
            identifiers?: {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }[] | undefined;
            seeds?: {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }[] | undefined;
            affinities?: {
                target: string;
                strength: number;
                urn?: string | undefined;
                domain?: string | undefined;
                targetId?: string | undefined;
                genre?: string | undefined;
                city?: string | undefined;
                seedCount?: number | undefined;
                evidenceClaimId?: string | undefined;
            }[] | undefined;
            evidenceClaimIds?: string[] | undefined;
        }[] | undefined;
        evidenceClaims?: {
            id: string;
            stage: string;
            claim: string;
            evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
            source: "inference" | "assumption" | "qloo" | "local";
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            scope?: {
                place?: string | undefined;
                audienceIds?: string[] | undefined;
                geography?: string | undefined;
            } | undefined;
            localRefs?: string[] | undefined;
            supporting?: string[] | undefined;
            limitations?: string[] | undefined;
            interpretation?: string | undefined;
            implication?: string | undefined;
            validationRequired?: string[] | undefined;
            sourceEnvironment?: string | undefined;
            observedAt?: string | undefined;
        }[] | undefined;
    }>>;
    decisionFrame: z.ZodOptional<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["develop", "establish", "enter_market", "tenant_mix", "reposition", "adapt", "store_format", "utilisation", "audience_choice", "other"]>>;
        subject: z.ZodDefault<z.ZodString>;
        timeHorizon: z.ZodOptional<z.ZodString>;
        capitalIntent: z.ZodOptional<z.ZodString>;
        successTests: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice";
        subject: string;
        successTests: string[];
        constraints: string[];
        timeHorizon?: string | undefined;
        capitalIntent?: string | undefined;
    }, {
        type?: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice" | undefined;
        subject?: string | undefined;
        timeHorizon?: string | undefined;
        capitalIntent?: string | undefined;
        successTests?: string[] | undefined;
        constraints?: string[] | undefined;
    }>>;
    organisationProfiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["developer", "hospitality", "retail", "operator", "facility", "investor", "mixed_use", "other"]>;
        name: z.ZodString;
        primary: z.ZodDefault<z.ZodBoolean>;
        mandate: z.ZodOptional<z.ZodString>;
        deliverables: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
        id: string;
        name: string;
        primary: boolean;
        deliverables: string[];
        mandate?: string | undefined;
    }, {
        type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
        id: string;
        name: string;
        primary?: boolean | undefined;
        mandate?: string | undefined;
        deliverables?: string[] | undefined;
    }>, "many">>;
    primaryProfileId: z.ZodOptional<z.ZodString>;
    audienceResolutions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
        query: z.ZodString;
        status: z.ZodEnum<["resolved", "approximate", "unresolved", "failed"]>;
        quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
        identifiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
            uuid: z.ZodOptional<z.ZodString>;
            urn: z.ZodOptional<z.ZodString>;
            displayName: z.ZodString;
            entityType: z.ZodOptional<z.ZodString>;
            domain: z.ZodOptional<z.ZodString>;
            environment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }>, "many">>;
        seeds: z.ZodDefault<z.ZodArray<z.ZodObject<{
            uuid: z.ZodOptional<z.ZodString>;
            urn: z.ZodOptional<z.ZodString>;
            displayName: z.ZodString;
            entityType: z.ZodOptional<z.ZodString>;
            domain: z.ZodOptional<z.ZodString>;
            environment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }, {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }>, "many">>;
        affinities: z.ZodDefault<z.ZodArray<z.ZodObject<{
            target: z.ZodString;
            targetId: z.ZodOptional<z.ZodString>;
            urn: z.ZodOptional<z.ZodString>;
            strength: z.ZodNumber;
            domain: z.ZodOptional<z.ZodString>;
            genre: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            seedCount: z.ZodDefault<z.ZodNumber>;
            evidenceClaimId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            target: string;
            strength: number;
            seedCount: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            evidenceClaimId?: string | undefined;
        }, {
            target: string;
            strength: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            seedCount?: number | undefined;
            evidenceClaimId?: string | undefined;
        }>, "many">>;
        evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        status: "approximate" | "failed" | "unresolved" | "resolved";
        id: string;
        name: string;
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        query: string;
        limitations?: string[] | undefined;
        priority?: number | undefined;
        description?: string | undefined;
        identifiers?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        seeds?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        affinities?: {
            target: string;
            strength: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            seedCount?: number | undefined;
            evidenceClaimId?: string | undefined;
        }[] | undefined;
        evidenceClaimIds?: string[] | undefined;
    }>, "many">>;
    evidenceClaims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        stage: z.ZodString;
        claim: z.ZodString;
        evidenceType: z.ZodEnum<["qloo_search", "qloo_affinity", "qloo_demographics", "qloo_trend", "qloo_tag", "qloo_heatmap", "local_observation", "placegraph_inference", "assumption"]>;
        source: z.ZodEnum<["qloo", "local", "inference", "assumption"]>;
        quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
        scope: z.ZodDefault<z.ZodObject<{
            place: z.ZodOptional<z.ZodString>;
            audienceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            geography: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            audienceIds: string[];
            place?: string | undefined;
            geography?: string | undefined;
        }, {
            place?: string | undefined;
            audienceIds?: string[] | undefined;
            geography?: string | undefined;
        }>>;
        confidence: z.ZodOptional<z.ZodNumber>;
        qlooRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        localRefs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        supporting: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        interpretation: z.ZodOptional<z.ZodString>;
        implication: z.ZodOptional<z.ZodString>;
        validationRequired: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        sourceEnvironment: z.ZodOptional<z.ZodString>;
        observedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        id: string;
        stage: string;
        claim: string;
        evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
        source: "inference" | "assumption" | "qloo" | "local";
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        scope?: {
            place?: string | undefined;
            audienceIds?: string[] | undefined;
            geography?: string | undefined;
        } | undefined;
        localRefs?: string[] | undefined;
        supporting?: string[] | undefined;
        limitations?: string[] | undefined;
        interpretation?: string | undefined;
        implication?: string | undefined;
        validationRequired?: string[] | undefined;
        sourceEnvironment?: string | undefined;
        observedAt?: string | undefined;
    }>, "many">>;
    relationships: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodString;
        object: z.ZodString;
        relationshipType: z.ZodEnum<["shared_affinity", "complementary_affinity", "tension", "local_expression", "cross_domain"]>;
        audienceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        score: z.ZodOptional<z.ZodNumber>;
        seedCount: z.ZodOptional<z.ZodNumber>;
        evidenceType: z.ZodEnum<["qloo_search", "qloo_affinity", "qloo_demographics", "qloo_trend", "qloo_tag", "qloo_heatmap", "local_observation", "placegraph_inference", "assumption"]>;
        quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
        interpretation: z.ZodString;
        commercialRelevance: z.ZodString;
        limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        object: string;
        id: string;
        subject: string;
        evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        interpretation: string;
        relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
        commercialRelevance: string;
        audienceIds?: string[] | undefined;
        limitations?: string[] | undefined;
        seedCount?: number | undefined;
        evidenceClaimIds?: string[] | undefined;
        score?: number | undefined;
    }>, "many">>;
    stageStates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        stage: z.ZodEnum<["decision_frame", "place_resolution", "audience_resolution", "affinity_collection", "audience_profiles", "evidence_gate", "cultural_patterns", "cross_domain", "opportunities", "strategies", "spatial_translation", "review"]>;
        status: z.ZodEnum<["complete", "degraded", "failed", "skipped", "pending"]>;
        source: z.ZodOptional<z.ZodString>;
        quality: z.ZodOptional<z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>>;
        message: z.ZodString;
        evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        updatedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        status: "failed" | "degraded" | "complete" | "skipped" | "pending";
        stage: "cross_domain" | "decision_frame" | "place_resolution" | "audience_resolution" | "affinity_collection" | "audience_profiles" | "evidence_gate" | "cultural_patterns" | "opportunities" | "strategies" | "spatial_translation" | "review";
        evidenceClaimIds: string[];
        source?: string | undefined;
        quality?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
        updatedAt?: string | undefined;
    }, {
        message: string;
        status: "failed" | "degraded" | "complete" | "skipped" | "pending";
        stage: "cross_domain" | "decision_frame" | "place_resolution" | "audience_resolution" | "affinity_collection" | "audience_profiles" | "evidence_gate" | "cultural_patterns" | "opportunities" | "strategies" | "spatial_translation" | "review";
        source?: string | undefined;
        quality?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
        evidenceClaimIds?: string[] | undefined;
        updatedAt?: string | undefined;
    }>, "many">>;
    decisionBrief: z.ZodOptional<z.ZodObject<{
        mode: z.ZodEnum<["discover", "evaluate"]>;
        frame: z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["develop", "establish", "enter_market", "tenant_mix", "reposition", "adapt", "store_format", "utilisation", "audience_choice", "other"]>>;
            subject: z.ZodDefault<z.ZodString>;
            timeHorizon: z.ZodOptional<z.ZodString>;
            capitalIntent: z.ZodOptional<z.ZodString>;
            successTests: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice";
            subject: string;
            successTests: string[];
            constraints: string[];
            timeHorizon?: string | undefined;
            capitalIntent?: string | undefined;
        }, {
            type?: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice" | undefined;
            subject?: string | undefined;
            timeHorizon?: string | undefined;
            capitalIntent?: string | undefined;
            successTests?: string[] | undefined;
            constraints?: string[] | undefined;
        }>;
        profiles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["developer", "hospitality", "retail", "operator", "facility", "investor", "mixed_use", "other"]>;
            name: z.ZodString;
            primary: z.ZodDefault<z.ZodBoolean>;
            mandate: z.ZodOptional<z.ZodString>;
            deliverables: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
            id: string;
            name: string;
            primary: boolean;
            deliverables: string[];
            mandate?: string | undefined;
        }, {
            type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
            id: string;
            name: string;
            primary?: boolean | undefined;
            mandate?: string | undefined;
            deliverables?: string[] | undefined;
        }>, "many">>;
        primaryProfileId: z.ZodOptional<z.ZodString>;
        placeSummary: z.ZodString;
        audienceSummary: z.ZodString;
        culturalSummary: z.ZodString;
        relationships: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            subject: z.ZodString;
            object: z.ZodString;
            relationshipType: z.ZodEnum<["shared_affinity", "complementary_affinity", "tension", "local_expression", "cross_domain"]>;
            audienceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            score: z.ZodOptional<z.ZodNumber>;
            seedCount: z.ZodOptional<z.ZodNumber>;
            evidenceType: z.ZodEnum<["qloo_search", "qloo_affinity", "qloo_demographics", "qloo_trend", "qloo_tag", "qloo_heatmap", "local_observation", "placegraph_inference", "assumption"]>;
            quality: z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>;
            interpretation: z.ZodString;
            commercialRelevance: z.ZodString;
            limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
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
        }, {
            object: string;
            id: string;
            subject: string;
            evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            interpretation: string;
            relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
            commercialRelevance: string;
            audienceIds?: string[] | undefined;
            limitations?: string[] | undefined;
            seedCount?: number | undefined;
            evidenceClaimIds?: string[] | undefined;
            score?: number | undefined;
        }>, "many">>;
        opportunityIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        uncertainty: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        nextInvestigation: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        deliverables: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            title: z.ZodString;
            body: z.ZodString;
            evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            id: string;
            limitations: string[];
            evidenceClaimIds: string[];
            title: string;
            body: string;
        }, {
            type: string;
            id: string;
            title: string;
            body: string;
            limitations?: string[] | undefined;
            evidenceClaimIds?: string[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        mode: "discover" | "evaluate";
        frame: {
            type?: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice" | undefined;
            subject?: string | undefined;
            timeHorizon?: string | undefined;
            capitalIntent?: string | undefined;
            successTests?: string[] | undefined;
            constraints?: string[] | undefined;
        };
        placeSummary: string;
        audienceSummary: string;
        culturalSummary: string;
        deliverables?: {
            type: string;
            id: string;
            title: string;
            body: string;
            limitations?: string[] | undefined;
            evidenceClaimIds?: string[] | undefined;
        }[] | undefined;
        profiles?: {
            type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
            id: string;
            name: string;
            primary?: boolean | undefined;
            mandate?: string | undefined;
            deliverables?: string[] | undefined;
        }[] | undefined;
        primaryProfileId?: string | undefined;
        relationships?: {
            object: string;
            id: string;
            subject: string;
            evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            interpretation: string;
            relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
            commercialRelevance: string;
            audienceIds?: string[] | undefined;
            limitations?: string[] | undefined;
            seedCount?: number | undefined;
            evidenceClaimIds?: string[] | undefined;
            score?: number | undefined;
        }[] | undefined;
        opportunityIds?: string[] | undefined;
        uncertainty?: string[] | undefined;
        nextInvestigation?: string[] | undefined;
    }>>;
    deliverables: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        limitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        limitations: string[];
        evidenceClaimIds: string[];
        title: string;
        body: string;
    }, {
        type: string;
        id: string;
        title: string;
        body: string;
        limitations?: string[] | undefined;
        evidenceClaimIds?: string[] | undefined;
    }>, "many">>;
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
                source?: "inference" | "qloo" | "local" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }, {
                name: string;
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }, {
                name: string;
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
                category?: string | undefined;
                notes?: string | undefined;
                affinity?: number | undefined;
            }, {
                name: string;
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
    }, {
        existing: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
        relationships: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        commercialLogic: z.ZodOptional<z.ZodString>;
        validationRequirements: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodOptional<z.ZodEnum<["strong", "moderate", "approximate", "insufficient", "failed", "unresolved", "degraded"]>>;
        eligible: z.ZodDefault<z.ZodBoolean>;
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
    }, {
        type: "mixed" | "alignment" | "whitespace" | "destination";
        id: string;
        title: string;
        analysisRunId: string;
        whoServes: string;
        why: string;
        rationale: string;
        confidence?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
        evidenceClaimIds?: string[] | undefined;
        relationships?: string[] | undefined;
        evidenceRefs?: string[] | undefined;
        assumptions?: string[] | undefined;
        uncertainties?: string[] | undefined;
        competitors?: string[] | undefined;
        qlooEstablished?: string[] | undefined;
        locallyEstablished?: string[] | undefined;
        inferred?: string[] | undefined;
        commercialLogic?: string | undefined;
        validationRequirements?: string[] | undefined;
        eligible?: boolean | undefined;
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
        conceptType: z.ZodOptional<z.ZodString>;
        fitForAudience: z.ZodOptional<z.ZodString>;
        culturalRelationships: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        opportunityCaptured: z.ZodOptional<z.ZodString>;
        whyWeakerThanAlternatives: z.ZodOptional<z.ZodString>;
        qlooEvidenceSummary: z.ZodOptional<z.ZodString>;
        opportunityId: z.ZodOptional<z.ZodString>;
        evidenceClaimIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        decisionFit: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        id: string;
        title: string;
        analysisRunId: string;
        whoServes: string;
        why: string;
        direction: string;
        experienceThesis: string;
        differentiation: string;
        evidenceClaimIds?: string[] | undefined;
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
        conceptType?: string | undefined;
        fitForAudience?: string | undefined;
        culturalRelationships?: string[] | undefined;
        opportunityCaptured?: string | undefined;
        whyWeakerThanAlternatives?: string | undefined;
        qlooEvidenceSummary?: string | undefined;
        opportunityId?: string | undefined;
        decisionFit?: string | undefined;
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
        source: "inference" | "constraint" | "evidence" | "operation";
        priority: "low" | "medium" | "high";
        rationale: string;
        strategyId: string;
        requirement: string;
        zone?: string | undefined;
    }, {
        id: string;
        rationale: string;
        strategyId: string;
        requirement: string;
        source?: "inference" | "constraint" | "evidence" | "operation" | undefined;
        priority?: "low" | "medium" | "high" | undefined;
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
        viewLabels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        model: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        prompt: string;
        images: string[];
        viewLabels: string[];
        model: string;
    }, {
        id: string;
        createdAt: string;
        prompt: string;
        model: string;
        images?: string[] | undefined;
        viewLabels?: string[] | undefined;
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
    }, {
        id: string;
        createdAt: string;
        feedback: string;
        chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
        diagnosis: string;
        resolved?: boolean | undefined;
        guidance?: string | undefined;
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
        qlooStatus: z.ZodOptional<z.ZodEnum<["ready", "degraded", "failed", "missing"]>>;
        blockedReason: z.ZodOptional<z.ZodString>;
        contractFailure: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<["missing_configuration", "authentication", "authorization", "invalid_request", "rate_limit", "upstream", "parse", "environment"]>;
            endpoint: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodNumber>;
            message: z.ZodString;
            retryable: z.ZodDefault<z.ZodBoolean>;
            environment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            retryable: boolean;
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
        }, {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
            retryable?: boolean | undefined;
        }>>;
        warnings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        evidenceSummary: z.ZodOptional<z.ZodObject<{
            canRecommend: z.ZodBoolean;
            canDiscover: z.ZodBoolean;
            missingEvidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            whatWouldResolveIt: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            canRecommend: boolean;
            canDiscover: boolean;
            missingEvidence: string[];
            whatWouldResolveIt: string[];
        }, {
            canRecommend: boolean;
            canDiscover: boolean;
            missingEvidence?: string[] | undefined;
            whatWouldResolveIt?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        locationQuality: "strong" | "moderate" | "insufficient";
        qlooQuality: "strong" | "moderate" | "insufficient";
        llmAvailable: boolean;
        intelligenceMode: "mixed" | "live" | "template";
        allowConfidentRecommendation: boolean;
        qlooStatus?: "failed" | "degraded" | "ready" | "missing" | undefined;
        blockedReason?: string | undefined;
        contractFailure?: {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
            retryable?: boolean | undefined;
        } | undefined;
        warnings?: string[] | undefined;
        evidenceSummary?: {
            canRecommend: boolean;
            canDiscover: boolean;
            missingEvidence?: string[] | undefined;
            whatWouldResolveIt?: string[] | undefined;
        } | undefined;
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
    placeProfile: z.ZodOptional<z.ZodObject<{
        placeIdentity: z.ZodString;
        communityProfile: z.ZodString;
        culturalAssets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        commercialSupply: z.ZodString;
        behaviouralSignals: z.ZodString;
        unmetNeeds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        evidenceQuality: z.ZodDefault<z.ZodEnum<["strong", "moderate", "insufficient"]>>;
    }, "strip", z.ZodTypeAny, {
        evidenceQuality: "strong" | "moderate" | "insufficient";
        placeIdentity: string;
        communityProfile: string;
        culturalAssets: string[];
        commercialSupply: string;
        behaviouralSignals: string;
        unmetNeeds: string[];
    }, {
        placeIdentity: string;
        communityProfile: string;
        commercialSupply: string;
        behaviouralSignals: string;
        evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        culturalAssets?: string[] | undefined;
        unmetNeeds?: string[] | undefined;
    }>>;
    retailOutput: z.ZodOptional<z.ZodObject<{
        positioning: z.ZodString;
        categoryMix: z.ZodDefault<z.ZodArray<z.ZodObject<{
            category: z.ZodString;
            alignment: z.ZodString;
            evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            confidence: z.ZodDefault<z.ZodEnum<["strong", "moderate", "weak"]>>;
        }, "strip", z.ZodTypeAny, {
            confidence: "strong" | "moderate" | "weak";
            alignment: string;
            evidence: string[];
            category: string;
        }, {
            alignment: string;
            category: string;
            confidence?: "strong" | "moderate" | "weak" | undefined;
            evidence?: string[] | undefined;
        }>, "many">>;
        formatRecommendation: z.ZodString;
        communityFit: z.ZodString;
        localCollaborations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        evidenceSummary: z.ZodString;
        gaps: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        positioning: string;
        evidenceSummary: string;
        formatRecommendation: string;
        communityFit: string;
        gaps?: string[] | undefined;
        categoryMix?: {
            alignment: string;
            category: string;
            confidence?: "strong" | "moderate" | "weak" | undefined;
            evidence?: string[] | undefined;
        }[] | undefined;
        localCollaborations?: string[] | undefined;
    }>>;
    operatorOutput: z.ZodOptional<z.ZodObject<{
        programmingModel: z.ZodString;
        experienceMix: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            rationale: z.ZodString;
            proportion: z.ZodDefault<z.ZodEnum<["primary", "secondary", "supplementary"]>>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            rationale: string;
            evidence: string[];
            proportion: "primary" | "secondary" | "supplementary";
        }, {
            type: string;
            rationale: string;
            evidence?: string[] | undefined;
            proportion?: "primary" | "secondary" | "supplementary" | undefined;
        }>, "many">>;
        activations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            activity: z.ZodString;
            rationale: z.ZodString;
            audience: z.ZodString;
            frequency: z.ZodString;
            spaceRequired: z.ZodOptional<z.ZodString>;
            evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            rationale: string;
            evidence: string[];
            activity: string;
            audience: string;
            frequency: string;
            spaceRequired?: string | undefined;
        }, {
            rationale: string;
            activity: string;
            audience: string;
            frequency: string;
            evidence?: string[] | undefined;
            spaceRequired?: string | undefined;
        }>, "many">>;
        tenantRationale: z.ZodDefault<z.ZodArray<z.ZodObject<{
            tenantType: z.ZodString;
            why: z.ZodString;
            evidence: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            why: string;
            evidence: string[];
            tenantType: string;
        }, {
            why: string;
            tenantType: string;
            evidence?: string[] | undefined;
        }>, "many">>;
        evidenceSummary: z.ZodString;
        whatToStop: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
        evidenceSummary: string;
        programmingModel: string;
        experienceMix?: {
            type: string;
            rationale: string;
            evidence?: string[] | undefined;
            proportion?: "primary" | "secondary" | "supplementary" | undefined;
        }[] | undefined;
        activations?: {
            rationale: string;
            activity: string;
            audience: string;
            frequency: string;
            evidence?: string[] | undefined;
            spaceRequired?: string | undefined;
        }[] | undefined;
        tenantRationale?: {
            why: string;
            tenantType: string;
            evidence?: string[] | undefined;
        }[] | undefined;
        whatToStop?: string[] | undefined;
    }>>;
    hospitalityOutput: z.ZodOptional<z.ZodObject<{
        conceptIdentity: z.ZodString;
        fbStrategy: z.ZodString;
        daypartStrategy: z.ZodString;
        programmingModel: z.ZodString;
        atmosphereNotes: z.ZodString;
        evidenceSummary: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        evidenceSummary: string;
        programmingModel: string;
        conceptIdentity: string;
        fbStrategy: string;
        daypartStrategy: string;
        atmosphereNotes: string;
    }, {
        evidenceSummary: string;
        programmingModel: string;
        conceptIdentity: string;
        fbStrategy: string;
        daypartStrategy: string;
        atmosphereNotes: string;
    }>>;
}, "strip", z.ZodTypeAny, {
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
}, {
    updatedAt: string;
    runId: string;
    projectId: string;
    status?: "review" | "analyzing" | "ready" | "idle" | "strategy_selected" | "designed" | "visualized" | undefined;
    deliverables?: {
        type: string;
        id: string;
        title: string;
        body: string;
        limitations?: string[] | undefined;
        evidenceClaimIds?: string[] | undefined;
    }[] | undefined;
    opportunities?: {
        type: "mixed" | "alignment" | "whitespace" | "destination";
        id: string;
        title: string;
        analysisRunId: string;
        whoServes: string;
        why: string;
        rationale: string;
        confidence?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
        evidenceClaimIds?: string[] | undefined;
        relationships?: string[] | undefined;
        evidenceRefs?: string[] | undefined;
        assumptions?: string[] | undefined;
        uncertainties?: string[] | undefined;
        competitors?: string[] | undefined;
        qlooEstablished?: string[] | undefined;
        locallyEstablished?: string[] | undefined;
        inferred?: string[] | undefined;
        commercialLogic?: string | undefined;
        validationRequirements?: string[] | undefined;
        eligible?: boolean | undefined;
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
        title: string;
        analysisRunId: string;
        whoServes: string;
        why: string;
        direction: string;
        experienceThesis: string;
        differentiation: string;
        evidenceClaimIds?: string[] | undefined;
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
        conceptType?: string | undefined;
        fitForAudience?: string | undefined;
        culturalRelationships?: string[] | undefined;
        opportunityCaptured?: string | undefined;
        whyWeakerThanAlternatives?: string | undefined;
        qlooEvidenceSummary?: string | undefined;
        opportunityId?: string | undefined;
        decisionFit?: string | undefined;
    }[] | undefined;
    primaryProfileId?: string | undefined;
    relationships?: {
        object: string;
        id: string;
        subject: string;
        evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        interpretation: string;
        relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
        commercialRelevance: string;
        audienceIds?: string[] | undefined;
        limitations?: string[] | undefined;
        seedCount?: number | undefined;
        evidenceClaimIds?: string[] | undefined;
        score?: number | undefined;
    }[] | undefined;
    organisationProfiles?: {
        type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
        id: string;
        name: string;
        primary?: boolean | undefined;
        mandate?: string | undefined;
        deliverables?: string[] | undefined;
    }[] | undefined;
    decisionFrame?: {
        type?: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice" | undefined;
        subject?: string | undefined;
        timeHorizon?: string | undefined;
        capitalIntent?: string | undefined;
        successTests?: string[] | undefined;
        constraints?: string[] | undefined;
    } | undefined;
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
    audienceResolutions?: {
        status: "approximate" | "failed" | "unresolved" | "resolved";
        id: string;
        name: string;
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        query: string;
        limitations?: string[] | undefined;
        priority?: number | undefined;
        description?: string | undefined;
        identifiers?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        seeds?: {
            displayName: string;
            uuid?: string | undefined;
            urn?: string | undefined;
            entityType?: string | undefined;
            domain?: string | undefined;
            environment?: string | undefined;
        }[] | undefined;
        affinities?: {
            target: string;
            strength: number;
            urn?: string | undefined;
            domain?: string | undefined;
            targetId?: string | undefined;
            genre?: string | undefined;
            city?: string | undefined;
            seedCount?: number | undefined;
            evidenceClaimId?: string | undefined;
        }[] | undefined;
        evidenceClaimIds?: string[] | undefined;
    }[] | undefined;
    evidenceClaims?: {
        id: string;
        stage: string;
        claim: string;
        evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
        source: "inference" | "assumption" | "qloo" | "local";
        quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
        qlooRefs?: string[] | undefined;
        confidence?: number | undefined;
        scope?: {
            place?: string | undefined;
            audienceIds?: string[] | undefined;
            geography?: string | undefined;
        } | undefined;
        localRefs?: string[] | undefined;
        supporting?: string[] | undefined;
        limitations?: string[] | undefined;
        interpretation?: string | undefined;
        implication?: string | undefined;
        validationRequired?: string[] | undefined;
        sourceEnvironment?: string | undefined;
        observedAt?: string | undefined;
    }[] | undefined;
    locationContext?: {
        query: string;
        displayName?: string | undefined;
        city?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        notes?: string[] | undefined;
        evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        pois?: {
            name: string;
            lat?: number | undefined;
            lng?: number | undefined;
            category?: string | undefined;
            distanceM?: number | undefined;
        }[] | undefined;
    } | undefined;
    qlooContext?: {
        insufficient?: boolean | undefined;
        environment?: string | undefined;
        source?: "failed" | "mixed" | "live" | "mock" | "unavailable" | undefined;
        affinities?: any[] | undefined;
        notes?: string[] | undefined;
        locationResolution?: {
            scope?: "unresolved" | "city" | "neighborhood" | "region" | "country" | "global" | undefined;
            query?: string | undefined;
            resolved?: boolean | undefined;
            candidatesTried?: string[] | undefined;
        } | undefined;
        entities?: any[] | undefined;
        audienceAffinities?: Record<string, any[]> | undefined;
        crossDomain?: any;
        culturalPatterns?: {
            implication: string;
            key: string;
            label: string;
            count: number;
            places?: string[] | undefined;
            genres?: string[] | undefined;
        }[] | undefined;
        culturalThesis?: string | undefined;
        failure?: {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
            retryable?: boolean | undefined;
        } | undefined;
        audienceResolutions?: {
            status: "approximate" | "failed" | "unresolved" | "resolved";
            id: string;
            name: string;
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            query: string;
            limitations?: string[] | undefined;
            priority?: number | undefined;
            description?: string | undefined;
            identifiers?: {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }[] | undefined;
            seeds?: {
                displayName: string;
                uuid?: string | undefined;
                urn?: string | undefined;
                entityType?: string | undefined;
                domain?: string | undefined;
                environment?: string | undefined;
            }[] | undefined;
            affinities?: {
                target: string;
                strength: number;
                urn?: string | undefined;
                domain?: string | undefined;
                targetId?: string | undefined;
                genre?: string | undefined;
                city?: string | undefined;
                seedCount?: number | undefined;
                evidenceClaimId?: string | undefined;
            }[] | undefined;
            evidenceClaimIds?: string[] | undefined;
        }[] | undefined;
        evidenceClaims?: {
            id: string;
            stage: string;
            claim: string;
            evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
            source: "inference" | "assumption" | "qloo" | "local";
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            qlooRefs?: string[] | undefined;
            confidence?: number | undefined;
            scope?: {
                place?: string | undefined;
                audienceIds?: string[] | undefined;
                geography?: string | undefined;
            } | undefined;
            localRefs?: string[] | undefined;
            supporting?: string[] | undefined;
            limitations?: string[] | undefined;
            interpretation?: string | undefined;
            implication?: string | undefined;
            validationRequired?: string[] | undefined;
            sourceEnvironment?: string | undefined;
            observedAt?: string | undefined;
        }[] | undefined;
    } | undefined;
    stageStates?: {
        message: string;
        status: "failed" | "degraded" | "complete" | "skipped" | "pending";
        stage: "cross_domain" | "decision_frame" | "place_resolution" | "audience_resolution" | "affinity_collection" | "audience_profiles" | "evidence_gate" | "cultural_patterns" | "opportunities" | "strategies" | "spatial_translation" | "review";
        source?: string | undefined;
        quality?: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded" | undefined;
        evidenceClaimIds?: string[] | undefined;
        updatedAt?: string | undefined;
    }[] | undefined;
    decisionBrief?: {
        mode: "discover" | "evaluate";
        frame: {
            type?: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice" | undefined;
            subject?: string | undefined;
            timeHorizon?: string | undefined;
            capitalIntent?: string | undefined;
            successTests?: string[] | undefined;
            constraints?: string[] | undefined;
        };
        placeSummary: string;
        audienceSummary: string;
        culturalSummary: string;
        deliverables?: {
            type: string;
            id: string;
            title: string;
            body: string;
            limitations?: string[] | undefined;
            evidenceClaimIds?: string[] | undefined;
        }[] | undefined;
        profiles?: {
            type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
            id: string;
            name: string;
            primary?: boolean | undefined;
            mandate?: string | undefined;
            deliverables?: string[] | undefined;
        }[] | undefined;
        primaryProfileId?: string | undefined;
        relationships?: {
            object: string;
            id: string;
            subject: string;
            evidenceType: "assumption" | "qloo_search" | "qloo_affinity" | "qloo_demographics" | "qloo_trend" | "qloo_tag" | "qloo_heatmap" | "local_observation" | "placegraph_inference";
            quality: "strong" | "moderate" | "approximate" | "insufficient" | "failed" | "unresolved" | "degraded";
            interpretation: string;
            relationshipType: "shared_affinity" | "complementary_affinity" | "tension" | "local_expression" | "cross_domain";
            commercialRelevance: string;
            audienceIds?: string[] | undefined;
            limitations?: string[] | undefined;
            seedCount?: number | undefined;
            evidenceClaimIds?: string[] | undefined;
            score?: number | undefined;
        }[] | undefined;
        opportunityIds?: string[] | undefined;
        uncertainty?: string[] | undefined;
        nextInvestigation?: string[] | undefined;
    } | undefined;
    landscapes?: {
        existing: {
            type: "existing" | "potential" | "proposed";
            summary: string;
            experiences?: {
                name: string;
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
                source?: "inference" | "qloo" | "local" | undefined;
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
    selectedStrategyId?: string | undefined;
    requirements?: {
        id: string;
        rationale: string;
        strategyId: string;
        requirement: string;
        source?: "inference" | "constraint" | "evidence" | "operation" | undefined;
        priority?: "low" | "medium" | "high" | undefined;
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
    visualizations?: {
        id: string;
        createdAt: string;
        prompt: string;
        model: string;
        images?: string[] | undefined;
        viewLabels?: string[] | undefined;
    }[] | undefined;
    reviews?: {
        id: string;
        createdAt: string;
        feedback: string;
        chainLevel: "evidence" | "opportunity" | "strategy" | "experience" | "architecture" | "visualization";
        diagnosis: string;
        resolved?: boolean | undefined;
        guidance?: string | undefined;
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
        qlooStatus?: "failed" | "degraded" | "ready" | "missing" | undefined;
        blockedReason?: string | undefined;
        contractFailure?: {
            message: string;
            kind: "environment" | "missing_configuration" | "authentication" | "authorization" | "invalid_request" | "rate_limit" | "upstream" | "parse";
            status?: number | undefined;
            environment?: string | undefined;
            endpoint?: string | undefined;
            retryable?: boolean | undefined;
        } | undefined;
        warnings?: string[] | undefined;
        evidenceSummary?: {
            canRecommend: boolean;
            canDiscover: boolean;
            missingEvidence?: string[] | undefined;
            whatWouldResolveIt?: string[] | undefined;
        } | undefined;
    } | undefined;
    progress?: {
        at: string;
        message: string;
        stage: string;
    } | undefined;
    error?: string | undefined;
    placeProfile?: {
        placeIdentity: string;
        communityProfile: string;
        commercialSupply: string;
        behaviouralSignals: string;
        evidenceQuality?: "strong" | "moderate" | "insufficient" | undefined;
        culturalAssets?: string[] | undefined;
        unmetNeeds?: string[] | undefined;
    } | undefined;
    retailOutput?: {
        positioning: string;
        evidenceSummary: string;
        formatRecommendation: string;
        communityFit: string;
        gaps?: string[] | undefined;
        categoryMix?: {
            alignment: string;
            category: string;
            confidence?: "strong" | "moderate" | "weak" | undefined;
            evidence?: string[] | undefined;
        }[] | undefined;
        localCollaborations?: string[] | undefined;
    } | undefined;
    operatorOutput?: {
        evidenceSummary: string;
        programmingModel: string;
        experienceMix?: {
            type: string;
            rationale: string;
            evidence?: string[] | undefined;
            proportion?: "primary" | "secondary" | "supplementary" | undefined;
        }[] | undefined;
        activations?: {
            rationale: string;
            activity: string;
            audience: string;
            frequency: string;
            evidence?: string[] | undefined;
            spaceRequired?: string | undefined;
        }[] | undefined;
        tenantRationale?: {
            why: string;
            tenantType: string;
            evidence?: string[] | undefined;
        }[] | undefined;
        whatToStop?: string[] | undefined;
    } | undefined;
    hospitalityOutput?: {
        evidenceSummary: string;
        programmingModel: string;
        conceptIdentity: string;
        fbStrategy: string;
        daypartStrategy: string;
        atmosphereNotes: string;
    } | undefined;
}>;
export declare const PIPELINE_STAGES: readonly [{
    readonly id: "place";
    readonly label: "Brief";
}, {
    readonly id: "recommendation";
    readonly label: "Recommendation";
}, {
    readonly id: "spatial";
    readonly label: "Spatial translation";
}, {
    readonly id: "review";
    readonly label: "Review";
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
export type CulturalPattern = z.infer<typeof CulturalPatternSchema>;
export type QlooContext = z.infer<typeof QlooContextSchema>;
export type QlooLocationResolution = z.infer<typeof QlooLocationResolutionSchema>;
export type Counterfactual = z.infer<typeof CounterfactualSchema>;
export type AnalysisSnapshot = z.infer<typeof AnalysisSnapshotSchema>;
export type ProjectRecord = z.infer<typeof ProjectSchema>;
export type RetailCategory = z.infer<typeof RetailCategorySchema>;
export type RetailStrategyOutput = z.infer<typeof RetailStrategyOutputSchema>;
export type ProgrammingActivity = z.infer<typeof ProgrammingActivitySchema>;
export type ExperienceMixItem = z.infer<typeof ExperienceMixItemSchema>;
export type TenantRationale = z.infer<typeof TenantRationaleSchema>;
export type OperatorOutput = z.infer<typeof OperatorOutputSchema>;
export type HospitalityOutput = z.infer<typeof HospitalityOutputSchema>;
export type PlaceProfile = z.infer<typeof PlaceProfileSchema>;
//# sourceMappingURL=pipeline.d.ts.map