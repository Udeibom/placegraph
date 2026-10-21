export class LLMProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    get available() {
        return Boolean(this.config.apiKey);
    }
    async complete(messages, opts) {
        if (!this.config.apiKey) {
            return { content: '', model: this.config.model };
        }
        try {
            const body = {
                model: this.config.model,
                messages,
                temperature: opts?.temperature ?? 0.4,
                max_tokens: opts?.maxTokens ?? 6000
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
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.warn('Groq API error:', res.status, text);
                return { content: '', model: this.config.model };
            }
            const data = await res.json();
            return {
                content: data.choices?.[0]?.message?.content || '',
                model: data.model || this.config.model,
                usage: data.usage
                    ? {
                        promptTokens: data.usage.prompt_tokens,
                        completionTokens: data.usage.completion_tokens
                    }
                    : undefined
            };
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
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        apiKey: process.env.GROQ_API_KEY || ''
    });
}
