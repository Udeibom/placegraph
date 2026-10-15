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
  images: string[];
  model: string;
}

export class HFImageProvider {
  private config: HFImageGenConfig;

  constructor(config: HFImageGenConfig) {
    this.config = config;
  }

  async generate(req: HFImageGenRequest): Promise<HFImageGenResult> {
    if (!this.config.apiKey) {
      return {
        images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22260%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22260%22/%3E%3Ctext x=%22200%22 y=%22130%22 font-size=%2212%22 fill=%22%239ca3af%22 text-anchor=%22middle%22%3EMock (no HF_TOKEN)%3C/text%3E%3C/svg%3E'],
        model: this.config.model
      };
    }

    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${this.config.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: req.prompt,
          parameters: {
            negative_prompt: req.negativePrompt,
            width: req.width || 1024,
            height: req.height || 1024,
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        })
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn('HF API error:', res.status, text);
        return { images: [], model: this.config.model };
      }

      const contentType = res.headers.get('content-type');
      if (contentType?.includes('image')) {
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return { images: [`data:${contentType};base64,${base64}`], model: this.config.model };
      }

      const data = await res.json();
      if (Array.isArray(data) && data[0]?.image) {
        return { images: [data[0].image], model: this.config.model };
      }
      return { images: [], model: this.config.model };
    } catch (err) {
      console.warn('HF provider error:', err);
      return { images: [], model: this.config.model };
    }
  }
}

export function createHFImageProvider(): HFImageProvider {
  return new HFImageProvider({
    apiKey: process.env.HF_TOKEN || '',
    model: process.env.HF_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0'
  });
}
