import type {
  AnalysisSnapshot,
  EvidenceGate,
  LocationContext,
  Project,
  QlooContext
} from '@placegraph/types';

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
  const unresolvedAudiences = (opts.qloo?.audienceResolutions || []).filter(
    (audience) => audience.status === 'unresolved' || audience.status === 'failed'
  );
  const approximateAudiences = (opts.qloo?.audienceResolutions || []).filter(
    (audience) => audience.status === 'approximate'
  );
  const qlooStatus: NonNullable<EvidenceGate['qlooStatus']> = !opts.qloo
    ? 'missing'
    : opts.qloo.source === 'failed' || opts.qloo.source === 'unavailable'
      ? opts.qloo.source === 'failed'
        ? 'failed'
        : 'missing'
      : opts.qloo.source === 'live'
        ? opts.qloo.insufficient
          ? 'degraded'
          : 'ready'
        : opts.qloo.source === 'mock'
          ? 'missing'
          : 'degraded';

  const qlooQuality: EvidenceGate['qlooQuality'] =
    qlooStatus === 'ready'
      ? opts.qloo!.affinities.length >= 5
        ? 'strong'
        : 'moderate'
      : qlooStatus === 'degraded'
        ? opts.qloo?.affinities?.length
          ? 'moderate'
          : 'insufficient'
        : 'insufficient';

  const mode = intelligenceMode({ llmAvailable: opts.llmAvailable, qloo: opts.qloo });
  const warnings: string[] = [];
  const blocked: string[] = [];

  if (!opts.llmAvailable) {
    warnings.push(
      'No Groq key: opportunity, strategy and architecture text is structured fallback, not live agent reasoning.'
    );
  }
  if (!opts.qloo) {
    warnings.push(
      'No Qloo context was produced. Cultural claims are absent rather than inferred.'
    );
    blocked.push('Qloo evidence is missing.');
  } else if (opts.qloo.source === 'mock') {
    warnings.push(
      'Qloo is in mock mode. Affinities are illustrative cultural relationships, not live graph evidence for this location.'
    );
    blocked.push('Qloo evidence is illustrative only.');
  } else if (opts.qloo.source === 'failed' || opts.qloo.source === 'unavailable') {
    warnings.push(
      `Qloo is ${opts.qloo.source}. No cultural claims were generated and confident cultural recommendations are blocked.`
    );
    blocked.push(
      opts.qloo.failure?.message ||
        'Qloo did not return live evidence for this analysis.'
    );
  } else if (opts.qloo.insufficient) {
    warnings.push('Live Qloo returned thin evidence. Treat cultural relationships as incomplete.');
    blocked.push('Qloo affinity evidence is thin.');
  }

  if (unresolvedAudiences.length) {
    warnings.push(
      `${unresolvedAudiences.length} audience profile${unresolvedAudiences.length === 1 ? '' : 's'} could not be resolved. Audience-specific claims are gated.`
    );
    blocked.push('One or more audience profiles are unresolved.');
  }
  if (approximateAudiences.length) {
    warnings.push(
      `${approximateAudiences.length} audience profile${approximateAudiences.length === 1 ? '' : 's'} is approximate. Treat audience-specific claims as provisional.`
    );
  }
  if (locationQuality === 'insufficient') {
    warnings.push('Local commercial inventory is incomplete. Existing-landscape claims are weakly grounded.');
    blocked.push('Local commercial inventory is incomplete.');
  }

  const locationNote = (opts.qloo?.notes || []).find((note) => note.includes('location resolved as'));
  const locationResolution = opts.qloo?.locationResolution;
  const broadScope =
    locationResolution &&
    ['region', 'country', 'global', 'unresolved'].includes(locationResolution.scope);
  if (broadScope) {
    warnings.push('Qloo location is broader than the site or unresolved. Cultural claims are not locally specific.');
    blocked.push('Qloo geography is broader than the site or unresolved.');
  } else if (locationResolution?.resolved) {
    warnings.push(
      locationNote ||
        `Qloo location resolved at ${locationResolution.scope} scope: ${locationResolution.query}.`
    );
  } else if (!locationResolution) {
    const oldBroadNote = (opts.qloo?.notes || []).some((note) =>
      note.includes('could not resolve a location filter')
    );
    if (oldBroadNote) {
      warnings.push('Qloo location could not be resolved. Cultural claims are not locally specific.');
      blocked.push('Qloo geography is unresolved.');
    } else if (locationNote) {
      warnings.push(locationNote);
    }
  }

  if (opts.qloo?.notes?.length) warnings.push(...opts.qloo.notes);
  if (opts.location?.notes?.length) warnings.push(...opts.location.notes);

  const allowConfidentRecommendation =
    opts.llmAvailable &&
    locationQuality !== 'insufficient' &&
    qlooQuality !== 'insufficient' &&
    qlooStatus === 'ready' &&
    blocked.length === 0 &&
    mode !== 'template';

  const gate: EvidenceGate = {
    locationQuality,
    qlooQuality,
    llmAvailable: opts.llmAvailable,
    intelligenceMode: mode,
    allowConfidentRecommendation,
    qlooStatus,
    blockedReason: blocked.length ? [...new Set(blocked)].join(' ') : undefined,
    contractFailure: opts.qloo?.failure,
    warnings: [...new Set(warnings)]
  };

  if (opts.qloo && opts.location) {
    gate.evidenceSummary = buildEvidenceSummary(gate, opts.qloo, opts.location);
  }

  return gate;
}

