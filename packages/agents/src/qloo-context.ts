import {
  createQlooClient,
  hasQlooKey,
  missingQlooConfigError,
  normalizeQlooId,
  QlooApiError,
  QlooMockClient,
  type QlooAffinity,
  type QlooEntity
} from '@placegraph/qloo';
import type {
  AudienceResolution,
  EvidenceClaim,
  LocationContext,
  Project,
  QlooContext,
  QlooFailure
} from '@placegraph/types';
import { makeEvidenceClaim } from './claim';
import { resolveAudienceEvidence, unresolvedAudienceEvidence } from './audiences';
import { deriveCulturalPatterns, projectAllowsEventProgramming } from './cultural-patterns';

function failureFrom(err: unknown, environment: string): QlooFailure {
  if (err instanceof QlooApiError) {
    return {
      kind: err.kind,
      endpoint: err.endpoint,
      status: err.status,
      message: err.message,
      retryable: err.retryable,
      environment: err.environment || environment
    };
  }
  return {
    kind: 'upstream',
    message: String(err),
    retryable: false,
    environment
  };
}

function emptyQlooContext(
  project: Project,
  source: 'failed' | 'unavailable',
  failure: QlooFailure
): QlooContext {
  const unresolved = unresolvedAudienceEvidence(project, failure.message);
  return {
    source,
    entities: [],
    affinities: [],
    audienceAffinities: Object.fromEntries(unresolved.audiences.map((audience) => [audience.name, []])),
    crossDomain: null,
    culturalPatterns: [],
    culturalThesis: '',
    notes: [
      `Qloo ${source === 'failed' ? 'failed' : 'is unavailable'}: ${failure.message}`,
      'No cultural claims were generated. Confident cultural recommendations are blocked.'
    ],
    insufficient: true,
    failure,
    audienceResolutions: unresolved.audiences,
    evidenceClaims: unresolved.claims,
    environment: failure.environment
  };
}

function audienceAffinityMap(audiences: AudienceResolution[]): Record<string, QlooAffinity[]> {
  return Object.fromEntries(
    audiences.map((audience) => [
      audience.name,
      audience.affinities.map((affinity) => ({
        target: affinity.target,
        targetId: affinity.targetId,
        urn: affinity.urn,
        strength: affinity.strength,
        domain: affinity.domain,
        genre: affinity.genre,
        city: affinity.city,
        seedCount: affinity.seedCount
      }))
    ])
  );
}

function markMockClaims(claims: EvidenceClaim[]): EvidenceClaim[] {
  return claims.map((claim) => ({
    ...claim,
    evidenceType: 'assumption',
    source: 'assumption',
    quality: 'insufficient',
    sourceEnvironment: 'mock',
    claim: `Illustrative mock evidence only: ${claim.claim}`,
    limitations: [
      ...claim.limitations,
      'Mock evidence is illustrative and is never live Qloo evidence.'
    ]
  }));
}

