export interface PollinationsImageResult {
  dataUrl: string;
  model: string;
}

export async function generateWithPollinations(opts: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}): Promise<PollinationsImageResult | null> {
  const key = process.env.POLLINATIONS_API_KEY;
  const prompt = composePrompt(opts.prompt, opts.negativePrompt);
  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  url.searchParams.set('width', String(opts.width || 1024));
  url.searchParams.set('height', String(opts.height || 768));
  url.searchParams.set('model', 'flux');
  url.searchParams.set('nologo', 'true');
  url.searchParams.set('enhance', 'false');
  if (typeof opts.seed === 'number') url.searchParams.set('seed', String(opts.seed));

  try {
    const res = await fetch(url, {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      signal: AbortSignal.timeout(55000)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('Pollinations image error:', res.status, text.slice(0, 200));
      return null;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      const text = await res.text().catch(() => '');
      console.warn('Pollinations returned non-image:', contentType, text.slice(0, 200));
      return null;
    }

    const base64 = Buffer.from(await res.arrayBuffer()).toString('base64');
    return {
      dataUrl: `data:${contentType.split(';')[0]};base64,${base64}`,
      model: 'pollinations-flux'
    };
  } catch (err) {
    console.warn('Pollinations image provider failed:', err);
    return null;
  }
}

function composePrompt(prompt: string, negativePrompt?: string): string {
  const negative = negativePrompt
    ? ` Avoid: ${negativePrompt}.`
    : '';
  return `${prompt}${negative} No text, no lettering, no logos, no watermark.`;
}
