export class LLMProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    async complete(messages, opts) {
        // TODO: Implement Groq client
        // Groq is free-first as requested
        return {
            content: 'stub response - implement with Groq API',
            model: this.config.model
        };
    }
}
export function createLLMProvider() {
    return new LLMProvider({
        provider: 'groq',
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        apiKey: process.env.GROQ_API_KEY || ''
    });
}
