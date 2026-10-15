export interface HFImageGenConfig {
    apiKey: string;
    model: string;
    baseUrl?: string;
}
export interface HFImageGenRequest {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    numImages?: number;
    seed?: number;
}
export interface HFImageGenResult {
    images: string[];
    model: string;
}
export declare class HFImageProvider {
    private config;
    constructor(config: HFImageGenConfig);
    generate(req: HFImageGenRequest): Promise<HFImageGenResult>;
}
export declare function createHFImageProvider(): HFImageProvider;
