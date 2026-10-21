import { createQlooClient, hasQlooKey, QlooMockClient, type QlooAffinity, type QlooEntity } from '@placegraph/qloo';
import type { Project, QlooContext } from '@placegraph/types';

/**
 * Gather Qloo cultural context.
 *
 * Phase 10 improvement: runs per-audience queries in parallel so that each
 * audience has its own affinity profile. The merged `affinities` list
 * de-duplicates entries (keeping the highest-score one). A new
 * `audienceAffinities` map is returned keyed by audience name.
 */
export async function gatherQlooContext(project: Project, forceMock?: boolean): Promise<QlooContext> {
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

    // Build per-audience mock affinities (vary slightly per audience)
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

  /* ─── Live mode — per-audience queries ──────────────────────── */
  const client = createQlooClient();

  // 1. Per-audience: search → seed entity → affinities (parallel)
  const audienceAffinities: Record<string, QlooAffinity[]> = {};
  const allEntities: QlooEntity[]  = [];
  const allAffinities: QlooAffinity[] = [];

  const audienceResults = await Promise.all(
    project.audiences.map(async (aud) => {
      try {
        const searchRes = await client.searchEntities(aud.name, { limit: 5 });
        const seed      = searchRes[0] || { name: aud.name };
        const affs      = await client.getAffinities(seed, {
          location: project.location.city || loc,
          limit: 15,
          domains: [
            'urn:entity:place',
            'urn:entity:brand',
            'urn:entity:artist',
            'urn:entity:movie',
          ],
        });
        return { audienceName: aud.name, entities: searchRes, affinities: affs };
      } catch {
        return { audienceName: aud.name, entities: [] as QlooEntity[], affinities: [] as QlooAffinity[] };
      }
    }),
  );

  for (const result of audienceResults) {
    audienceAffinities[result.audienceName] = result.affinities;
    allEntities.push(...result.entities);
    allAffinities.push(...result.affinities);
  }

  // 2. Location-level queries
  const [locEntities, typeEntities] = await Promise.all([
    loc ? client.searchEntities(loc, { limit: 8, type: 'urn:entity:place' }) : Promise.resolve([]),
    client.searchEntities(project.projectType, { limit: 5 }),
  ]);
  allEntities.push(...locEntities, ...typeEntities);

  // 3. Cross-domain
  const crossDomain = await client.getCrossDomain({
    entities:  unique([loc, project.projectType]),
    audiences: project.audiences.map((a) => a.name),
    location:  project.location.city || loc,
  }).catch(() => null);

  // 4. Merge de-duplicate
  const entities    = uniqueById(allEntities);
  const affinities  = dedupeAffinities(allAffinities);

  const liveEnough  = affinities.length > 0 || entities.length > 0;
  if (!liveEnough) {
    const mockAff = await mock.getAffinities(loc);
    const mockEnt = await mock.searchEntities(loc);
    return {
      source:             'mixed',
      entities:           mockEnt,
      affinities:         mockAff,
      audienceAffinities,
      crossDomain,
      notes: [
        'Live Qloo returned little usable evidence for this query. ' +
        'Mock affinities were supplemented and must be treated as insufficient.',
      ],
      insufficient: true,
    };
  }

  return {
    source:             'live',
    entities,
    affinities,
    audienceAffinities,
    crossDomain,
    notes: ['Live Qloo queries were run per-audience. Scores are cultural relationships, not demand.'],
    insufficient: affinities.length < 3,
  };
}

/* ─── Helpers ────────────────────────────────────────────────── */

function unique(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
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
    const key = (item as any).entityId || (item as any).name || JSON.stringify(item).slice(0, 64);
    const existing = map.get(key);
    // Keep the entry with the higher score
    if (!existing || ((item as any).score ?? 0) > ((existing as any).score ?? 0)) {
      map.set(key, item);
    }
  }
  return [...map.values()].slice(0, 50);
}
