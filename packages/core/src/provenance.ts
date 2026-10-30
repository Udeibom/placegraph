import type { ProvenanceNode } from '@placegraph/types';

export class ProvenanceBuilder {
  private nodes: ProvenanceNode[] = [];
  private root?: string;

  create(kind: ProvenanceNode['kind'], explanation: string, opts: Partial<ProvenanceNode> = {}): ProvenanceNode {
    const node: ProvenanceNode = {
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

  setRoot(id: string) {
    this.root = id;
  }

  getRoot(): string | undefined {
    return this.root;
  }

  all(): ProvenanceNode[] {
    return this.nodes;
  }

  find(id: string): ProvenanceNode | undefined {
    return this.nodes.find(n => n.id === id);
  }
}
