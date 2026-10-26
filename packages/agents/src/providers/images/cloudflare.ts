export interface CloudflareImageResult {
  dataUrl: string;
  model: string;
}

export async function generateWithCloudflare(opts: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}): Promise<CloudflareImageResult | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) return null;

  const model = '@cf/black-forest-labs/flux-1-schnell';
  const prompt = composePrompt(opts.prompt, opts.negativePrompt);

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, steps: 4 }),
        signal: AbortSignal.timeout(55000)
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('Cloudflare image error:', res.status, text.slice(0, 300));
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.startsWith('image/')) {
      const base64 = Buffer.from(await res.arrayBuffer()).toString('base64');
      return { dataUrl: `data:${contentType.split(';')[0]};base64,${base64}`, model: 'cloudflare-flux-schnell' };
    }

    const data: any = await res.json();
    const image = data?.result?.image ?? data?.result?.images?.[0] ?? data?.image;
    if (typeof image !== 'string' || !image) {
      console.warn('Cloudflare image response had no image:', JSON.stringify(data).slice(0, 300));
      return null;
    }

    const dataUrl = image.startsWith('data:')
      ? image
      : `data:${sniffMime(image)};base64,${image}`;
    return { dataUrl, model: 'cloudflare-flux-schnell' };
  } catch (err) {
    console.warn('Cloudflare image provider failed:', err);
    return null;
  }
}

function composePrompt(prompt: string, negativePrompt?: string): string {
  const negative = negativePrompt
    ? ` Avoid: ${negativePrompt}.`
    : '';
  return `${prompt}${negative} No text, no lettering, no logos, no watermark.`;
}

function sniffMime(base64: string): string {
  try {
    const head = Buffer.from(base64.slice(0, 64), 'base64');
    if (head[0] === 0x89 && head[1] === 0x50) return 'image/png';
    if (head[0] === 0xff && head[1] === 0xd8) return 'image/jpeg';
    if (head.slice(0, 4).toString() === 'RIFF') return 'image/webp';
  } catch {
    // fall through
  }
  return 'image/jpeg';
}
