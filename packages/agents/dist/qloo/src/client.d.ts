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
export declare class QlooClient {
    private baseUrl;
    private apiKey;
    constructor(config: QlooConfig);
    private fetch;
    searchEntities(query: string, opts?: QlooRequestOptions): Promise<QlooEntity[]>;
    getAffinities(entity: string | {
        id?: string;
        name: string;
    }, opts?: QlooRequestOptions): Promise<QlooAffinity[]>;
    getCrossDomain(context: {
        entities: string[];
        audiences?: string[];
    }, opts?: QlooRequestOptions): Promise<any>;
}
export declare function createQlooClient(): QlooClient;
