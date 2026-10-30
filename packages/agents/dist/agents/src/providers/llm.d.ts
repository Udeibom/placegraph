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
export type LLMFailureKind = 'budget' | 'rate_limit' | 'authentication' | 'unavailable' | 'upstream' | 'parse';
export interface LLMFailure {
    kind: LLMFailureKind;
    status?: number;
    message: string;
    model: string;
    retryable?: boolean;
}
export interface LLMResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
    failure?: LLMFailure;
}
export declare function estimateTokens(text: string): number;
export declare function estimateRequestTokens(messages: LLMMessage[], maxTokens: number): number;
export declare class LLMProvider {
    private config;
    private resolvedModel;
    private tokenLimit;
    constructor(config: LLMConfig);
    get requestTokenLimit(): number;
    get available(): boolean;
    private modelCandidates;
    complete(messages: LLMMessage[], opts?: {
        temperature?: number;
        maxTokens?: number;
        json?: boolean;
    }): Promise<LLMResponse>;
    completeVision(prompt: string, imageDataUrl: string): Promise<string>;
}
export declare function createLLMProvider(): LLMProvider;
