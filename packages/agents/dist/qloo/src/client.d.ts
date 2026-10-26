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
export declare class QlooClient {
    private baseUrl;
    private apiKey;
    constructor(config: QlooConfig);
    private headers;
    private get;
    searchEntities(query: string, opts?: QlooRequestOptions): Promise<QlooEntity[]>;
    getInsights(opts: {
        filterType: string;
        entityIds?: string[];
        locationQuery?: string;
        take?: number;
    }): Promise<any[]>;
    getAffinities(entity: string | {
        id?: string;
        name: string;
    }, opts?: QlooRequestOptions): Promise<QlooAffinity[]>;
    getCrossDomain(context: {
        entities: string[];
        audiences?: string[];
        location?: string;
    }, opts?: QlooRequestOptions): Promise<any>;
}
export declare function createQlooClient(): QlooClient;
export declare function hasQlooKey(): boolean;
