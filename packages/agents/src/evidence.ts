import type { AnalysisSnapshot, EvidenceGate, LocationContext, Project, QlooContext } from '@placegraph/types';

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
  project: Project;
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
    .filter((n: string) =>
      n.includes('Falling back to location anchor') || n.includes('no locally-relevant seed')
    ).length;

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

  if (opts.qloo && opts.location) {
    gate.evidenceSummary = buildEvidenceSummary(gate, opts.qloo, opts.location, opts.project);
  }

  return gate;
}

function buildEvidenceSummary(
  gate: EvidenceGate,
  qlooContext: QlooContext,
  locationContext: LocationContext,
  project: Project
): EvidenceGate['evidenceSummary'] {
  const missing: string[] = [];
  const resolve: string[] = [];

  // Audience seeds
  const seedFallbacks = (qlooContext.notes ?? []).filter((n) =>
    n.includes('Falling back to location anchor') || n.includes('no locally-relevant seed')
  );
  if (seedFallbacks.length > 0) {
    missing.push(`Cultural profile is incomplete for ${seedFallbacks.length} audience segment(s). The system used location-level data instead of audience-specific cultural signals.`);
    resolve.push('Provide more specific audience descriptions that name real places, brands, or activities this audience frequents. For example: "regulars at Netil Market and Brilliant Corners" is more resolvable than "local residents".');
  }

  // Location precision
  const countryLevel = (qlooContext.notes ?? []).some((n) =>
    n.toLowerCase().includes('resolved as') &&
    (n.toLowerCase().includes('united kingdom') || n.toLowerCase().includes('united states'))
  );
  if (countryLevel) {
    missing.push('Qloo location resolved to country level. Affinities reflect broad national taste, not neighbourhood culture.');
    resolve.push('Add the specific neighbourhood name and city to the location field. If the neighbourhood name is unusual, add a nearby landmark or the nearest major street.');
  }

  // POI coverage
  const poiWarning = (locationContext.notes ?? []).some((n) =>
    n.includes('No bars or pubs found') || n.includes('Overpass mirrors were unavailable')
  );
  if (poiWarning) {
    missing.push('Local commercial environment data is incomplete. The absence of a category in the results may reflect data coverage, not actual absence.');
    resolve.push('The system will retry with Nominatim fallback data, but commercial gap claims should be independently verified before treating them as investment evidence.');
  }

  // Qloo insufficiency
  if (qlooContext.insufficient) {
    missing.push('Qloo returned no scored affinities for this location and audience combination. Cultural evidence is absent.');
    resolve.push('Try a more prominent nearby location as the anchor (e.g. the nearest major street or district rather than a specific address). If this is a genuinely low-signal location, cultural evidence may not be available.');
  }

  const canRecommend = gate.allowConfidentRecommendation && missing.length === 0;
  const canDiscover = gate.qlooQuality !== 'insufficient' && missing.length <= 1;

  return {
    canRecommend,
    canDiscover,
    missingEvidence: missing,
    whatWouldResolveIt: resolve,
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
