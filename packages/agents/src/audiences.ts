import type {
  AudienceAffinityEvidence,
  AudienceResolution,
  EvidenceClaim,
  Project,
  QlooIdentifier
} from '@placegraph/types';
import type { QlooAffinity, QlooAudience } from '@placegraph/qloo';
import { normalizeQlooId } from '@placegraph/qloo';
import { generateId } from '@placegraph/core';
import { makeEvidenceClaim } from './claim';

export interface AudienceQlooClient {
  searchAudiences(query: string, take?: number): Promise<QlooAudience[]>;
  searchEntities(query: string, opts?: { take?: number; limit?: number; type?: string }): Promise<any[]>;
  getAffinities(entity: string | { id?: string; name: string }, opts?: any): Promise<QlooAffinity[]>;
  getAudienceAffinities(
    audienceIds: string[],
    opts?: { locationQuery?: string; take?: number; domains?: string[] }
  ): Promise<QlooAffinity[]>;
}

export interface AudienceResolutionResult {
  audiences: AudienceResolution[];
  affinities: QlooAffinity[];
  claims: EvidenceClaim[];
  notes: string[];
}

function identifiersForAudience(audience: QlooAudience, environment: string): QlooIdentifier[] {
  const rows: QlooIdentifier[] = [];
  if (audience.entityId) {
    rows.push({
      uuid: audience.entityId,
      urn: audience.id,
      displayName: audience.name,
      entityType: audience.type,
      domain: 'audience',
      environment
    });
  } else if (audience.id) {
    rows.push({
      urn: audience.id,
      displayName: audience.name,
      entityType: audience.type,
      domain: 'audience',
      environment
    });
  }
  return rows;
}

function toAffinityEvidence(affinity: QlooAffinity): AudienceAffinityEvidence {
  return {
    target: affinity.target,
    targetId: affinity.targetId,
    urn: affinity.urn,
    strength: affinity.strength,
    domain: affinity.domain,
    genre: affinity.genre,
    city: affinity.city,
    seedCount: affinity.seedCount ?? 1
  };
}

function poolAffinities(batches: QlooAffinity[][]): QlooAffinity[] {
  const scores = new Map<
    string,
    { affinity: QlooAffinity; count: number; totalStrength: number }
  >();

  for (const batch of batches) {
    for (const affinity of batch) {
      if (!affinity?.target || typeof affinity.strength !== 'number') continue;
      const key = normalizeQlooId(affinity.urn || affinity.targetId) || affinity.target.toLowerCase();
      const existing = scores.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalStrength += affinity.strength;
      } else {
        scores.set(key, { affinity, count: 1, totalStrength: affinity.strength });
      }
    }
  }

  return [...scores.values()]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.totalStrength - a.totalStrength;
    })
    .map((entry) => ({
      ...entry.affinity,
      strength:
        entry.count > 1
          ? Math.min(1, entry.affinity.strength * (1 + (entry.count - 1) * 0.05))
          : entry.affinity.strength,
      seedCount: entry.count
    }));
}

function readableIds(identifiers: QlooIdentifier[]): string[] {
  return identifiers.flatMap((identifier) =>
    [identifier.uuid, identifier.urn].filter((value): value is string => Boolean(value))
  );
}

const AUDIENCE_STOPWORDS = new Set([
  'local', 'resident', 'residents', 'visitor', 'visitors', 'people', 'person', 'persons',
  'audience', 'audiences', 'target', 'within', 'living', 'live', 'attending', 'particular',
  'defined', 'catchment', 'destination', 'cultural', 'district', 'young', 'family', 'families',
  'independent', 'professional', 'professionals', 'aged', 'age', 'years', 'year', 'old',
  'aware', 'based', 'nearby', 'area', 'areas', 'community', 'communities',
  'and', 'the', 'for', 'with', 'who', 'that', 'from', 'into', 'around', 'their',
  'this', 'these', 'those', 'of', 'in', 'on', 'at', 'by', 'to', 'as', 'or'
]);

function normalizedText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function contentTokens(value: string): string[] {
  return [...new Set(
    normalizedText(value)
      .split(' ')
      .filter((token) => token.length >= 3 && !AUDIENCE_STOPWORDS.has(token))
  )];
}

