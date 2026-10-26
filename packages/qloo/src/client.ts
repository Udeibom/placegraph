export interface QlooConfig {
  baseUrl: string;
  apiKey: string;
}

export interface QlooEntity {
  id?: string;
  name: string;
  type?: string;
  domain?: string;
  subtype?: string;
  city?: string;
  country?: string;
  popularity?: number;
}

export interface QlooAffinity {
  target: string;
  targetId?: string;
  strength: number;
  domain?: string;
  relation?: string;
}

export interface QlooRequestOptions {
  limit?: number;
  domains?: string[];
  type?: string;
  location?: string;
}

function entityName(raw: any): string {
  return raw?.name || raw?.properties?.name || raw?.title || 'Unknown';
}

function entityId(raw: any): string | undefined {
  return raw?.entity_id || raw?.id || raw?.uuid;
}

function affinityScore(raw: any): number | undefined {
  const q = raw?.query?.affinity ?? raw?.affinity ?? raw?.score;
  return typeof q === 'number' && Number.isFinite(q) ? q : undefined;
}

function domainFromType(type?: string): string {
  if (!type) return 'general';
  if (type.includes('place') || type.includes('destination')) return 'place';
  if (type.includes('brand')) return 'brand';
  if (type.includes('artist') || type.includes('music')) return 'music';
  if (type.includes('movie') || type.includes('film')) return 'film';
  if (type.includes('podcast')) return 'entertainment';
  if (type.includes('fashion')) return 'fashion';
  if (type.includes('tag')) return 'tag';
  return type.replace('urn:entity:', '') || 'general';
}

export class QlooClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: QlooConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private headers() {
    return {
      Accept: 'application/json',
      'X-Api-Key': this.apiKey
    };
  }

  private async get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === '') continue;
      url.searchParams.set(k, String(v));
    }
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers(),
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Qloo API error ${res.status}: ${text.slice(0, 300)}`);
    }
    return res.json();
  }

  async searchEntities(query: string, opts: QlooRequestOptions = {}): Promise<QlooEntity[]> {
    try {
      const data = await this.get<any>('/search', {
        query,
        limit: opts.limit || 10,
        type: opts.type
      });
      const results = data.results || data.entities || data.data || [];
      return (Array.isArray(results) ? results : []).map((r: any) => ({
        id: entityId(r),
        name: entityName(r),
        type: r.subtype || r.type,
        domain: domainFromType(r.subtype || r.type),
        city: r?.properties?.geocode?.city,
        country: r?.properties?.geocode?.country,
        popularity: typeof r?.popularity === 'number' ? r.popularity : undefined
      }));
    } catch (err) {
      console.warn('Qloo searchEntities failed:', err);
      return [];
    }
  }

  async getInsights(opts: {
    filterType: string;
    entityIds?: string[];
    locationQuery?: string;
    take?: number;
  }): Promise<any[]> {
    try {
      const data = await this.get<any>('/v2/insights', {
        'filter.type': opts.filterType,
        'signal.interests.entities': opts.entityIds?.filter(Boolean).join(','),
        'filter.location.query': opts.locationQuery,
        take: opts.take || 15
      });
      if (Array.isArray(data?.results)) return data.results;
      if (Array.isArray(data?.results?.entities)) return data.results.entities;
      if (Array.isArray(data?.entities)) return data.entities;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (err) {
      console.warn('Qloo getInsights failed:', err);
      return [];
    }
  }

  async getAffinities(entity: string | { id?: string; name: string }, opts: QlooRequestOptions = {}): Promise<QlooAffinity[]> {
    try {
      const entityNameOrObj = typeof entity === 'string' ? entity : entity.name;
      const id = typeof entity === 'string' ? undefined : entity.id;
      let entityId = id;
      if (!entityId) {
        const found = await this.searchEntities(entityNameOrObj, { limit: 3, type: opts.type });
        entityId = found[0]?.id;
      }
      if (!entityId) return [];

      const types = opts.domains?.length
        ? opts.domains
        : ['urn:entity:place', 'urn:entity:brand', 'urn:entity:artist'];

      const batches = await Promise.all(
        types.map((filterType) =>
          this.getInsights({
            filterType,
            entityIds: [entityId!],
            locationQuery: opts.location,
            take: opts.limit || 12
          })
        )
      );

      const affinities: QlooAffinity[] = [];
      for (let i = 0; i < batches.length; i++) {
        const batch = Array.isArray(batches[i]) ? batches[i] : [];
        for (const row of batch) {
          const strength = affinityScore(row);
          if (strength === undefined) continue;
          affinities.push({
            target: entityName(row),
            targetId: entityIdFromRow(row),
            strength,
            domain: domainFromType(types[i]),
            relation: 'affinity'
          });
        }
      }
      return affinities;
    } catch (err) {
      console.warn('Qloo getAffinities failed:', err);
      return [];
    }
  }

  async getCrossDomain(
    context: { entities: string[]; audiences?: string[]; location?: string },
    opts: QlooRequestOptions = {}
  ): Promise<any> {
    try {
      const searches = await Promise.all(
        context.entities.slice(0, 4).map((q) => this.searchEntities(q, { limit: 2 }))
      );
      const ids = searches.flat().map((e) => e.id).filter(Boolean) as string[];
      if (!ids.length) return { results: [], source: 'live' };

      const [places, brands, artists] = await Promise.all([
        this.getInsights({
          filterType: 'urn:entity:place',
          entityIds: ids.slice(0, 3),
          locationQuery: context.location,
          take: opts.limit || 15
        }),
        this.getInsights({
          filterType: 'urn:entity:brand',
          entityIds: ids.slice(0, 3),
          take: 10
        }),
        this.getInsights({
          filterType: 'urn:entity:artist',
          entityIds: ids.slice(0, 3),
          take: 10
        })
      ]);

      return {
        results: {
          places: scoredRows(places, 'place'),
          brands: scoredRows(brands, 'brand'),
          artists: scoredRows(artists, 'music')
        },
        entityIds: ids,
        source: 'live'
      };
    } catch (err) {
      console.warn('Qloo getCrossDomain failed:', err);
      return { results: [], source: 'live', error: String(err) };
    }
  }
}

function entityIdFromRow(raw: any): string | undefined {
  return raw?.entity_id || raw?.id;
}

export function createQlooClient(): QlooClient {
  return new QlooClient({
    baseUrl: process.env.QLOO_API_BASE_URL || 'https://hackathon.api.qloo.com',
    apiKey: process.env.QLOO_API_KEY || ''
  });
}

export function hasQlooKey(): boolean {
  return Boolean(process.env.QLOO_API_KEY);
}


function scoredRows(rows: any[], domain: string): QlooAffinity[] {
  return (Array.isArray(rows) ? rows : []).flatMap((row) => {
    const strength = affinityScore(row);
    if (strength === undefined) return [];
    return [{
      target: entityName(row),
      targetId: entityIdFromRow(row),
      strength,
      domain,
      relation: 'affinity'
    }];
  });
}
