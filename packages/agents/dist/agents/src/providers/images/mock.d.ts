export interface ImageGenResult {
    images: string[];
    model: string;
}
export declare class MockImageProvider {
    generate(req: any): Promise<ImageGenResult>;
}
