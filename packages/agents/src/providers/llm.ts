export type LLMModel =
  | 'llama-3.1-70b-versatile'
  | 'llama-3.3-70b-versatile'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'
  | 'deepseek-r1-distill-llama-70b'
  | 'llama-3.1-8b-instant'
  | string;

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
  private resolvedModel: string | null = null;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  get available(): boolean {
    return Boolean(this.config.apiKey);
  }

  private modelCandidates(): string[] {
    return Array.from(
      new Set(
        [
          this.resolvedModel,
          this.config.model,
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant'
        ].filter((m): m is string => Boolean(m))
      )
    );
  }

  async complete(messages: LLMMessage[], opts?: { temperature?: number; maxTokens?: number; json?: boolean }): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      return { content: '', model: this.config.model };
    }

    try {
      for (const model of this.modelCandidates()) {
        const body: Record<string, unknown> = {
          model,
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
          console.warn(`Groq API error (${model}):`, res.status, text);
          const retryable =
            res.status === 404 ||
            text.includes('model_not_found') ||
            text.includes('does not exist') ||
            text.includes('do not have access');
          if (retryable) continue;
          return { content: '', model };
        }

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
      return { content: '', model: this.config.model };
    } catch (err) {
      console.warn('LLM provider error:', err);
      return { content: '', model: this.config.model };
    }
  }

  async completeVision(prompt: string, imageDataUrl: string): Promise<string> {
    if (!this.config.apiKey) return '';
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
    } catch (err) {
      console.warn('Groq vision failed:', err);
      return '';
    }
  }
}

export function createLLMProvider(): LLMProvider {
  return new LLMProvider({
    provider: 'groq',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    apiKey: process.env.GROQ_API_KEY || ''
  });
}
