export class MemoryRepo {
    items = new Map();
    async create(item) {
        this.items.set(item.id, item);
        return item;
    }
    async get(id) {
        return this.items.get(id) || null;
    }
    async update(id, updates) {
        const existing = this.items.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.items.set(id, updated);
        return updated;
    }
    async list(filters) {
        return Array.from(this.items.values());
    }
}
export class RepoStore {
    projects = new MemoryRepo();
    analysisRuns = new MemoryRepo();
    opportunities = new MemoryRepo();
    strategies = new MemoryRepo();
    experienceRequirements = new MemoryRepo();
    architecturalDecisions = new MemoryRepo();
    spatialConcepts = new MemoryRepo();
    visualizations = new MemoryRepo();
    reviews = new MemoryRepo();
}
