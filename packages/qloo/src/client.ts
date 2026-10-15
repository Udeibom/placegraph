export interface QlooConfig {
  baseUrl: string;
  apiKey: string;
}

export interface QlooEntity {
  id: string;
  name: string;
  type?: string;
  domain?: string;
}

export interface QlooAffinity {
  target: string;
  targetId?: string;
  strength: number;
  domain?: string;
  relation?: string;
}

export class QlooClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: QlooConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async searchEntities(query: string, opts?: any): Promise<QlooEntity[]> {
    // TODO: Implement against hackathon API
    // Docs: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
    return [];
  }

  async getAffinities(entity: string | { id: string }, opts?: any): Promise<QlooAffinity[]> {
    // TODO: Implement against hackathon API
    return [];
  }
}

export function createQlooClient(): QlooClient {
  return new QlooClient({
    baseUrl: process.env.QLOO_API_BASE_URL || 'https://hackathon.api.qloo.com',
    apiKey: process.env.QLOO_API_KEY || ''
  });
}
