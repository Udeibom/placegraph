import type {
  DbProject,
  DbAnalysisRun,
  DbOpportunity,
  DbStrategy,
  DbExperienceRequirement,
  DbArchitecturalDecision,
  DbSpatialConcept,
  DbVisualization,
  DbReview
} from './schema';

export interface BaseRepo<T> {
  create(item: T): Promise<T>;
  get(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  list(filters?: any): Promise<T[]>;
}

export class MemoryRepo<T extends { id: string }> implements BaseRepo<T> {
  private items: Map<string, T> = new Map();

  async create(item: T): Promise<T> {
    this.items.set(item.id, item);
    return item;
  }

  async get(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates } as T;
    this.items.set(id, updated);
    return updated;
  }

  async list(filters?: any): Promise<T[]> {
    return Array.from(this.items.values());
  }
}

export class RepoStore {
  projects = new MemoryRepo<DbProject>();
  analysisRuns = new MemoryRepo<DbAnalysisRun>();
  opportunities = new MemoryRepo<DbOpportunity>();
  strategies = new MemoryRepo<DbStrategy>();
  experienceRequirements = new MemoryRepo<DbExperienceRequirement>();
  architecturalDecisions = new MemoryRepo<DbArchitecturalDecision>();
  spatialConcepts = new MemoryRepo<DbSpatialConcept>();
  visualizations = new MemoryRepo<DbVisualization>();
  reviews = new MemoryRepo<DbReview>();
}