export async function gatherQlooContext(
  project: Project,
  forceMock?: boolean,
  locationContext?: LocationContext
): Promise<QlooContext> {
  const loc =
    project.location.neighborhood ||
    project.location.city ||
    project.location.address ||
    project.name;

  /* ─── Explicit mock mode for tests/demo only ───────────────── */
  if (forceMock) {
    const mock = new QlooMockClient();
    const affinities = await mock.getAffinities(loc);
    const entities = await mock.searchEntities(loc);
    const audienceResult = await resolveAudienceEvidence(project, mock, {
      locationQuery: project.location.city,
      environment: 'mock'
    });
    const claims = markMockClaims(audienceResult.claims);
    const audienceAffinities = audienceAffinityMap(audienceResult.audiences);
    const { culturalPatterns, culturalThesis } = deriveCulturalPatterns(affinities, {
      allowsEventProgramming: projectAllowsEventProgramming(project)
    });

    return {
      source: 'mock',
      locationResolution: {
        resolved: false,
        scope: 'unresolved',
        candidatesTried: []
      },
      entities,
      affinities,
      audienceAffinities,
      crossDomain: null,
      culturalPatterns,
      culturalThesis,
      notes: [
        'Qloo is running in explicit mock mode. Affinities are illustrative cultural relationships, not live graph evidence.',
        'Mock evidence is insufficient for a confident recommendation.',
        ...audienceResult.notes
      ],
      insufficient: true,
      audienceResolutions: audienceResult.audiences.map((audience) => ({
        ...audience,
        status: audience.status === 'failed' ? 'failed' : 'approximate',
        quality: 'insufficient',
        limitations: [...audience.limitations, 'Mock profile only.']
      })),
      evidenceClaims: claims,
      environment: 'mock'
    };
  }

  /* ─── Missing configuration fails closed; no silent mock ────── */
  if (!hasQlooKey()) {
    return emptyQlooContext(project, 'unavailable', failureFrom(missingQlooConfigError(), 'missing'));
  }

  const client = createQlooClient();
  const environment = client.environment;
  const city = project.location.city?.trim();

  try {
    const placeClaims: EvidenceClaim[] = [];

    // 1. Find a local anchor entity. A search match proves existence only.
    const anchorQueries = unique([
      project.location.neighborhood,
      loc,
      project.location.address,
      project.location.city,
      project.name
    ]);
    let anchor: QlooEntity | undefined;
    for (const query of anchorQueries) {
      if (!query) continue;
      const found = await client.searchEntities(query, { take: 8, type: 'urn:entity:place' });
      anchor =
        found.find((entity) => entity.id && sameCity(entity.city, city)) ||
        found.find((entity) => entity.id && entity.city) ||
        found.find((entity) => entity.id);
      if (anchor?.id) break;
    }

    if (anchor) {
      placeClaims.push(
        makeEvidenceClaim({
          stage: 'place_resolution',
          claim: `Qloo returned a place search match for ${anchor.name}.`,
          evidenceType: 'qloo_search',
          source: 'qloo',
          quality: 'moderate',
          scope: { place: loc, audienceIds: [] },
          qlooRefs: [anchor.uuid, anchor.urn, anchor.id].filter(
            (value): value is string => Boolean(value)
          ),
          supporting: [anchor.name],
          limitations: ['A search match proves that the entity exists; it is not affinity evidence.'],
          interpretation: 'The place anchor exists in Qloo.',
          implication: 'Use the anchor only to request scored relationships.',
          sourceEnvironment: environment
        })
      );
    }

    // 2. Resolve the location filter once. Invalid localities return no rows.
    const candidates = locationCandidates(project, locationContext);
    let resolvedLocation: string | undefined;
    let locationResolved = false;

    if (anchor?.id) {
      for (const candidate of candidates) {
        const rows = await client.getInsights({
          filterType: 'urn:entity:place',
          entityIds: [anchor.id],
          locationQuery: candidate,
          take: 3
        });
        if (rows.length) {
          resolvedLocation = candidate;
          locationResolved = true;
          break;
        }
      }
    }

    const locationResolution = {
      query: resolvedLocation,
      resolved: locationResolved,
      scope: locationScope(project, resolvedLocation),
      candidatesTried: candidates
    };

    // 3. Resolve audience taxonomy and scored place affinities.
    const audienceResult = await resolveAudienceEvidence(project, client, {
      locationQuery: resolvedLocation,
      environment
    });
    const audienceAffinities = audienceAffinityMap(audienceResult.audiences);

    const anchorAffinities = (
      anchor?.id && locationResolved
        ? await client.getAffinities(anchor, {
            location: resolvedLocation,
            take: 15,
            domains: ['urn:entity:place']
          })
        : []
    ).filter(isUsableAffinity);

    const anchorCrossDomainAffinities: QlooAffinity[] = (anchor?.id && locationResolved
      ? await client.getAffinities(anchor, {
          location: resolvedLocation,
          take: 10,
          domains: ['urn:entity:brand', 'urn:entity:artist', 'urn:entity:movie']
        }).catch(() => [])
      : []
    ).filter(isUsableAffinity);

    // 4. Location-level and project-type entity matches are context only.
    const [locEntities, typeEntities] = await Promise.all([
      loc ? client.searchEntities(loc, { take: 8, type: 'urn:entity:place' }) : Promise.resolve([]),
      project.projectType
        ? client.searchEntities(project.projectType, { take: 5 })
        : Promise.resolve([])
    ]);

    // 5. Cross-domain relationships, only where Qloo returns a scored affinity.
    const rawCrossDomain = locationResolved
      ? await client.getCrossDomain({
          entities: unique([anchor?.name || loc, project.projectType]),
          audiences: project.audiences.map((audience) => audience.name),
          location: resolvedLocation
        })
      : null;
    const crossDomain = filterCrossDomain(rawCrossDomain);

    const entities = uniqueById([...audienceResult.audiences.flatMap((audience) => audience.seeds.map(seedToEntity)), ...locEntities, ...typeEntities, ...(anchor ? [anchor] : [])]);
    const affinities = dedupeAffinities([
      ...anchorAffinities,
      ...anchorCrossDomainAffinities,
      ...audienceResult.affinities
    ]);

    const notes: string[] = [
      'Live Qloo queries were run. Scores are cultural relationships, not demand.',
      ...audienceResult.notes
    ];

    if (locationResolved) {
      notes.push(`Qloo location resolved as "${resolvedLocation}".`);
    } else {
      notes.push(
        'Qloo could not resolve a location filter for this project; location-scoped affinities were withheld rather than substituting global evidence.'
      );
    }
    if (entities.length && !affinities.length) {
      notes.push('Qloo returned entity search matches but no scored affinities. Search matches are not affinity evidence.');
    }

    const { culturalPatterns, culturalThesis } = deriveCulturalPatterns(affinities, {
      allowsEventProgramming: projectAllowsEventProgramming(project)
    });
    if (culturalPatterns.length) {
      notes.push(
        `Cultural patterns group scored place genres into ${culturalPatterns
          .map((pattern) => pattern.label.toLowerCase())
          .join(', ')}. They are PlaceGraph inference, not additional Qloo scores.`
      );
    }

    return {
      source: 'live',
      entities,
      affinities,
      audienceAffinities,
      crossDomain,
      culturalPatterns,
      culturalThesis,
      locationResolution,
      notes,
      insufficient: affinities.length < 3,
      audienceResolutions: audienceResult.audiences,
      evidenceClaims: [...placeClaims, ...audienceResult.claims],
      environment
    };
  } catch (err) {
    const failure = failureFrom(err, environment);
    const context = emptyQlooContext(project, 'failed', failure);
    context.notes.push('Qloo failed closed; no generic cultural fallback was used.');
    return context;
  }
}

