import { z } from 'zod';
export declare const ProvenanceKindSchema: z.ZodEnum<["qloo_evidence", "inference", "assumption", "decision", "external", "constraint"]>;
export type ProvenanceKind = z.infer<typeof ProvenanceKindSchema>;
export declare const ProvenanceNodeSchema: z.ZodObject<{
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
}>;
export type ProvenanceNode = z.infer<typeof ProvenanceNodeSchema>;
//# sourceMappingURL=provenance.d.ts.map