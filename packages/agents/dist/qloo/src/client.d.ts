export interface QlooConfig {
    baseUrl: string;
    apiKey: string;
    timeoutMs?: number;
    cacheTtlMs?: number;
}
export interface QlooEntity {
    id?: string;
    uuid?: string;
    urn?: string;
    name: string;
    type?: string;
    subtype?: string;
    domain?: string;
    city?: string;
    country?: string;
    popularity?: number;
}
export interface QlooAffinity {
    target: string;
    targetId?: string;
    uuid?: string;
    urn?: string;
    strength: number;
    domain?: string;
    relation?: string;
    genre?: string;
    description?: string;
    city?: string;
    keywords?: string[];
    seedCount?: number;
}
export interface QlooAudience {
    entityId: string;
    id?: string;
    name: string;
    type?: string;
    disambiguation?: string;
    parents: string[];
    tags: string[];
}
export interface QlooRequestOptions {
    limit?: number;
    take?: number;
    domains?: string[];
    types?: string[];
    type?: string;
    location?: string;
}
export type QlooErrorKind = 'missing_configuration' | 'authentication' | 'authorization' | 'invalid_request' | 'rate_limit' | 'upstream' | 'parse' | 'environment';
export declare class QlooApiError extends Error {
    readonly kind: QlooErrorKind;
    readonly endpoint?: string;
    readonly status?: number;
    readonly retryable: boolean;
    readonly environment?: string;
    constructor(opts: {
        kind: QlooErrorKind;
        message: string;
        endpoint?: string;
        status?: number;
        retryable?: boolean;
        environment?: string;
    });
}
export declare class QlooClient {
    private baseUrl;
    private apiKey;
    private timeoutMs;
    private cacheTtlMs;
    private cache;
    constructor(config: QlooConfig);
    get environment(): string;
    private headers;
    private cacheKey;
    private get;
    private parseEnvelope;
    searchEntities(query: string, opts?: QlooRequestOptions): Promise<QlooEntity[]>;
    hydrateEntities(entityIds: string[]): Promise<QlooEntity[]>;
    searchAudiences(query: string, take?: number): Promise<QlooAudience[]>;
    getInsights(opts: {
        filterType: string;
        entityIds?: string[];
        tagIds?: string[];
        demographicsAudienceIds?: string[];
        locationQuery?: string;
        take?: number;
        explainability?: boolean;
    }): Promise<any[]>;
    getAffinities(entity: string | {
        id?: string;
        name: string;
    }, opts?: QlooRequestOptions): Promise<QlooAffinity[]>;
    getAudienceAffinities(audienceIds: string[], opts?: {
        locationQuery?: string;
        take?: number;
        domains?: string[];
    }): Promise<QlooAffinity[]>;
    getCrossDomain(context: {
        entities: string[];
        audiences?: string[];
        location?: string;
    }, opts?: QlooRequestOptions): Promise<any>;
    getDemographics(opts: {
        interestEntityIds: string[];
        interestTagIds?: string[];
        audienceIds: string[];
        locationQuery?: string;
        take?: number;
    }): Promise<any[]>;
    compareEntities(opts: {
        aEntityIds: string[];
        bEntityIds: string[];
        filterType: string;
        take?: number;
    }): Promise<any>;
    getTrending(opts: {
        filterType: string;
        entityIds?: string[];
        startDate: string;
        endDate: string;
        take?: number;
    }): Promise<any[]>;
    getTags(query: string, take?: number): Promise<any[]>;
    getHeatmap(opts: {
        entityIds?: string[];
        tagIds?: string[];
        locationQuery: string;
        take?: number;
    }): Promise<any[]>;
    private mapEntity;
}
export declare function qlooBaseUrl(): string | undefined;
export declare function qlooEnvironmentName(): string;
export declare function missingQlooConfigError(): QlooApiError;
export declare function createQlooClient(): QlooClient;
export declare function hasQlooKey(): boolean;
export declare function normalizeQlooId(id: string | undefined): string | undefined;
