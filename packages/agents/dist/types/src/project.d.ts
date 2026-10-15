import { z } from 'zod';
export declare const ProjectTypeSchema: z.ZodEnum<["restaurant", "hotel", "retail", "hospitality", "other"]>;
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
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        city?: string | undefined;
        neighborhood?: string | undefined;
    }, {
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        city?: string | undefined;
        neighborhood?: string | undefined;
    }>;
    projectType: z.ZodEnum<["restaurant", "hotel", "retail", "hospitality", "other"]>;
    objective: z.ZodString;
    budgetRange: z.ZodOptional<z.ZodString>;
    floorArea: z.ZodOptional<z.ZodString>;
    floorPlanUrl: z.ZodOptional<z.ZodString>;
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
    status: "draft" | "analyzing" | "strategizing" | "designing" | "review" | "complete";
    id: string;
    name: string;
    location: {
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        city?: string | undefined;
        neighborhood?: string | undefined;
    };
    projectType: "restaurant" | "hotel" | "retail" | "hospitality" | "other";
    objective: string;
    audiences: {
        name: string;
        priority?: number | undefined;
        description?: string | undefined;
    }[];
    constraints: {
        value: string;
        type: "number" | "boolean" | "text";
        key: string;
    }[];
    budgetRange?: string | undefined;
    floorArea?: string | undefined;
    floorPlanUrl?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    id: string;
    name: string;
    location: {
        address?: string | undefined;
        lat?: number | undefined;
        lng?: number | undefined;
        city?: string | undefined;
        neighborhood?: string | undefined;
    };
    projectType: "restaurant" | "hotel" | "retail" | "hospitality" | "other";
    objective: string;
    status?: "draft" | "analyzing" | "strategizing" | "designing" | "review" | "complete" | undefined;
    budgetRange?: string | undefined;
    floorArea?: string | undefined;
    floorPlanUrl?: string | undefined;
    audiences?: {
        name: string;
        priority?: number | undefined;
        description?: string | undefined;
    }[] | undefined;
    constraints?: {
        value: string;
        key: string;
        type?: "number" | "boolean" | "text" | undefined;
    }[] | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}>;
export type Project = z.infer<typeof ProjectSchema>;
