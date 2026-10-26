function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function parseResetDuration(value) {
    if (!value)
        return null;
    const match = value.match(/([\d.]+)\s*(ms|s|m|h)?/i);
    if (!match)
        return null;
    const amount = parseFloat(match[1]);
    if (!Number.isFinite(amount))
        return null;
    const unit = (match[2] || 's').toLowerCase();
    if (unit === 'ms')
        return amount;
    if (unit === 'm')
        return amount * 60_000;
    if (unit === 'h')
        return amount * 3_600_000;
    return amount * 1000;
}
export class LLMProvider {
    config;
    resolvedModel = null;
    constructor(config) {
        this.config = config;
    }
    get available() {
        return Boolean(this.config.apiKey);
    }
    modelCandidates() {
        return Array.from(new Set([
            this.resolvedModel,
            this.config.model,
            'openai/gpt-oss-120b',
            'openai/gpt-oss-20b',
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant'
        ].filter((m) => Boolean(m))));
    }
    async complete(messages, opts) {
        if (!this.config.apiKey) {
            return { content: '', model: this.config.model };
        }
        const maxTokens = Math.min(opts?.maxTokens ?? 6000, 4000);
        const candidates = Array.from(new Set([
            this.resolvedModel,
            this.config.model,
            'openai/gpt-oss-20b',
            'openai/gpt-oss-120b',
            maxTokens <= 1200 ? 'qwen/qwen3.8-27b' : undefined,
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant'
        ].filter((m) => Boolean(m))));
        try {
            for (const model of candidates) {
                let attempt = 0;
                let requestMaxTokens = maxTokens;
                while (attempt < 2) {
                    attempt++;
                    const body = {
                        model,
                        messages,
                        temperature: opts?.temperature ?? 0.4,
                        max_tokens: requestMaxTokens
                    };
                    if (opts?.json !== false) {
                        body.response_format = { type: 'json_object' };
                    }
                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${this.config.apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const resolved = data.model || model;
                        this.resolvedModel = resolved;
                        return {
                            content: data.choices?.[0]?.message?.content || '',
                            model: resolved,
                            usage: data.usage
                                ? {
                                    promptTokens: data.usage.prompt_tokens,
                                    completionTokens: data.usage.completion_tokens
                                }
                                : undefined
                        };
                    }
                    const text = await res.text().catch(() => '');
                    console.warn(`Groq API error (${model}):`, res.status, text.slice(0, 200));
                    const rateLimited = res.status === 429 ||
                        text.includes('rate limit') ||
                        text.includes('reduce the length') ||
                        text.includes('Request too large');
                    const modelUnavailable = res.status === 404 ||
                        text.includes('model_not_found') ||
                        text.includes('does not exist') ||
                        text.includes('do not have access');
                    if (modelUnavailable)
                        break;
                    if (!rateLimited)
                        return { content: '', model };
                    if (text.includes('reduce the length') || text.includes('Request too large')) {
                        requestMaxTokens = Math.min(requestMaxTokens, 1800);
                    }
                    if (attempt === 1) {
                        const reset = parseResetDuration(res.headers.get('retry-after')) ??
                            parseResetDuration(res.headers.get('x-ratelimit-reset-tokens')) ??
                            15_000;
                        const waitMs = Math.max(1500, Math.min(30_000, reset + 750));
                        console.warn(`Groq rate limit on ${model}; waiting ${Math.round(waitMs / 1000)}s`);
                        await sleep(waitMs);
                        continue;
                    }
                    break;
                }
            }
            return { content: '', model: this.config.model };
        }
        catch (err) {
            console.warn('LLM provider error:', err);
            return { content: '', model: this.config.model };
        }
    }
    async completeVision(prompt, imageDataUrl) {
        if (!this.config.apiKey)
            return '';
        const model = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.2,
                    max_tokens: 1800,
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: prompt },
                                { type: 'image_url', image_url: { url: imageDataUrl } }
                            ]
                        }
                    ]
                })
            });
            if (!res.ok) {
                console.warn('Groq vision error:', res.status, await res.text().catch(() => ''));
                return '';
            }
            const data = await res.json();
            return data.choices?.[0]?.message?.content || '';
        }
        catch (err) {
            console.warn('Groq vision failed:', err);
            return '';
        }
    }
}
export function createLLMProvider() {
    return new LLMProvider({
        provider: 'groq',
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        apiKey: process.env.GROQ_API_KEY || ''
    });
}
