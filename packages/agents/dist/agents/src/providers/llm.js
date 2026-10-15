export class LLMProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    async complete(messages, opts) {
        // Groq API implementation - will work if GROQ_API_KEY is set
        if (!this.config.apiKey) {
            return {
                content: '[]',
                model: this.config.model
            };
        }
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages,
                    temperature: opts?.temperature ?? 0.7,
                    max_tokens: opts?.maxTokens ?? 2048
                })
            });
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.warn('Groq API error:', res.status, text);
                return { content: '[]', model: this.config.model };
            }
            const data = await res.json();
            return {
                content: data.choices?.[0]?.message?.content || '[]',
                model: data.model || this.config.model,
                usage: data.usage
            };
        }
        catch (err) {
            console.warn('LLM provider error:', err);
            return { content: '[]', model: this.config.model };
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