function taxonomyRelevant(query: string, candidate: QlooAudience): boolean {
  const queryTokens = contentTokens(query);
  if (!queryTokens.length) return false;
  const candidateText = normalizedText([
    candidate.name,
    candidate.disambiguation,
    ...(candidate.tags || []),
    ...(candidate.parents || [])
  ].filter(Boolean).join(' '));
  if (!candidateText) return false;
  const normalizedQuery = normalizedText(query);
  if (normalizedQuery && candidateText.includes(normalizedQuery)) return true;
  const candidateTokens = new Set(contentTokens(candidateText));
  return queryTokens.some((token) => token.length >= 4 && candidateTokens.has(token));
}

function seedRelevant(query: string, seed: { name?: string; type?: string; domain?: string }): boolean {
  const queryTokens = contentTokens(query);
  if (!queryTokens.length || !seed.name) return false;
  const seedText = normalizedText(seed.name);
  const seedTokens = new Set(contentTokens(seed.name));
  if (!seedTokens.size) return false;
  const normalizedQuery = normalizedText(query);
  if (normalizedQuery && (seedText.includes(normalizedQuery) || normalizedQuery.includes(seedText))) {
    return true;
  }
  return queryTokens.filter((token) => seedTokens.has(token)).length >= 2;
}

async function resolveOneAudience(
  audience: Project['audiences'][number],
  client: AudienceQlooClient,
  locationQuery: string | undefined,
  environment: string
): Promise<{
  resolution: AudienceResolution;
  affinities: QlooAffinity[];
  claims: EvidenceClaim[];
  notes: string[];
}> {
  const name = audience.name.trim();
  const queries = [...new Set([name, audience.description?.trim()].filter(Boolean))] as string[];
  const notes: string[] = [];
  const claims: EvidenceClaim[] = [];
  const audienceId = generateId('aud');

  let taxonomy: QlooAudience | undefined;
  for (const query of queries) {
    const matches = await client.searchAudiences(query, 5);
    taxonomy = matches.find((match) => taxonomyRelevant(query, match));
    if (taxonomy) break;
  }

  if (taxonomy) {
    const identifiers = identifiersForAudience(taxonomy, environment);
    const qlooRefs = readableIds(identifiers);
    const affinityRows = locationQuery
      ? await client.getAudienceAffinities(qlooRefs, {
          locationQuery,
          take: 15,
          domains: ['urn:entity:place']
        })
      : [];
    const status =
      affinityRows.length >= 3 ? 'resolved' : affinityRows.length > 0 ? 'approximate' : 'unresolved';
    const quality =
      affinityRows.length >= 5 ? 'strong' : affinityRows.length > 0 ? 'approximate' : 'insufficient';
    const locationLimitation = locationQuery
      ? undefined
      : 'No local Qloo location was resolved, so global affinities were withheld.';

    const resolutionClaim = makeEvidenceClaim({
      stage: 'audience_resolution',
      claim: `Qloo resolved "${name}" to taxonomy audience "${taxonomy.name}".`,
      evidenceType: 'qloo_search',
      source: 'qloo',
      quality,
      scope: { place: locationQuery, audienceIds: [audienceId] },
      qlooRefs,
      supporting: [taxonomy.name, taxonomy.disambiguation || ''].filter(Boolean),
      limitations:
        status === 'unresolved'
          ? [
              locationLimitation ||
                'Audience taxonomy resolved, but no scored local place affinities were returned.'
            ]
          : [],
      implication:
        status === 'unresolved'
          ? 'Do not treat this audience as culturally profiled.'
          : 'Audience identity can be used for cultural relationship analysis.',
      sourceEnvironment: environment
    });
    claims.push(resolutionClaim);

    let affinityClaim: EvidenceClaim | undefined;
    if (affinityRows.length) {
      affinityClaim = makeEvidenceClaim({
        stage: 'affinity_collection',
        claim: `Qloo returned ${affinityRows.length} scored place affinities for "${name}"${locationQuery ? ` around ${locationQuery}` : ''}.`,
        evidenceType: 'qloo_affinity',
        source: 'qloo',
        quality,
        scope: { place: locationQuery, audienceIds: [audienceId] },
        confidence: quality === 'strong' ? 0.78 : 0.55,
        qlooRefs: [...qlooRefs, ...affinityRows.map((row) => row.urn || row.targetId || row.target)],
        supporting: affinityRows.slice(0, 8).map((row) => `${row.target} (${row.strength.toFixed(3)})`),
        limitations: [
          'Scored affinity is a cultural relationship, not demand, attendance, spend, or willingness to pay.'
        ],
        interpretation: 'These are the place relationships Qloo associates with the resolved audience.',
        implication: 'Use as cultural evidence; validate commercial demand separately.',
        sourceEnvironment: environment
      });
      claims.push(affinityClaim);
    }

    return {
      resolution: {
        id: audienceId,
        name,
        priority: audience.priority,
        description: audience.description,
        query: taxonomy.name,
        status,
        quality,
        identifiers,
        seeds: [],
        affinities: affinityRows.map((row) => ({
          ...toAffinityEvidence(row),
          evidenceClaimId: affinityClaim?.id
        })),
        evidenceClaimIds: claims.map((claim) => claim.id),
        limitations:
          status === 'unresolved'
            ? [
                locationLimitation ||
                  'No scored local place affinities returned for this audience.'
              ]
            : ['Affinity is not a demand forecast.']
      },
      affinities: affinityRows,
      claims,
      notes
    };
  }

  const seedBatches = await Promise.all(
    queries.map((query) => client.searchEntities(query, { take: 5 }))
  );
  const seen = new Set<string>();
  const seeds = seedBatches
    .flat()
    .filter((entity) => {
      if (!queries.some((query) => seedRelevant(query, entity))) return false;
      const key = normalizeQlooId(entity.urn || entity.id) || entity.name?.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);

  if (!seeds.length) {
    const claim = makeEvidenceClaim({
      stage: 'audience_resolution',
      claim: `Qloo could not resolve "${name}" to a semantically relevant taxonomy audience or entity seed.`,
      evidenceType: 'qloo_search',
      source: 'qloo',
      quality: 'unresolved',
      scope: { place: locationQuery, audienceIds: [audienceId] },
      limitations: [
        'No taxonomy audience or entity match was semantically relevant to this audience description.'
      ],
      implication: 'Audience-specific cultural evidence is unavailable.',
      validationRequired: [
        'Replace the audience description with a Qloo taxonomy term or named places, brands, and activities those audiences genuinely frequent.'
      ],
      sourceEnvironment: environment
    });
    notes.push(`Audience "${name}": unresolved.`);
    return {
      resolution: {
        id: audienceId,
        name,
        priority: audience.priority,
        description: audience.description,
        query: name,
        status: 'unresolved',
        quality: 'unresolved',
        identifiers: [],
        seeds: [],
        affinities: [],
        evidenceClaimIds: [claim.id],
        limitations: ['No taxonomy audience or entity match was returned.']
      },
      affinities: [],
      claims: [claim],
      notes
    };
  }

  const seedIdentifiers: QlooIdentifier[] = seeds.map((seed) => ({
    uuid: seed.uuid,
    urn: seed.urn,
    displayName: seed.name,
    entityType: seed.type,
    domain: seed.domain,
    environment
  }));

  const searchClaim = makeEvidenceClaim({
    stage: 'audience_resolution',
    claim: `Qloo returned ${seeds.length} entity search match${seeds.length === 1 ? '' : 'es'} for "${name}" but no taxonomy audience.`,
    evidenceType: 'qloo_search',
    source: 'qloo',
    quality: 'approximate',
    scope: { place: locationQuery, audienceIds: [audienceId] },
    qlooRefs: readableIds(seedIdentifiers),
    supporting: seeds.map((seed) => seed.name),
    limitations: [
      'Search matches establish that entities exist; they are not affinity evidence.',
      'Entity seeds are an approximate proxy for an audience.'
    ],
    implication: 'Use only if scored affinities can be obtained from the seeds.',
    sourceEnvironment: environment
  });
  claims.push(searchClaim);

  let affinityBatches: QlooAffinity[][] = [];
  if (locationQuery) {
    affinityBatches = await Promise.all(
      seeds.map((seed) =>
        client.getAffinities(
          { id: seed.id, name: seed.name },
          {
            location: locationQuery,
            take: 12,
            domains: ['urn:entity:place']
          }
        )
      )
    );
  }
  const affinities = poolAffinities(affinityBatches);
  const status = affinities.length > 0 ? 'approximate' : 'unresolved';
  const quality = affinities.length > 0 ? 'approximate' : 'insufficient';

  let affinityClaim: EvidenceClaim | undefined;
  if (affinities.length) {
    affinityClaim = makeEvidenceClaim({
      stage: 'audience_profiles',
      claim: `Qloo returned ${affinities.length} scored place affinities pooled from ${seeds.length} seed entit${seeds.length === 1 ? 'y' : 'ies'} for "${name}".`,
      evidenceType: 'qloo_affinity',
      source: 'qloo',
      quality,
      scope: { place: locationQuery, audienceIds: [audienceId] },
      confidence: 0.4,
      qlooRefs: [...readableIds(seedIdentifiers), ...affinities.map((row) => row.urn || row.targetId || row.target)],
      supporting: affinities.slice(0, 8).map((row) => `${row.target} (${row.strength.toFixed(3)})`),
      limitations: [
        'The audience was represented by search-matched seeds, not a taxonomy audience.',
        'Scored affinity is not demand.'
      ],
      sourceEnvironment: environment
    });
    claims.push(affinityClaim);
  }

  notes.push(
    `Audience "${name}": ${status} from ${seeds.length} seed entit${seeds.length === 1 ? 'y' : 'ies'}${affinities.length ? ` and ${affinities.length} scored affinities` : ''}.`
  );

  return {
    resolution: {
      id: audienceId,
      name,
      priority: audience.priority,
      description: audience.description,
      query: name,
      status,
      quality,
      identifiers: [],
      seeds: seedIdentifiers,
      affinities: affinities.map((row) => ({
        ...toAffinityEvidence(row),
        evidenceClaimId: affinityClaim?.id
      })),
      evidenceClaimIds: claims.map((claim) => claim.id),
      limitations:
        status === 'approximate'
          ? ['Approximate audience profile built from semantically matched entity seeds rather than a Qloo taxonomy audience.']
          : ['Audience profile is incomplete; do not make confident cultural claims.']
    },
    affinities,
    claims,
    notes
  };
}

export async function resolveAudienceEvidence(
  project: Project,
  client: AudienceQlooClient,
  opts: { locationQuery?: string; environment: string }
): Promise<AudienceResolutionResult> {
  if (!project.audiences?.length) {
    return { audiences: [], affinities: [], claims: [], notes: ['No audiences were supplied.'] };
  }

  const results = await Promise.all(
    project.audiences.map((audience) =>
      resolveOneAudience(audience, client, opts.locationQuery, opts.environment)
    )
  );

  return {
    audiences: results.map((result) => result.resolution),
    affinities: results.flatMap((result) => result.affinities),
    claims: results.flatMap((result) => result.claims),
    notes: results.flatMap((result) => result.notes)
  };
}

export function unresolvedAudienceEvidence(project: Project, reason: string): AudienceResolutionResult {
  const claims: EvidenceClaim[] = [];
  const audiences = (project.audiences || []).map((audience) => {
    const id = generateId('aud');
    const claim = makeEvidenceClaim({
      stage: 'audience_resolution',
      claim: `Audience "${audience.name}" could not be resolved: ${reason}`,
      evidenceType: 'assumption',
      source: 'assumption',
      quality: 'unresolved',
      scope: { audienceIds: [id] },
      limitations: [reason],
      implication: 'No audience-specific cultural claims are available.'
    });
    claims.push(claim);
    return {
      id,
      name: audience.name,
      priority: audience.priority,
      description: audience.description,
      query: audience.name,
      status: 'failed' as const,
      quality: 'unresolved' as const,
      identifiers: [],
      seeds: [],
      affinities: [],
      evidenceClaimIds: [claim.id],
      limitations: [reason]
    };
  });
  return { audiences, affinities: [], claims, notes: [reason] };
}
