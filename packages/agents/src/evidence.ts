import type { AnalysisSnapshot, EvidenceGate, LocationContext, QlooContext } from '@placegraph/types';

export type IntelligenceMode = EvidenceGate['intelligenceMode'];

export function intelligenceMode(opts: {
  llmAvailable: boolean;
  qloo: QlooContext | undefined;
}): IntelligenceMode {
  const liveQloo = opts.qloo?.source === 'live' && !opts.qloo.insufficient;
  if (opts.llmAvailable && liveQloo) return 'live';
  if (opts.llmAvailable || opts.qloo?.source === 'live' || opts.qloo?.source === 'mixed') return 'mixed';
  return 'template';
}

export function buildEvidenceGate(opts: {
  llmAvailable: boolean;
  location?: LocationContext;
  qloo?: QlooContext;
}): EvidenceGate {
  const locationQuality = opts.location?.evidenceQuality || 'insufficient';
  const qlooQuality: EvidenceGate['qlooQuality'] = !opts.qloo
    ? 'insufficient'
    : opts.qloo.insufficient
      ? 'insufficient'
      : opts.qloo.source === 'live'
        ? opts.qloo.affinities?.length >= 5
          ? 'strong'
          : 'moderate'
        : opts.qloo.source === 'mixed'
          ? 'moderate'
          : 'insufficient';

  const mode = intelligenceMode({ llmAvailable: opts.llmAvailable, qloo: opts.qloo });
  const warnings: string[] = [];

  if (!opts.llmAvailable) {
    warnings.push(
      'No Groq key: opportunity, strategy and architecture text is structured fallback, not live agent reasoning.'
    );
  }
  if (!opts.qloo || opts.qloo.source === 'mock') {
    warnings.push(
      'Qloo is in mock mode. Affinities are illustrative cultural relationships, not live graph evidence for this location.'
    );
  } else if (opts.qloo.insufficient) {
    warnings.push('Live Qloo returned thin evidence. Treat cultural relationships as incomplete.');
  }
  if (locationQuality === 'insufficient') {
    warnings.push('Local commercial inventory is incomplete. Existing-landscape claims are weakly grounded.');
  }
  if (opts.qloo?.notes?.length) warnings.push(...opts.qloo.notes);
  if (opts.location?.notes?.length) warnings.push(...opts.location.notes);

  const allowConfidentRecommendation =
    opts.llmAvailable &&
    locationQuality !== 'insufficient' &&
    qlooQuality !== 'insufficient' &&
    mode !== 'template';

  return {
    locationQuality,
    qlooQuality,
    llmAvailable: opts.llmAvailable,
    intelligenceMode: mode,
    allowConfidentRecommendation,
    warnings: [...new Set(warnings)]
  };
}

export function applyEvidenceGateToSnapshot(snapshot: AnalysisSnapshot, gate: EvidenceGate): AnalysisSnapshot {
  const extra = gate.allowConfidentRecommendation
    ? []
    : [
        'Evidence is not strong enough for a confident build recommendation. This is a hypothesis for professional review.'
      ];

  return {
    ...snapshot,
    evidenceGate: gate,
    intelligenceMode: gate.intelligenceMode,
    opportunities: snapshot.opportunities.map((op) => ({
      ...op,
      uncertainties: [...new Set([...(op.uncertainties || []), ...extra])]
    })),
    strategies: snapshot.strategies.map((s) => ({
      ...s,
      uncertainties: [...new Set([...(s.uncertainties || []), ...extra])]
    }))
  };
}
