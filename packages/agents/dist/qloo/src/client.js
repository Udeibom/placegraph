export class QlooClient {
    baseUrl;
    apiKey;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.apiKey = config.apiKey;
    }
    async fetch(path, body) {
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
    async searchEntities(query, opts = {}) {
        try {
            const data = await this.fetch('/entities/search', {
                query,
                limit: opts.limit || 10,
                domains: opts.domains
            });
            return data.results || data.entities || [];
        }
        catch (err) {
            console.warn('Qloo searchEntities failed, returning empty:', err);
            return [];
        }
    }
    async getAffinities(entity, opts = {}) {
        try {
            const entityName = typeof entity === 'string' ? entity : entity.name;
            const data = await this.fetch('/affinities', {
                entity: entityName,
                limit: opts.limit || 20,
                domains: opts.domains
            });
            return data.results || data.affinities || [];
        }
        catch (err) {
            console.warn('Qloo getAffinities failed, returning empty:', err);
            return [];
        }
    }
    async getCrossDomain(context, opts = {}) {
        try {
            const data = await this.fetch('/cross-domain', {
                entities: context.entities,
                audiences: context.audiences,
                limit: opts.limit || 30,
                domains: opts.domains
            });
            return data;
        }
        catch (err) {
            console.warn('Qloo getCrossDomain failed, returning empty:', err);
            return { results: [] };
        }
    }
}
export function createQlooClient() {
    return new QlooClient({
        baseUrl: process.env.QLOO_API_BASE_URL || 'https://hackathon.api.qloo.com',
        apiKey: process.env.QLOO_API_KEY || ''
    });
}
