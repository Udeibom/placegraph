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
export declare class LLMProvider {
    private config;
    constructor(config: LLMConfig);
    get available(): boolean;
    complete(messages: LLMMessage[], opts?: {
        temperature?: number;
        maxTokens?: number;
        json?: boolean;
    }): Promise<LLMResponse>;
    completeVision(prompt: string, imageDataUrl: string): Promise<string>;
}
export declare function createLLMProvider(): LLMProvider;
