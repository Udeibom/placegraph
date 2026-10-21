import { QlooAffinity, QlooEntity } from './client';
export declare class QlooMockClient {
    searchEntities(query: string): Promise<QlooEntity[]>;
    getAffinities(entity: string): Promise<QlooAffinity[]>;
    getCrossDomain(context: {
        entities: string[];
        audiences?: string[];
    }): Promise<any>;
}
