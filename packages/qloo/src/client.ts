export interface QlooConfig {
  baseUrl: string;
  apiKey: string;
}

export interface QlooEntity {
  id?: string;
  name: string;
  type?: string;
  domain?: string;
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
}

export class QlooClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: QlooConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async fetch<T>(path: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Qloo API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async searchEntities(query: string, opts: QlooRequestOptions = {}): Promise<QlooEntity[]> {
    try {
      const data = await this.fetch<any>('/entities/search', {
        query,
        limit: opts.limit || 10,
        domains: opts.domains
      });
      return data.results || data.entities || [];
    } catch (err) {
      console.warn('Qloo searchEntities failed, returning empty:', err);
      return [];
    }
  }

  async getAffinities(entity: string | { id?: string; name: string }, opts: QlooRequestOptions = {}): Promise<QlooAffinity[]> {
    try {
      const entityName = typeof entity === 'string' ? entity : entity.name;
      const data = await this.fetch<any>('/affinities', {
        entity: entityName,
        limit: opts.limit || 20,
        domains: opts.domains
      });
      return data.results || data.affinities || [];
    } catch (err) {
      console.warn('Qloo getAffinities failed, returning empty:', err);
      return [];
    }
  }

  async getCrossDomain(context: { entities: string[]; audiences?: string[] }, opts: QlooRequestOptions = {}): Promise<any> {
    try {
      const data = await this.fetch<any>('/cross-domain', {
        entities: context.entities,
        audiences: context.audiences,
        limit: opts.limit || 30,
        domains: opts.domains
      });
      return data;
    } catch (err) {
      console.warn('Qloo getCrossDomain failed, returning empty:', err);
      return { results: [] };
    }
  }
}

export function createQlooClient(): QlooClient {
  return new QlooClient({
    baseUrl: process.env.QLOO_API_BASE_URL || 'https://hackathon.api.qloo.com',
    apiKey: process.env.QLOO_API_KEY || ''
  });
}
