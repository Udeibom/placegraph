import { z } from 'zod';

export const ProvenanceKindSchema = z.enum([
  'qloo_evidence',
  'inference',
  'assumption',
  'decision',
  'external',
  'constraint'
]);

export type ProvenanceKind = z.infer<typeof ProvenanceKindSchema>;

export const ProvenanceNodeSchema = z.object({
  id: z.string(),
  parentId: z.string().optional().nullable(),
  kind: ProvenanceKindSchema,
  explanation: z.string(),
  refs: z.array(z.string()).default([]),
  qlooRefs: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional()
});

export type ProvenanceNode = z.infer<typeof ProvenanceNodeSchema>;
