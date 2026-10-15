import { ProvenanceNode } from '@placegraph/types';
export declare class ProvenanceBuilder {
    private nodes;
    private root?;
    create(kind: ProvenanceNode['kind'], explanation: string, opts?: Partial<ProvenanceNode>): ProvenanceNode;
    setRoot(id: string): void;
    getRoot(): string | undefined;
    all(): ProvenanceNode[];
    find(id: string): ProvenanceNode | undefined;
}