function buildEvidenceSummary(
  gate: EvidenceGate,
  qlooContext: QlooContext,
  locationContext: LocationContext
): EvidenceGate['evidenceSummary'] {
  const missing: string[] = [];
  const resolve: string[] = [];
  const audiences = qlooContext.audienceResolutions || [];

  const unresolved = audiences.filter(
    (audience) => audience.status === 'unresolved' || audience.status === 'failed'
  );
  if (unresolved.length) {
    missing.push(
      `Audience-specific evidence is missing for ${unresolved.length} segment${unresolved.length === 1 ? '' : 's'}: ${unresolved.map((audience) => audience.name).join(', ')}.`
    );
    resolve.push(
      'Replace vague audience descriptions with Qloo taxonomy terms or real places, brands, and activities those audiences frequent.'
    );
  }

  if (gate.qlooStatus === 'failed' || gate.qlooStatus === 'missing') {
    missing.push(
      qlooContext.failure?.message ||
        'No live Qloo evidence was available. Cultural claims are absent, not inferred.'
    );
    resolve.push(
      'Configure a valid Qloo API key for the intended environment and retry. Production must use QLOO_API_BASE_URL explicitly.'
    );
  }

  if (gate.qlooStatus === 'degraded') {
    missing.push('Qloo returned live but thin or approximate evidence.');
    resolve.push('Try a more specific anchor, additional resolvable audiences, and verify local supply.');
  }

  if (gate.qlooQuality === 'insufficient') {
    missing.push('No scored Qloo affinity evidence supports a cultural recommendation.');
    resolve.push('Add resolvable audience descriptions and a known nearby place anchor, then retry.');
  }

  const broadScope = qlooContext.locationResolution &&
    ['region', 'country', 'global', 'unresolved'].includes(qlooContext.locationResolution.scope);
  if (broadScope) {
    missing.push('Qloo location resolved to a broad or unresolved geography. Affinities are not neighbourhood-specific.');
    resolve.push('Add the neighbourhood and city, and verify the resolved Qloo locality.');
  }

  if (locationContext.evidenceQuality === 'insufficient') {
    missing.push('Local commercial environment data is incomplete. Absence of a category may reflect coverage, not demand.');
    resolve.push('Verify local supply independently before treating a gap as evidence.');
  }

  if (qlooContext.insufficient) {
    missing.push('Qloo evidence is insufficient for confident cultural claims.');
    resolve.push('Retry with a stronger place anchor and more resolvable audience profiles.');
  }

  const canRecommend = gate.allowConfidentRecommendation && missing.length === 0;
  const canDiscover = gate.qlooStatus !== 'failed' && gate.qlooStatus !== 'missing' && missing.length <= 2;

  return {
    canRecommend,
    canDiscover,
    missingEvidence: [...new Set(missing)],
    whatWouldResolveIt: [...new Set(resolve)]
  };
}

export function applyEvidenceGateToSnapshot(snapshot: AnalysisSnapshot, gate: EvidenceGate): AnalysisSnapshot {
  const extra = gate.allowConfidentRecommendation
    ? []
    : [
        gate.blockedReason
          ? `Evidence gate: ${gate.blockedReason} This is a hypothesis for professional review, not a confident recommendation.`
          : 'Evidence is not strong enough for a confident build recommendation. This is a hypothesis for professional review.'
      ];

  return {
    ...snapshot,
    evidenceGate: gate,
    intelligenceMode: gate.intelligenceMode,
    opportunities: snapshot.opportunities.map((op) => ({
      ...op,
      eligible: op.eligible !== false && gate.allowConfidentRecommendation,
      uncertainties: [...new Set([...(op.uncertainties || []), ...extra])]
    })),
    strategies: snapshot.strategies.map((strategy) => ({
      ...strategy,
      uncertainties: [...new Set([...(strategy.uncertainties || []), ...extra])]
    }))
  };
}
