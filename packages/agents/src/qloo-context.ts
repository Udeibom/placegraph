import { createQlooClient, hasQlooKey, QlooMockClient, type QlooAffinity, type QlooEntity } from '@placegraph/qloo';
import type { LocationContext, Project, QlooContext } from '@placegraph/types';

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

    return {
      source: 'mock',
      entities,
      affinities,
      audienceAffinities,
      crossDomain,
      notes: [
        'Qloo is running in mock mode (no API key or mock forced). ' +
        'Affinities are illustrative cultural relationships, not live graph evidence.',
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

  // 3. Per-audience: choose a locally relevant seed, then query place
  //    affinities. If no local audience match exists, use the local anchor
  //    rather than an unrelated global search hit.
  const audienceAffinities: Record<string, QlooAffinity[]> = {};
  const audienceSeedNames: string[] = [];
  const allEntities: QlooEntity[]  = [];
  const allAffinities: QlooAffinity[] = [];

  const anchorAffinities = anchor?.id && locationResolved
    ? await client.getAffinities(anchor, {
        location: resolvedLocation,
        limit: 15,
        domains: ['urn:entity:place']
      })
    : [];

  const audienceResults = await Promise.all(
    project.audiences.map(async (aud) => {
      try {
        const searchRes = await client.searchEntities(aud.name, { limit: 10 });
        const tokens = audienceTokens(aud.name, [city, project.location.neighborhood]);
        const localMatch = searchRes.find(
          (e) => e.id && sameCity(e.city, city) && nameMatches(e.name, tokens)
        );
        const seed = localMatch || anchor;
        if (!seed?.id) {
          return { audienceName: aud.name, seedName: '', entities: searchRes, affinities: [] as QlooAffinity[] };
        }

        let affs = locationResolved
          ? await client.getAffinities(seed, {
              location: resolvedLocation,
              limit: 15,
              domains: ['urn:entity:place']
            })
          : [];

        // If an audience-specific seed produced nothing, fall back to the
        // place anchor instead of silently reporting an empty profile.
        if (!affs.length && anchor?.id && seed.id !== anchor.id && locationResolved) {
          affs = anchorAffinities;
        }

        return {
          audienceName: aud.name,
          seedName: seed.name,
          entities: searchRes,
          affinities: affs
        };
      } catch {
        return {
          audienceName: aud.name,
          seedName: '',
          entities: [] as QlooEntity[],
          affinities: [] as QlooAffinity[]
        };
      }
    })
  );

  for (const result of audienceResults) {
    audienceAffinities[result.audienceName] = result.affinities;
    if (result.seedName) audienceSeedNames.push(`${result.audienceName} → ${result.seedName}`);
    allEntities.push(...result.entities);
    allAffinities.push(...result.affinities);
  }

  // 4. Location-level and project-type entity matches. These are context only,
  //    never presented as affinity evidence.
  const [locEntities, typeEntities] = await Promise.all([
    loc ? client.searchEntities(loc, { limit: 8, type: 'urn:entity:place' }) : Promise.resolve([]),
    client.searchEntities(project.projectType, { limit: 5 })
  ]);
  allEntities.push(...locEntities, ...typeEntities);

  // 5. Cross-domain relationships, only where Qloo returns a scored affinity.
  const crossDomain = locationResolved
    ? await client.getCrossDomain({
        entities: unique([anchor?.name || loc, project.projectType]),
        audiences: project.audiences.map((a) => a.name),
        location: resolvedLocation
      }).catch(() => null)
    : null;

  const entities   = uniqueById(allEntities);
  const affinities = dedupeAffinities([...anchorAffinities, ...allAffinities]);
  const notes: string[] = ['Live Qloo queries were run per audience. Scores are cultural relationships, not demand.'];

  if (locationResolved) {
    notes.push(`Qloo location resolved as "${resolvedLocation}".`);
  } else {
    notes.push(
      'Qloo could not resolve a location filter for this project; affinity evidence is global rather than local.'
    );
  }
  if (audienceSeedNames.length) {
    notes.push(`Audience seeds: ${audienceSeedNames.join('; ')}.`);
  }
  if (entities.length && !affinities.length) {
    notes.push(
      'Qloo returned entity search matches but no scored affinities. Search matches are not affinity evidence.'
    );
  }

  return {
    source: 'live',
    entities,
    affinities,
    audienceAffinities,
    crossDomain,
    notes,
    insufficient: affinities.length < 3
  };
}

/* ─── Helpers ────────────────────────────────────────────────── */

function unique(items: Array<string | undefined>): string[] {
  return [...new Set(items.map((s) => s?.trim()).filter((s): s is string => Boolean(s)))];
}

function sameCity(a?: string, b?: string): boolean {
  return Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

const AUDIENCE_STOPWORDS = new Set([
  'and', 'the', 'from', 'across', 'with', 'for', 'into', 'people', 'local',
  'visitors', 'researchers', 'professionals', 'residents', 'workers', 'aware',
  'postgraduate', 'their', 'this', 'that', 'who', 'are', 'nearby', 'area'
]);

function audienceTokens(name: string, ignored: Array<string | undefined> = []): string[] {
  const ignore = new Set(
    ignored.flatMap((value) => (value || '').toLowerCase().split(/[^a-z0-9]+/)).filter(Boolean)
  );
  return [...new Set(
    name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !AUDIENCE_STOPWORDS.has(token) && !ignore.has(token))
  )];
}

function nameMatches(name: string, tokens: string[]): boolean {
  if (!tokens.length) return false;
  const haystack = name.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
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
