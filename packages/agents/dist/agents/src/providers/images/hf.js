export class HFImageProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    async generate(req) {
        // TODO: Implement HF Inference API
        return {
            images: [],
            model: this.config.model
        };
    }
}
export function createHFImageProvider() {
    return new HFImageProvider({
        apiKey: process.env.HF_TOKEN || '',
        model: process.env.HF_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0'
    });
}
