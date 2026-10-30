import { z } from 'zod';
export declare const ProjectTypeSchema: z.ZodEnum<["restaurant", "hotel", "retail", "bar", "cafe", "office", "mixed", "hospitality", "other"]>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;
export declare const AudienceSchema: z.ZodObject<{
    name: z.ZodString;
    priority: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority?: number | undefined;
    description?: string | undefined;
}, {
    name: string;
    priority?: number | undefined;
    description?: string | undefined;
}>;
export declare const ConstraintSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["text", "number", "boolean"]>>;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: "number" | "boolean" | "text";
    key: string;
}, {
    value: string;
    key: string;
    type?: "number" | "boolean" | "text" | undefined;
}>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    location: z.ZodObject<{
        address: z.ZodOptional<z.ZodString>;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
        city: z.ZodOptional<z.ZodString>;
        neighborhood: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        city?: string | undefined;
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        neighborhood?: string | undefined;
    }, {
        city?: string | undefined;
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        neighborhood?: string | undefined;
    }>;
    mode: z.ZodDefault<z.ZodEnum<["evaluate", "discover"]>>;
    projectType: z.ZodDefault<z.ZodEnum<["restaurant", "hotel", "retail", "bar", "cafe", "office", "mixed", "hospitality", "other"]>>;
    businessType: z.ZodDefault<z.ZodString>;
    operatorType: z.ZodOptional<z.ZodEnum<["developer", "hospitality", "retail", "operator"]>>;
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
    concept: z.ZodOptional<z.ZodObject<{
        format: z.ZodDefault<z.ZodString>;
        positioning: z.ZodOptional<z.ZodString>;
        offerings: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        tenantMix: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        targetAudiences: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        experienceNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        format: string;
        offerings: string[];
        tenantMix: string[];
        targetAudiences: string[];
        positioning?: string | undefined;
        experienceNotes?: string | undefined;
    }, {
        format?: string | undefined;
        positioning?: string | undefined;
        offerings?: string[] | undefined;
        tenantMix?: string[] | undefined;
        targetAudiences?: string[] | undefined;
        experienceNotes?: string | undefined;
    }>>;
    objective: z.ZodString;
    investmentIntent: z.ZodOptional<z.ZodString>;
    budgetRange: z.ZodOptional<z.ZodString>;
    floorArea: z.ZodOptional<z.ZodString>;
    floorPlanUrl: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    audiences: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        priority?: number | undefined;
        description?: string | undefined;
    }, {
        name: string;
        priority?: number | undefined;
        description?: string | undefined;
    }>, "many">>;
    targetAudience: z.ZodOptional<z.ZodString>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["text", "number", "boolean"]>>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: "number" | "boolean" | "text";
        key: string;
    }, {
        value: string;
        key: string;
        type?: "number" | "boolean" | "text" | undefined;
    }>, "many">>;
    status: z.ZodDefault<z.ZodEnum<["draft", "analyzing", "strategizing", "designing", "review", "complete"]>>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "review" | "complete" | "draft" | "analyzing" | "strategizing" | "designing";
    id: string;
    name: string;
    constraints: {
        value: string;
        type: "number" | "boolean" | "text";
        key: string;
    }[];
    mode: "discover" | "evaluate";
    location: {
        city?: string | undefined;
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        neighborhood?: string | undefined;
    };
    projectType: "hospitality" | "retail" | "other" | "restaurant" | "hotel" | "bar" | "cafe" | "office" | "mixed";
    businessType: string;
    organisationProfiles: {
        type: "developer" | "hospitality" | "retail" | "operator" | "facility" | "investor" | "mixed_use" | "other";
        id: string;
        name: string;
        primary: boolean;
        deliverables: string[];
        mandate?: string | undefined;
    }[];
    objective: string;
    audiences: {
        name: string;
        priority?: number | undefined;
        description?: string | undefined;
    }[];
    updatedAt?: string | undefined;
    primaryProfileId?: string | undefined;
    operatorType?: "developer" | "hospitality" | "retail" | "operator" | undefined;
    decisionFrame?: {
        type: "other" | "develop" | "establish" | "enter_market" | "tenant_mix" | "reposition" | "adapt" | "store_format" | "utilisation" | "audience_choice";
        subject: string;
        successTests: string[];
        constraints: string[];
        timeHorizon?: string | undefined;
        capitalIntent?: string | undefined;
    } | undefined;
    concept?: {
        format: string;
        offerings: string[];
        tenantMix: string[];
        targetAudiences: string[];
        positioning?: string | undefined;
        experienceNotes?: string | undefined;
    } | undefined;
    investmentIntent?: string | undefined;
    budgetRange?: string | undefined;
    floorArea?: string | undefined;
    floorPlanUrl?: string | undefined;
    workspaceId?: string | undefined;
    targetAudience?: string | undefined;
    createdAt?: string | undefined;
}, {
    id: string;
    name: string;
    location: {
        city?: string | undefined;
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        neighborhood?: string | undefined;
    };
    objective: string;
    status?: "review" | "complete" | "draft" | "analyzing" | "strategizing" | "designing" | undefined;
    constraints?: {
        value: string;
        key: string;
        type?: "number" | "boolean" | "text" | undefined;
    }[] | undefined;
    updatedAt?: string | undefined;
    mode?: "discover" | "evaluate" | undefined;
    primaryProfileId?: string | undefined;
    projectType?: "hospitality" | "retail" | "other" | "restaurant" | "hotel" | "bar" | "cafe" | "office" | "mixed" | undefined;
    businessType?: string | undefined;
    operatorType?: "developer" | "hospitality" | "retail" | "operator" | undefined;
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
        format?: string | undefined;
        positioning?: string | undefined;
        offerings?: string[] | undefined;
        tenantMix?: string[] | undefined;
        targetAudiences?: string[] | undefined;
        experienceNotes?: string | undefined;
    } | undefined;
    investmentIntent?: string | undefined;
    budgetRange?: string | undefined;
    floorArea?: string | undefined;
    floorPlanUrl?: string | undefined;
    workspaceId?: string | undefined;
    audiences?: {
        name: string;
        priority?: number | undefined;
        description?: string | undefined;
    }[] | undefined;
    targetAudience?: string | undefined;
    createdAt?: string | undefined;
}>;
export type Project = z.infer<typeof ProjectSchema>;
//# sourceMappingURL=project.d.ts.map