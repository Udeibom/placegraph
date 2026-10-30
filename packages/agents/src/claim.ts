import type { EvidenceClaim, EvidenceQuality, EvidenceScope, EvidenceSource, EvidenceType } from '@placegraph/types';
import { generateId, nowIso } from '@placegraph/core';

export function makeEvidenceClaim(input: {
  stage: string;
  claim: string;
  evidenceType: EvidenceType;
  source: EvidenceSource;
  quality: EvidenceQuality;
  scope?: EvidenceScope;
  confidence?: number;
  qlooRefs?: string[];
  localRefs?: string[];
  supporting?: string[];
  limitations?: string[];
  interpretation?: string;
  implication?: string;
  validationRequired?: string[];
  sourceEnvironment?: string;
}): EvidenceClaim {
  return {
    id: generateId('ev'),
    stage: input.stage,
    claim: input.claim,
    evidenceType: input.evidenceType,
    source: input.source,
    quality: input.quality,
    scope: input.scope ?? { audienceIds: [] },
    confidence: input.confidence,
    qlooRefs: input.qlooRefs ?? [],
    localRefs: input.localRefs ?? [],
    supporting: input.supporting ?? [],
    limitations: input.limitations ?? [],
    interpretation: input.interpretation,
    implication: input.implication,
    validationRequired: input.validationRequired ?? [],
    sourceEnvironment: input.sourceEnvironment,
    observedAt: nowIso()
  };
}
