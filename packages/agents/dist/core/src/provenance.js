export class ProvenanceBuilder {
    nodes = [];
    root;
    create(kind, explanation, opts = {}) {
        const node = {
            id: `prov_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            parentId: opts.parentId ?? this.root,
            kind,
            explanation,
            refs: opts.refs ?? [],
            qlooRefs: opts.qlooRefs ?? [],
            confidence: opts.confidence,
            metadata: opts.metadata
        };
        this.nodes.push(node);
        return node;
    }
    setRoot(id) {
        this.root = id;
    }
    getRoot() {
        return this.root;
    }
    all() {
        return this.nodes;
    }
    find(id) {
        return this.nodes.find(n => n.id === id);
    }
}
