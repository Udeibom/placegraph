export type LLMModel = 'llama-3.1-70b-versatile' | 'llama-3.3-70b-versatile' | 'mixtral-8x7b-32768' | 'gemma2-9b-it' | string;

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
    // TODO: Implement Groq client
    // Groq is free-first as requested
    return {
      content: 'stub response - implement with Groq API',
      model: this.config.model
    };
  }
}

export function createLLMProvider(): LLMProvider {
  return new LLMProvider({
    provider: 'groq',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY || ''
  });
}
