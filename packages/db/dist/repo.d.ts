import type { DbProject, DbAnalysisRun, DbOpportunity, DbStrategy, DbExperienceRequirement, DbArchitecturalDecision, DbSpatialConcept, DbVisualization, DbReview } from './schema';
export interface BaseRepo<T> {
    create(item: T): Promise<T>;
    get(id: string): Promise<T | null>;
    update(id: string, updates: Partial<T>): Promise<T | null>;
    list(filters?: any): Promise<T[]>;
}
export declare class MemoryRepo<T extends {
    id: string;
}> implements BaseRepo<T> {
    private items;
    create(item: T): Promise<T>;
    get(id: string): Promise<T | null>;
    update(id: string, updates: Partial<T>): Promise<T | null>;
    list(filters?: any): Promise<T[]>;
}
export declare class RepoStore {
    projects: MemoryRepo<DbProject>;
    analysisRuns: MemoryRepo<DbAnalysisRun>;
    opportunities: MemoryRepo<DbOpportunity>;
    strategies: MemoryRepo<DbStrategy>;
    experienceRequirements: MemoryRepo<DbExperienceRequirement>;
    architecturalDecisions: MemoryRepo<DbArchitecturalDecision>;
    spatialConcepts: MemoryRepo<DbSpatialConcept>;
    visualizations: MemoryRepo<DbVisualization>;
    reviews: MemoryRepo<DbReview>;
}
