import type { QlooAffinity, QlooAudience, QlooEntity } from './client';
export declare class QlooMockClient {
    searchEntities(query: string): Promise<QlooEntity[]>;
    getAffinities(entity: string): Promise<QlooAffinity[]>;
    searchAudiences(query: string): Promise<QlooAudience[]>;
    getAudienceAffinities(audienceIds: string[]): Promise<QlooAffinity[]>;
    getCrossDomain(context: {
        entities: string[];
        audiences?: string[];
    }): Promise<any>;
}
