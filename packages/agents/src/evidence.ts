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

  const gate: EvidenceGate = {
    locationQuality,
    qlooQuality,
    llmAvailable: opts.llmAvailable,
    intelligenceMode: mode,
    allowConfidentRecommendation,
    warnings: [...new Set(warnings)]
  };

  // Count how many fallback notes were added during Qloo context gathering
  const seedFallbackCount = (opts.qloo?.notes ?? [])
    .filter((n: string) => n.includes('Falling back to location anchor')).length;

  const locationIsCityLevel = !!(
    opts.qloo?.notes?.some((n: string) =>
      n.toLowerCase().includes('resolved as') &&
      (n.toLowerCase().includes('united kingdom') ||
       n.toLowerCase().includes('united states') ||
       n.toLowerCase().includes('germany') ||
       n.toLowerCase().includes('france'))
    )
  );

  const audienceCount = Object.keys(opts.qloo?.audienceAffinities ?? {}).length;

  if (locationIsCityLevel && gate.qlooQuality === 'strong') {
    gate.qlooQuality = 'moderate';
    gate.warnings.push('Qloo location resolved to country level, not neighbourhood. Affinities reflect broad regional taste, not local culture. Treat recommendation as indicative.');
  }

  if (seedFallbackCount >= 2) {
    gate.qlooQuality = 'insufficient';
    gate.warnings.push(`${seedFallbackCount} of ${audienceCount} audience seeds could not be resolved to local entities. Cultural evidence is insufficient for a confident recommendation.`);
    gate.allowConfidentRecommendation = false;
  }

  if (seedFallbackCount === 1 && gate.qlooQuality === 'strong') {
    gate.qlooQuality = 'moderate';
    gate.warnings.push('One audience seed fell back to the location anchor. Cultural evidence for that audience segment is approximate.');
  }

  gate.warnings = [...new Set(gate.warnings)];
  return gate;
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