/* ─── Helpers ────────────────────────────────────────────────── */

function seedToEntity(seed: { uuid?: string; urn?: string; displayName: string; entityType?: string; domain?: string }): QlooEntity {
  return {
    id: seed.uuid || seed.urn,
    uuid: seed.uuid,
    urn: seed.urn,
    name: seed.displayName,
    type: seed.entityType,
    domain: seed.domain
  };
}

function isUsableSeed(entity: { name: string; type?: string; domain?: string }): boolean {
  const name = entity.name.toLowerCase();

  const LANDMARK_REJECT = [
    'london eye', 'big ben', 'tower bridge', 'buckingham palace',
    'westminster abbey', 'trafalgar square', 'st paul', 'tate modern',
    'natural history museum', 'british museum', 'victoria and albert',
    'madame tussauds', 'the shard', 'hyde park', 'regent street',
    'oxford street', 'covent garden', 'piccadilly', 'carnaby',
    'sky garden', 'the o2', 'wembley', 'emirates stadium',
    'eiffel tower', 'louvre', 'times square', 'central park',
    'colosseum', 'sagrada familia',
  ];
  if (LANDMARK_REJECT.some((landmark) => name.includes(landmark))) return false;

  const ONLINE_BRAND_REJECT = [
    'wowcher', 'thortful', 'matalan', 'very.co', 'very ', 'sykes',
    'not on the high street', 'notonthehighstreet', 'boux avenue',
    'hotel chocolat', 'moonpig', 'funky pigeon', 'prezzy box',
    'groupon', 'lastminute', 'trivago', 'booking.com', 'expedia',
    'amazon', 'ebay', 'etsy', 'asos', 'boohoo', 'prettylittlething',
  ];
  if (ONLINE_BRAND_REJECT.some((brand) => name.includes(brand))) return false;

  const type = (entity.type || '').toLowerCase();
  if (type.includes('country') || type.includes('nation') || type.includes('airport')) return false;

  return true;
}

