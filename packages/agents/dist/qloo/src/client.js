export class QlooApiError extends Error {
    kind;
    endpoint;
    status;
    retryable;
    environment;
    constructor(opts) {
        super(opts.message);
        this.name = 'QlooApiError';
        this.kind = opts.kind;
        this.endpoint = opts.endpoint;
        this.status = opts.status;
        this.retryable = opts.retryable ?? false;
        this.environment = opts.environment;
    }
}
const SEARCH_TYPES = new Set([
    'urn:entity:actor',
    'urn:entity:artist',
    'urn:entity:brand',
    'urn:entity:movie',
    'urn:entity:person',
    'urn:entity:place',
    'urn:entity:podcast',
    'urn:entity:tv_show'
]);
const TRENDING_TYPES = new Set([
    'urn:entity:actor',
    'urn:entity:artist',
    'urn:entity:brand',
    'urn:entity:movie',
    'urn:entity:person',
    'urn:entity:podcast',
    'urn:entity:tv_show'
]);
function entityName(raw) {
    return raw?.name || raw?.properties?.name || raw?.title || 'Unknown';
}
function entityId(raw) {
    return raw?.entity_id || raw?.id || raw?.uuid;
}
function entityUrn(raw) {
    const id = raw?.id;
    return typeof id === 'string' && id.startsWith('urn:') ? id : undefined;
}
function affinityScore(raw) {
    const q = raw?.query?.affinity;
    return typeof q === 'number' && Number.isFinite(q) ? q : undefined;
}
function genreFromRow(raw) {
    const id = raw?.properties?.primary_genre?.id ||
        raw?.properties?.genre?.id ||
        raw?.primary_genre?.id ||
        raw?.genre?.id;
    if (typeof id !== 'string')
        return undefined;
    return id.replace(/^urn:tag:genre:place:/, '').replace(/^urn:tag:genre:/, '') || undefined;
}
function descriptionFromRow(raw) {
    const value = raw?.properties?.description ?? raw?.description;
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
function cityFromRow(raw) {
    const value = raw?.properties?.geocode?.city ?? raw?.geocode?.city;
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
function keywordsFromRow(raw) {
    const rows = raw?.properties?.keywords ?? raw?.keywords;
    if (!Array.isArray(rows))
        return [];
    return rows
        .map((k) => (typeof k === 'string' ? k : k?.name))
        .filter((k) => typeof k === 'string' && Boolean(k.trim()))
        .map((k) => k.trim())
        .slice(0, 8);
}
function domainFromType(type) {
    if (!type)
        return 'general';
    if (type.includes('place') || type.includes('destination'))
        return 'place';
    if (type.includes('brand'))
        return 'brand';
    if (type.includes('artist') || type.includes('music'))
        return 'music';
    if (type.includes('movie') || type.includes('film'))
        return 'film';
    if (type.includes('podcast'))
        return 'entertainment';
    if (type.includes('fashion'))
        return 'fashion';
    if (type.includes('tag'))
        return 'tag';
    return type.replace('urn:entity:', '') || 'general';
}
function normalizeId(id) {
    if (!id)
        return undefined;
    return id.startsWith('urn:') ? id : id.toLowerCase();
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function jitterMs(ms, range = 300) {
    return Math.max(200, ms + Math.floor(Math.random() * range * 2) - range);
}
function parseRateLimitReset(headers) {
    for (const name of ['retry-after', 'x-ratelimit-reset-requests', 'x-ratelimit-reset-tokens']) {
        const raw = headers.get(name);
        if (!raw)
            continue;
        const seconds = parseFloat(raw);
        if (Number.isFinite(seconds) && seconds >= 0)
            return Math.ceil(seconds * 1000);
        const date = Date.parse(raw);
        if (!isNaN(date))
            return Math.max(0, date - Date.now());
    }
    return null;
}
function qlooEnvironment(baseUrl) {
    try {
        const host = new URL(baseUrl).host;
        if (host === 'api.qloo.com')
            return 'production';
        if (host === 'hackathon.api.qloo.com')
            return 'hackathon';
        return host;
    }
    catch {
        return 'invalid';
    }
}
function classifyStatus(status) {
    if (status === 401)
        return { kind: 'authentication', retryable: false };
    if (status === 403)
        return { kind: 'authorization', retryable: false };
    if (status === 400 || status === 404 || status === 422) {
        return { kind: 'invalid_request', retryable: false };
    }
    if (status === 429)
        return { kind: 'rate_limit', retryable: true };
    if (status >= 500)
        return { kind: 'upstream', retryable: true };
    return { kind: 'upstream', retryable: false };
}
export class QlooClient {
    baseUrl;
    apiKey;
    timeoutMs;
    cacheTtlMs;
    cache = new Map();
    throttle;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.apiKey = config.apiKey;
        this.timeoutMs = config.timeoutMs ?? 12000;
        this.cacheTtlMs = config.cacheTtlMs ?? 5 * 60 * 1000;
        this.throttle = config.throttle ?? ((fn) => fn());
    }
    get environment() {
        return qlooEnvironment(this.baseUrl);
    }
    headers() {
        return {
            Accept: 'application/json',
            'X-Api-Key': this.apiKey
        };
    }
    cacheKey(path, params) {
        const ordered = Object.keys(params)
            .sort()
            .map((key) => `${key}=${params[key]}`)
            .join('&');
        return `${this.environment}|${this.baseUrl}|${path}|${ordered}`;
    }
    async get(path, params = {}) {
        const clean = {};
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === '')
                continue;
            clean[key] = String(value);
        }
        const cacheKey = this.cacheKey(path, clean);
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expires > Date.now())
            return cached.data;
        const url = new URL(`${this.baseUrl}${path}`);
        for (const [k, v] of Object.entries(clean))
            url.searchParams.set(k, v);
        const urlStr = url.toString();
        const headers = this.headers();
        const timeoutMs = this.timeoutMs;
        // Exponential backoff constants: [1s, 2s, 4s] + jitter
        const BACKOFFS = [1_000, 2_000, 4_000];
        const MAX_RETRIES = 3;
        const data = await this.throttle(async () => {
            let lastError;
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                let res;
                try {
                    res = await fetch(urlStr, {
                        method: 'GET',
                        headers,
                        signal: AbortSignal.timeout(timeoutMs)
                    });
                }
                catch (err) {
                    lastError = err;
                    if (attempt < MAX_RETRIES - 1) {
                        await sleep(jitterMs(BACKOFFS[Math.min(attempt, BACKOFFS.length - 1)]));
                        continue;
                    }
                    throw new QlooApiError({
                        kind: 'upstream',
                        endpoint: path,
                        retryable: true,
                        environment: this.environment,
                        message: `Qloo request failed before a response: ${String(err)}`
                    });
                }
                if (res.ok) {
                    let parsed;
                    try {
                        parsed = (await res.json());
                    }
                    catch (err) {
                        throw new QlooApiError({
                            kind: 'parse',
                            endpoint: path,
                            status: res.status,
                            environment: this.environment,
                            message: `Qloo returned invalid JSON: ${String(err)}`
                        });
                    }
                    return parsed;
                }
                const text = await res.text().catch(() => '');
                const { kind, retryable } = classifyStatus(res.status);
                if (res.status === 429 && attempt < MAX_RETRIES - 1) {
                    // Respect rate-limit headers; fall back to backoff
                    const headerWait = parseRateLimitReset(res.headers);
                    const waitMs = jitterMs(Math.max(BACKOFFS[Math.min(attempt, BACKOFFS.length - 1)], headerWait ?? 0));
                    console.info(`[qloo] 429 rate limit (attempt ${attempt + 1}/${MAX_RETRIES}); waiting ${Math.round(waitMs / 1000)}s`);
                    await sleep(waitMs);
                    lastError = new Error(`Rate limited: ${text.slice(0, 120)}`);
                    continue;
                }
                if (retryable && res.status >= 500 && attempt < MAX_RETRIES - 1) {
                    await sleep(jitterMs(BACKOFFS[Math.min(attempt, BACKOFFS.length - 1)]));
                    lastError = new Error(`Upstream error ${res.status}`);
                    continue;
                }
                throw new QlooApiError({
                    kind: res.status === 429 ? 'rate_limit' : kind,
                    endpoint: path,
                    status: res.status,
                    retryable,
                    environment: this.environment,
                    message: `Qloo API error ${res.status}: ${text.slice(0, 300)}`
                });
            }
            throw new QlooApiError({
                kind: 'rate_limit',
                endpoint: path,
                retryable: true,
                environment: this.environment,
                message: `Qloo rate limit: all ${MAX_RETRIES} retries exhausted. ${String(lastError)}`
            });
        });
        if (this.cacheTtlMs > 0) {
            this.cache.set(cacheKey, { expires: Date.now() + this.cacheTtlMs, data });
        }
        return data;
    }
    parseEnvelope(data, path, keys) {
        if (!data || typeof data !== 'object' || data.success === false) {
            throw new QlooApiError({
                kind: 'parse',
                endpoint: path,
                environment: this.environment,
                message: `Qloo response did not contain a successful envelope for ${path}.`
            });
        }
        let cursor = data;
        for (const key of keys) {
            if (!cursor || typeof cursor !== 'object' || !(key in cursor)) {
                throw new QlooApiError({
                    kind: 'parse',
                    endpoint: path,
                    environment: this.environment,
                    message: `Qloo response missing ${keys.join('.')} for ${path}.`
                });
            }
            cursor = cursor[key];
        }
        if (!Array.isArray(cursor)) {
            throw new QlooApiError({
                kind: 'parse',
                endpoint: path,
                environment: this.environment,
                message: `Qloo response ${keys.join('.')} was not an array for ${path}.`
            });
        }
        return cursor;
    }
    async searchEntities(query, opts = {}) {
        const take = opts.take ?? opts.limit ?? 10;
        const types = opts.types?.length ? opts.types : opts.type ? [opts.type] : undefined;
        if (types) {
            for (const type of types) {
                if (!SEARCH_TYPES.has(type)) {
                    throw new QlooApiError({
                        kind: 'invalid_request',
                        endpoint: '/v2/search',
                        environment: this.environment,
                        message: `Unsupported Qloo search type: ${type}`
                    });
                }
            }
        }
        const data = await this.get('/v2/search', {
            query,
            types: types?.join(','),
            take
        });
        const rows = this.parseEnvelope(data, '/v2/search', ['results']);
        if (rows.length > take) {
            throw new QlooApiError({
                kind: 'parse',
                endpoint: '/v2/search',
                environment: this.environment,
                message: `Qloo search returned ${rows.length} rows for take=${take}; refusing a silently ignored parameter contract.`
            });
        }
        return rows.map((r) => this.mapEntity(r));
    }
    async hydrateEntities(entityIds) {
        if (!entityIds.length)
            return [];
        const data = await this.get('/entities', {
            entity_ids: entityIds.filter(Boolean).join(',')
        });
        const rows = this.parseEnvelope(data, '/entities', ['results']);
        return rows.map((r) => this.mapEntity(r));
    }
    async searchAudiences(query, take = 10) {
        const data = await this.get('/v2/audiences', {
            'filter.query': query,
            take
        });
        const rows = this.parseEnvelope(data, '/v2/audiences', ['results', 'audiences']);
        return rows.map((r) => ({
            entityId: String(r.entity_id || r.id || ''),
            id: typeof r.id === 'string' && r.id.startsWith('urn:') ? r.id : undefined,
            name: String(r.name || r.disambiguation || 'Unknown audience'),
            type: r.type,
            disambiguation: r.disambiguation,
            parents: Array.isArray(r.parents) ? r.parents : [],
            tags: Array.isArray(r.tags) ? r.tags : []
        })).filter((a) => Boolean(a.entityId));
    }
    async getInsights(opts) {
        const take = opts.take ?? 15;
        const interestEntityIds = (opts.entityIds || []).filter(Boolean);
        const tagIds = (opts.tagIds || []).filter(Boolean);
        const audienceIds = (opts.demographicsAudienceIds || []).filter(Boolean);
        if (opts.filterType === 'urn:demographics' && !interestEntityIds.length && !tagIds.length) {
            throw new QlooApiError({
                kind: 'invalid_request',
                endpoint: '/v2/insights',
                environment: this.environment,
                message: 'Demographics insights require an interest signal (entity or tag); an audience signal alone returns 400.'
            });
        }
        if (opts.filterType === 'urn:heatmap' && !opts.locationQuery) {
            throw new QlooApiError({
                kind: 'invalid_request',
                endpoint: '/v2/insights',
                environment: this.environment,
                message: 'Heatmap insights require filter.location.query.'
            });
        }
        if (opts.filterType === 'urn:heatmap' && !interestEntityIds.length && !tagIds.length) {
            throw new QlooApiError({
                kind: 'invalid_request',
                endpoint: '/v2/insights',
                environment: this.environment,
                message: 'Heatmap insights require at least one valid signal.'
            });
        }
        const data = await this.get('/v2/insights', {
            'filter.type': opts.filterType,
            'signal.interests.entities': interestEntityIds.join(','),
            'signal.interests.tags': tagIds.join(','),
            'signal.demographics.audiences': audienceIds.join(','),
            'filter.location.query': opts.locationQuery,
            take,
            'feature.explainability': opts.explainability === false ? 'false' : 'true'
        });
        return this.parseEnvelope(data, '/v2/insights', ['results', 'entities']);
    }
    async getAffinities(entity, opts = {}) {
        const entityNameOrObj = typeof entity === 'string' ? entity : entity.name;
        let id = typeof entity === 'string' ? undefined : entity.id;
        if (!id) {
            const found = await this.searchEntities(entityNameOrObj, {
                take: 3,
                type: opts.type
            });
            id = found[0]?.id;
        }
        if (!id)
            return [];
        const types = opts.domains?.length
            ? opts.domains
            : ['urn:entity:place', 'urn:entity:brand', 'urn:entity:artist'];
        const batches = await Promise.all(types.map((filterType) => this.getInsights({
            filterType,
            entityIds: [id],
            locationQuery: opts.location,
            take: opts.take ?? opts.limit ?? 12
        })));
        const affinities = [];
        for (let i = 0; i < batches.length; i++) {
            for (const row of batches[i]) {
                const strength = affinityScore(row);
                if (strength === undefined)
                    continue;
                affinities.push({
                    target: entityName(row),
                    targetId: entityId(row),
                    uuid: typeof entityId(row) === 'string' && !entityId(row).startsWith('urn:') ? entityId(row) : undefined,
                    urn: entityUrn(row),
                    strength,
                    domain: domainFromType(types[i]),
                    relation: 'affinity',
                    genre: genreFromRow(row),
                    description: descriptionFromRow(row),
                    city: cityFromRow(row),
                    keywords: keywordsFromRow(row)
                });
            }
        }
        return affinities;
    }
    async getAudienceAffinities(audienceIds, opts = {}) {
        const types = opts.domains?.length
            ? opts.domains
            : ['urn:entity:place'];
        const batches = await Promise.all(types.map((filterType) => this.getInsights({
            filterType,
            demographicsAudienceIds: audienceIds,
            locationQuery: opts.locationQuery,
            take: opts.take ?? 12
        })));
        const affinities = [];
        for (let i = 0; i < batches.length; i++) {
            for (const row of batches[i]) {
                const strength = affinityScore(row);
                if (strength === undefined)
                    continue;
                affinities.push({
                    target: entityName(row),
                    targetId: entityId(row),
                    uuid: typeof entityId(row) === 'string' && !entityId(row).startsWith('urn:') ? entityId(row) : undefined,
                    urn: entityUrn(row),
                    strength,
                    domain: domainFromType(types[i]),
                    relation: 'affinity',
                    genre: genreFromRow(row),
                    description: descriptionFromRow(row),
                    city: cityFromRow(row),
                    keywords: keywordsFromRow(row)
                });
            }
        }
        return affinities;
    }
    async getCrossDomain(context, opts = {}) {
        const searches = await Promise.all(context.entities.slice(0, 4).map((q) => this.searchEntities(q, { take: 2 })));
        const ids = searches.flat().map((e) => e.id).filter(Boolean);
        if (!ids.length)
            return { results: { places: [], brands: [], artists: [] }, entityIds: [], source: 'live' };
        const [places, brands, artists] = await Promise.all([
            this.getInsights({
                filterType: 'urn:entity:place',
                entityIds: ids.slice(0, 3),
                locationQuery: context.location,
                take: opts.take ?? opts.limit ?? 15
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
    }
    async getDemographics(opts) {
        const data = await this.get('/v2/insights', {
            'filter.type': 'urn:demographics',
            'signal.interests.entities': opts.interestEntityIds.filter(Boolean).join(','),
            'signal.interests.tags': (opts.interestTagIds || []).filter(Boolean).join(','),
            'signal.demographics.audiences': opts.audienceIds.filter(Boolean).join(','),
            'filter.location.query': opts.locationQuery,
            take: opts.take ?? 5
        });
        return this.parseEnvelope(data, '/v2/insights', ['results', 'demographics']);
    }
    async compareEntities(opts) {
        if (!opts.aEntityIds.length || !opts.bEntityIds.length) {
            throw new QlooApiError({
                kind: 'invalid_request',
                endpoint: '/v2/analysis/compare',
                environment: this.environment,
                message: 'Comparison requires both a.signal and b.signal entity IDs.'
            });
        }
        const data = await this.get('/v2/analysis/compare', {
            'a.signal.interests.entities': opts.aEntityIds.join(','),
            'b.signal.interests.entities': opts.bEntityIds.join(','),
            'filter.type': opts.filterType,
            take: opts.take ?? 10
        });
        if (!data || typeof data !== 'object' || data.success === false || !('results' in data)) {
            throw new QlooApiError({
                kind: 'parse',
                endpoint: '/v2/analysis/compare',
                environment: this.environment,
                message: 'Qloo comparison response did not contain results.'
            });
        }
        return data;
    }
    async getTrending(opts) {
        if (!TRENDING_TYPES.has(opts.filterType)) {
            throw new QlooApiError({
                kind: 'invalid_request',
                endpoint: '/v2/trending',
                environment: this.environment,
                message: `Trending does not support ${opts.filterType}.`
            });
        }
        if (!opts.startDate || !opts.endDate) {
            throw new QlooApiError({
                kind: 'invalid_request',
                endpoint: '/v2/trending',
                environment: this.environment,
                message: 'Trending requires filter.start_date and filter.end_date.'
            });
        }
        const data = await this.get('/v2/trending', {
            'filter.type': opts.filterType,
            'signal.interests.entities': (opts.entityIds || []).filter(Boolean).join(','),
            'filter.start_date': opts.startDate,
            'filter.end_date': opts.endDate,
            take: opts.take ?? 10
        });
        return this.parseEnvelope(data, '/v2/trending', ['results', 'trending']);
    }
    async getTags(query, take = 10) {
        const data = await this.get('/v2/tags', {
            'filter.query': query,
            take
        });
        return this.parseEnvelope(data, '/v2/tags', ['results', 'tags']);
    }
    async getHeatmap(opts) {
        return this.getInsights({
            filterType: 'urn:heatmap',
            entityIds: opts.entityIds,
            tagIds: opts.tagIds,
            locationQuery: opts.locationQuery,
            take: opts.take ?? 10
        });
    }
    mapEntity(r) {
        const id = entityId(r);
        const urn = entityUrn(r);
        return {
            id: id || urn,
            uuid: id && !id.startsWith('urn:') ? id : undefined,
            urn,
            name: entityName(r),
            type: r.type,
            subtype: r.subtype,
            domain: domainFromType(r.subtype || r.type),
            city: r?.properties?.geocode?.city,
            country: r?.properties?.geocode?.country,
            popularity: typeof r?.popularity === 'number' ? r.popularity : undefined
        };
    }
}
function scoredRows(rows, domain) {
    return (Array.isArray(rows) ? rows : []).flatMap((row) => {
        const strength = affinityScore(row);
        if (strength === undefined)
            return [];
        return [{
                target: entityName(row),
                targetId: entityId(row),
                uuid: typeof entityId(row) === 'string' && !entityId(row).startsWith('urn:') ? entityId(row) : undefined,
                urn: entityUrn(row),
                strength,
                domain,
                relation: 'affinity',
                genre: genreFromRow(row),
                description: descriptionFromRow(row),
                city: cityFromRow(row),
                keywords: keywordsFromRow(row)
            }];
    });
}
export function qlooBaseUrl() {
    return process.env.QLOO_API_BASE_URL;
}
export function qlooEnvironmentName() {
    const base = qlooBaseUrl();
    if (!base)
        return process.env.NODE_ENV === 'production' ? 'missing' : 'hackathon-default';
    return qlooEnvironment(base);
}
export function missingQlooConfigError() {
    const missing = [];
    if (!process.env.QLOO_API_KEY)
        missing.push('QLOO_API_KEY');
    if (!process.env.QLOO_API_BASE_URL && process.env.NODE_ENV === 'production') {
        missing.push('QLOO_API_BASE_URL');
    }
    return new QlooApiError({
        kind: missing.length ? 'missing_configuration' : 'environment',
        environment: qlooEnvironmentName(),
        message: missing.length
            ? `Qloo is not configured: ${missing.join(', ')}.`
            : 'Qloo configuration is invalid.'
    });
}
export function createQlooClient(opts) {
    const baseUrl = process.env.QLOO_API_BASE_URL ||
        (process.env.NODE_ENV === 'production' ? '' : 'https://hackathon.api.qloo.com');
    const apiKey = process.env.QLOO_API_KEY || '';
    if (!baseUrl)
        throw missingQlooConfigError();
    if (!apiKey)
        throw missingQlooConfigError();
    return new QlooClient({ baseUrl, apiKey, throttle: opts?.throttle });
}
export function hasQlooKey() {
    return Boolean(process.env.QLOO_API_KEY);
}
export function normalizeQlooId(id) {
    return normalizeId(id);
}
