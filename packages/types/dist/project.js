import { z } from 'zod';
export const ProjectTypeSchema = z.enum([
    'restaurant',
    'hotel',
    'retail',
    'hospitality',
    'other'
]);
export const AudienceSchema = z.object({
    name: z.string(),
    priority: z.number().int().min(1).max(3).optional(),
    description: z.string().optional()
});
export const ConstraintSchema = z.object({
    key: z.string(),
    value: z.string(),
    type: z.enum(['text', 'number', 'boolean']).default('text')
});
export const ProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    location: z.object({
        address: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        city: z.string().optional(),
        neighborhood: z.string().optional()
    }),
    projectType: ProjectTypeSchema,
    objective: z.string(),
    budgetRange: z.string().optional(),
    floorArea: z.string().optional(),
    floorPlanUrl: z.string().optional(),
    audiences: z.array(AudienceSchema).default([]),
    constraints: z.array(ConstraintSchema).default([]),
    status: z.enum(['draft', 'analyzing', 'strategizing', 'designing', 'review', 'complete']).default('draft'),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
});
