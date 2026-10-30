import { createQlooClient, hasQlooKey, QlooMockClient, type QlooAffinity, type QlooEntity } from '@placegraph/qloo';
import type { LocationContext, Project, QlooContext } from '@placegraph/types';
import { deriveCulturalPatterns, projectAllowsEventProgramming } from './cultural-patterns';

/**
 * Gather Qloo cultural context.
 *
 * Qloo's location filter rejects some bare place names (for example "Nsukka")
 * even when the same locality resolves as "Nsukka, Nigeria". We therefore
 * resolve a usable location label once, then reuse it for every affinity query.
 *
 * Search results are deliberately kept separate from affinity evidence. A Qloo
 * search match means "this entity exists"; it does not mean "this audience has
 * an affinity with it". Only rows with a numeric affinity score become evidence.
 */
export async function gatherQlooContext(
  project: Project,
  forceMock?: boolean,
  locationContext?: LocationContext
): Promise<QlooContext> {
  const loc =
    project.location.neighborhood ||
    project.location.city         ||
    project.location.address      ||
    project.name;

  const useLive = hasQlooKey() && forceMock !== true;
  const mock    = new QlooMockClient();

  /* ─── Mock mode ─────────────────────────────────────────────── */
  if (!useLive) {
    const affinities  = await mock.getAffinities(loc);
    const entities    = await mock.searchEntities(loc);
    const crossDomain = await mock.getCrossDomain({
      entities:  [loc, project.projectType],
      audiences: project.audiences.map((a) => a.name),
    });

    const audienceAffinities: Record<string, QlooAffinity[]> = {};
    for (const aud of project.audiences) {
      audienceAffinities[aud.name] = await mock.getAffinities(`${aud.name} ${loc}`);
    }

    const { culturalPatterns, culturalThesis } = deriveCulturalPatterns(affinities, {
      allowsEventProgramming: projectAllowsEventProgramming(project)
    });

    return {
      source: 'mock',
      entities,
      affinities,
      audienceAffinities,
      crossDomain,
      culturalPatterns,
      culturalThesis,
      notes: [
        'Qloo is running in mock mode (no API key or mock forced). ' +
        'Affinities are illustrative cultural relationships, not live graph evidence.',
        'Cultural patterns are inferred from scored place genres; they are not additional Qloo scores.',
      ],
      insufficient: true,
    };
  }

  /* ─── Live mode ──────────────────────────────────────────────── */
  const client = createQlooClient();
  const city = project.location.city?.trim();

  // 1. Find a local anchor entity. Place search is the most reliable signal
  //    that Qloo knows this locality at all.
  const anchorQueries = unique([project.location.city, loc, project.location.address, project.name]);
  let anchor: QlooEntity | undefined;
  for (const query of anchorQueries) {
    if (!query) continue;
    const found = await client.searchEntities(query, { limit: 8, type: 'urn:entity:place' });
    anchor =
      found.find((e) => e.id && sameCity(e.city, city)) ||
      found.find((e) => e.id && e.city) ||
      found.find((e) => e.id);
    if (anchor?.id) break;
  }

  // 2. Resolve the location filter once. Invalid localities return no rows, so
  //    probe candidates with a single place query before fanning out.
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

  // 3. Per-audience: generate multiple search queries, collect usable seed
  //    entities, then intersect their place affinities. A single entity is a
  //    thin proxy for an audience; multiple seeds reveal what is consistent
  //    across cultural contexts.
  const audienceAffinities: Record<string, QlooAffinity[]> = {};
  const allEntities: QlooEntity[]  = [];
  const allAffinities: QlooAffinity[] = [];
  const notes: string[] = ['Live Qloo queries were run per audience. Scores are cultural relationships, not demand.'];

  const anchorAffinities = (anchor?.id && locationResolved
    ? await client.getAffinities(anchor, {
        location: resolvedLocation,
        limit: 15,
        domains: ['urn:entity:place']
      })
    : []).filter(isUsableAffinity);

  // Fetch cross-domain affinities (brand, artist, film) for the anchor.
  // These reveal the broader taste profile: what brands, musicians, and films
  // resonate with people who frequent this location cluster.
  const anchorCrossDomainAffinities: QlooAffinity[] = (anchor?.id
    ? await client.getAffinities(anchor, {
        limit: 10,
        domains: ['urn:entity:brand', 'urn:entity:artist', 'urn:entity:film']
      }).catch(() => [])
    : []).filter(isUsableAffinity);

  const audienceResults = await Promise.all(
    project.audiences.map(async (aud) => {
      try {
        const queries = unique([
          aud.name,
          aud.description
            ? aud.description.trim().split(/\s+/).slice(0, 4).join(' ')
            : undefined,
          `${aud.name} ${project.location.neighborhood || project.location.city || ''}`.trim()
        ]);

        const candidateBatches = await Promise.all(
          queries.map((query) => client.searchEntities(query, { limit: 3 }))
        );
        const candidates = uniqueById(candidateBatches.flat())
          .filter((entity) => entity.id && isUsableSeed(entity))
          .slice(0, 3);

        const affinityBatches: QlooAffinity[][] = [];
        if (locationResolved) {
          for (const seed of candidates) {
            const affs = await client
              .getAffinities(seed, {
                location: resolvedLocation,
                limit: 15,
                domains: ['urn:entity:place']
              })
              .catch(() => []);
            affinityBatches.push(affs.filter(isUsableAffinity));
          }
        }

        return {
          audienceName: aud.name,
          seedNames: candidates.map((seed) => seed.name),
          entities: candidateBatches.flat(),
          affinities: buildAudienceAffinityPool(affinityBatches)
        };
      } catch {
        return {
          audienceName: aud.name,
          seedNames: [] as string[],
          entities: [] as QlooEntity[],
          affinities: [] as QlooAffinity[]
        };
      }
    })
  );

  let strongProfiles = 0;
  let approximateProfiles = 0;
  let unresolvedProfiles = 0;

  for (const result of audienceResults) {
    audienceAffinities[result.audienceName] = result.affinities;
    if (result.seedNames.length >= 2) {
      strongProfiles += 1;
      notes.push(
        `Audience "${result.audienceName}": resolved from ${result.seedNames.length} seed entities (${result.seedNames.join(', ')}). Affinities reflect intersection of ${result.seedNames.length === 2 ? 'both' : 'all'} profiles.`
      );
    } else if (result.seedNames.length === 1) {
      approximateProfiles += 1;
      notes.push(
        `Audience "${result.audienceName}": resolved from 1 seed entity (${result.seedNames[0]}). Single-seed profile — treat as approximate.`
      );
    } else {
      unresolvedProfiles += 1;
      notes.push(
        `Audience "${result.audienceName}": no locally-relevant seed found. Audience profile omitted from cultural evidence.`
      );
    }
    allEntities.push(...result.entities);
    allAffinities.push(...result.affinities);
  }

  if (project.audiences.length) {
    notes.push(
      `Audience profiling: ${project.audiences.length} audiences, ${strongProfiles} resolved with multiple seeds (strong), ${approximateProfiles} resolved with single seed (approximate), ${unresolvedProfiles} unresolved.`
    );
  }

  // 4. Location-level and project-type entity matches. These are context only,
  //    never presented as affinity evidence.
  const [locEntities, typeEntities] = await Promise.all([
    loc ? client.searchEntities(loc, { limit: 8, type: 'urn:entity:place' }) : Promise.resolve([]),
    client.searchEntities(project.projectType, { limit: 5 })
  ]);
  allEntities.push(...locEntities, ...typeEntities);

  // 5. Cross-domain relationships, only where Qloo returns a scored affinity.
  const rawCrossDomain = locationResolved
    ? await client.getCrossDomain({
        entities: unique([anchor?.name || loc, project.projectType]),
        audiences: project.audiences.map((a) => a.name),
        location: resolvedLocation
      }).catch(() => null)
    : null;
  const crossDomain = filterCrossDomain(rawCrossDomain);

  const entities   = uniqueById(allEntities);
  const affinities = dedupeAffinities([...anchorAffinities, ...anchorCrossDomainAffinities, ...allAffinities]);

  if (locationResolved) {
    notes.push(`Qloo location resolved as "${resolvedLocation}".`);
  } else {
    notes.push(
      'Qloo could not resolve a location filter for this project; affinity evidence is global rather than local.'
    );
  }
  if (entities.length && !affinities.length) {
    notes.push(
      'Qloo returned entity search matches but no scored affinities. Search matches are not affinity evidence.'
    );
  }

  const { culturalPatterns, culturalThesis } = deriveCulturalPatterns(affinities, {
    allowsEventProgramming: projectAllowsEventProgramming(project)
  });
  if (culturalPatterns.length) {
    notes.push(
      `Cultural patterns group scored place genres into ${culturalPatterns
        .map((pattern) => pattern.label.toLowerCase())
        .join(', ')}. They are inferred from affinities, not additional Qloo scores.`
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
    notes,
    insufficient: affinities.length < 3
  };
}

/* ─── Helpers ────────────────────────────────────────────────── */

function isUsableSeed(entity: { name: string; type?: string; domain?: string }): boolean {
  const name = entity.name.toLowerCase();

  // Reject major tourist landmarks — they represent tourism patterns not local culture
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

  // Reject online-only / national brands — they have no geographic cultural specificity
  const ONLINE_BRAND_REJECT = [
    'wowcher', 'thortful', 'matalan', 'very.co', 'very ', 'sykes',
    'not on the high street', 'notonthehighstreet', 'boux avenue',
    'hotel chocolat', 'moonpig', 'funky pigeon', 'prezzy box',
    'groupon', 'lastminute', 'trivago', 'booking.com', 'expedia',
    'amazon', 'ebay', 'etsy', 'asos', 'boohoo', 'prettylittlething',
  ];
  if (ONLINE_BRAND_REJECT.some((brand) => name.includes(brand))) return false;

  // Reject entities whose type is clearly national/global rather than local
  const type = (entity.type || '').toLowerCase();
  if (type.includes('country') || type.includes('nation') || type.includes('airport')) return false;

  return true;
}

function isUsableAffinity(affinity: QlooAffinity): boolean {
  return isUsableSeed({ name: affinity.target, type: affinity.domain });
}

function buildAudienceAffinityPool(
  affinityBatches: QlooAffinity[][]
): QlooAffinity[] {
  const scores = new Map<string, { affinity: QlooAffinity; count: number; totalStrength: number }>();

  for (const batch of affinityBatches) {
    for (const aff of batch) {
      if (!aff?.target || typeof aff.strength !== 'number') continue;
      const key = aff.target.toLowerCase();
      const existing = scores.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalStrength += aff.strength;
      } else {
        scores.set(key, { affinity: aff, count: 1, totalStrength: aff.strength });
      }
    }
  }

  return [...scores.values()]
    .sort((a, b) => {
      // Prioritise entities that appear across multiple seeds — these are
      // the culturally consistent signals, not single-seed noise
      if (b.count !== a.count) return b.count - a.count;
      return b.totalStrength - a.totalStrength;
    })
    .map((entry) => ({
      ...entry.affinity,
      // Boost strength for entities that appeared in multiple seed queries
      strength: entry.count > 1
        ? Math.min(1, entry.affinity.strength * (1 + (entry.count - 1) * 0.05))
        : entry.affinity.strength,
    }));
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

function locationCandidates(project: Project, context?: LocationContext): Array<string | undefined> {
  const parts = (context?.displayName || project.location.address || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const city = project.location.city?.trim();
  const country = parts.length >= 2 ? parts[parts.length - 1] : undefined;
  const state = parts.length >= 3 ? parts[parts.length - 2] : undefined;

  const candidates = [
    city && country ? `${city}, ${country}` : undefined,
    city && state && country ? `${city}, ${state}, ${country}` : undefined,
    city,
    state && country ? `${state}, ${country}` : undefined,
    country,
    undefined
  ];

  const seen = new Set<string>();
  const out: Array<string | undefined> = [];
  for (const candidate of candidates) {
    const key = candidate?.toLowerCase() ?? '__global__';
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(candidate);
  }
  return out;
}

function uniqueById(items: QlooEntity[]): QlooEntity[] {
  const seen = new Set<string>();
  const out: QlooEntity[] = [];
  for (const e of items) {
    const key = e.id || e.name;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out.slice(0, 40);
}

function dedupeAffinities(items: QlooAffinity[]): QlooAffinity[] {
  const map = new Map<string, QlooAffinity>();
  for (const item of items) {
    const key = item.targetId || item.target;
    const existing = map.get(key);
    if (!existing || item.strength > existing.strength) {
      map.set(key, item);
    }
  }
  return [...map.values()].slice(0, 50);
}