function isUsableAffinity(affinity: QlooAffinity): boolean {
  return isUsableSeed({ name: affinity.target, type: affinity.domain });
}

function filterCrossDomain(crossDomain: any): any {
  if (!crossDomain || !crossDomain.results || Array.isArray(crossDomain.results)) {
    return crossDomain;
  }
  const results = crossDomain.results;
  return {
    ...crossDomain,
    results: {
      ...results,
      places: (results.places || []).filter(isUsableAffinity),
      brands: (results.brands || []).filter(isUsableAffinity),
      artists: (results.artists || []).filter(isUsableAffinity)
    }
  };
}

function unique(items: Array<string | undefined>): string[] {
  return [...new Set(items.map((s) => s?.trim()).filter((s): s is string => Boolean(s)))];
}

function sameCity(a?: string, b?: string): boolean {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

export function locationCandidates(project: Project, context?: LocationContext): string[] {
  const parts = (context?.displayName || project.location.address || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const city = project.location.city?.trim() || context?.city?.trim();
  const neighborhood = project.location.neighborhood?.trim();
  const country = parts.length >= 2 ? parts[parts.length - 1] : undefined;
  const rawState = parts.length >= 3 ? parts[parts.length - 2] : undefined;
  const state = rawState && !/^[A-Z]{1,2}\d|^\d{5}(-\d{4})?$|^[A-Z]{2}\s+\d{5}/i.test(rawState) ? rawState : undefined;

  const candidates = [
    neighborhood && city ? `${neighborhood}, ${city}` : undefined,
    city && state && country && state.toLowerCase() !== city.toLowerCase()
      ? `${city}, ${state}, ${country}`
      : undefined,
    city && country ? `${city}, ${country}` : undefined,
    city
  ].filter((candidate): candidate is string => Boolean(candidate));

  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(candidate);
  }
  return out;
}

export function locationScope(
  project: Project,
  resolvedLocation?: string
): 'neighborhood' | 'city' | 'region' | 'country' | 'global' | 'unresolved' {
  if (!resolvedLocation) return 'unresolved';
  const value = resolvedLocation.toLowerCase().trim();
  const neighborhood = project.location.neighborhood?.trim().toLowerCase();
  const city = project.location.city?.trim().toLowerCase();
  const startsWith = (candidate: string) =>
    value === candidate || value.startsWith(`${candidate},`) || value.startsWith(`${candidate} `);
  if (neighborhood && startsWith(neighborhood)) return 'neighborhood';
  if (city && startsWith(city)) return 'city';
  if (/\b(greater|metropolitan|region|regional|county|state|province)\b/.test(value)) {
    return 'region';
  }
  if (city && value.includes(city)) return 'region';
  return 'region';
}

function uniqueById(items: QlooEntity[]): QlooEntity[] {
  const seen = new Set<string>();
  const out: QlooEntity[] = [];
  for (const entity of items) {
    const key = normalizeQlooId(entity.urn || entity.uuid || entity.id) || entity.name;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entity);
  }
  return out.slice(0, 40);
}

function dedupeAffinities(items: QlooAffinity[]): QlooAffinity[] {
  const map = new Map<string, QlooAffinity>();
  for (const item of items) {
    const key = normalizeQlooId(item.urn || item.targetId) || item.target;
    const existing = map.get(key);
    if (!existing || item.strength > existing.strength) {
      map.set(key, item);
    }
  }
  return [...map.values()].slice(0, 50);
}
