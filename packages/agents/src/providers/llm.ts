export type LLMModel = 'llama-3.1-70b-versatile' | 'llama-3.3-70b-versatile' | 'mixtral-8x7b-32768' | 'gemma2-9b-it' | 'deepseek-r1-distill-llama-70b' | 'llama-3.1-8b-instant' | string;

export interface LLMConfig {
  provider: 'groq';
  model: LLMModel;
  apiKey: string;
  baseUrl?: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export class LLMProvider {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async complete(messages: LLMMessage[], opts?: any): Promise<LLMResponse> {
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
    } catch (err) {
      console.warn('LLM provider error:', err);
      return { content: '[]', model: this.config.model };
    }
  }
}

export function createLLMProvider(): LLMProvider {
  return new LLMProvider({
    provider: 'groq',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY || ''
  });
}
