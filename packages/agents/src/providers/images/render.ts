import { generateWithCloudflare } from './cloudflare';
import { generateWithPollinations } from './pollinations';

export interface RenderRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface RenderResult {
  dataUrl: string;
  model: string;
}

export async function generateRender(req: RenderRequest): Promise<RenderResult | null> {
  const cloudflare = await generateWithCloudflare(req);
  if (cloudflare) return cloudflare;

  return generateWithPollinations(req);
}
