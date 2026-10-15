import { Project } from '@placegraph/types';
import { ProvenanceBuilder, replaceVars } from '@placegraph/core';
import { VISUALIZATION_PROMPT } from './prompts/visualization';
import { MockImageProvider } from './providers/images/mock';
import { createHFImageProvider } from './providers/images/hf';

export interface VisualizationInput {
  project: Project;
  strategy: any;
  decisions: any[];
  concept: any;
  requirements: any[];
  useMock?: boolean;
  style?: string;
}

export class VisualizationService {
  private llm: any;
  private imageMock: MockImageProvider;
  private image: any;

  constructor(llm?: any, opts?: { useMock?: boolean }) {
    this.llm = llm;
    this.imageMock = new MockImageProvider();
    this.image = opts?.useMock === false ? createHFImageProvider() : this.imageMock;
  }

  async generateVisualization(input: VisualizationInput) {
    const prov = new ProvenanceBuilder();
    const root = prov.create('inference', 'Visualization generation initiated', { parentId: null });
    prov.setRoot(root.id);

    const promptTemplate = replaceVars(VISUALIZATION_PROMPT, {
      project: input.project,
      strategy: input.strategy,
      decisions: input.decisions,
      concept: input.concept,
      requirements: input.requirements
    });

    const resp = await this.llm?.complete([
      { role: 'system', content: 'Generate detailed architectural visualization prompt' },
      { role: 'user', content: promptTemplate }
    ]) || { content: promptTemplate };

    const vizPrompt = resp.content.trim();
    prov.create('inference', 'Derived visualization prompt from reasoning chain', {
      parentId: root.id,
      metadata: { promptLength: vizPrompt.length }
    });

    const result = await this.image.generate({
      prompt: vizPrompt,
      width: 1600,
      height: 900
    });

    prov.create('inference', `Generated visualization image(s) via ${result.model}`, {
      parentId: root.id,
      metadata: { count: result.images.length, model: result.model }
    });

    return {
      prov,
      prompt: vizPrompt,
      images: result.images,
      model: result.model
    };
  }
}
