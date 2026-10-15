export interface HFImageGenConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface HFImageGenRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  seed?: number;
}

export interface HFImageGenResult {
  images: string[]; // base64 or urls
  model: string;
}

export class HFImageProvider {
  private config: HFImageGenConfig;

  constructor(config: HFImageGenConfig) {
    this.config = config;
  }

  async generate(req: HFImageGenRequest): Promise<HFImageGenResult> {
    // TODO: Implement HF Inference API
    return {
      images: [],
      model: this.config.model
    };
  }
}

export function createHFImageProvider(): HFImageProvider {
  return new HFImageProvider({
    apiKey: process.env.HF_TOKEN || '',
    model: process.env.HF_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0'
  });
}
