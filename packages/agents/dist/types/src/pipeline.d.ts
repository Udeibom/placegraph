import { z } from 'zod';
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
    type: "alignment" | "whitespace" | "destination" | "mixed";
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
}>;
export declare const ExperienceRequirementSchema: z.ZodObject<{
    id: z.ZodString;
    strategyId: z.ZodString;
    requirement: z.ZodString;
    rationale: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    source: z.ZodDefault<z.ZodEnum<["evidence", "inference"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    priority: "low" | "medium" | "high";
    rationale: string;
    strategyId: string;
    requirement: string;
    source: "inference" | "evidence";
}, {
    id: string;
    rationale: string;
    strategyId: string;
    requirement: string;
    priority?: "low" | "medium" | "high" | undefined;
    source?: "inference" | "evidence" | undefined;
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
}, {
    decision: string;
    id: string;
    strategyId: string;
    zone: string;
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
}>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Strategy = z.infer<typeof StrategySchema>;
export type ExperienceRequirement = z.infer<typeof ExperienceRequirementSchema>;
export type ArchitecturalDecision = z.infer<typeof ArchitecturalDecisionSchema>;
