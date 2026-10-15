export interface ImageGenResult {
  images: string[];
  model: string;
}

export class MockImageProvider {
  async generate(req: any): Promise<ImageGenResult> {
    return {
      images: [
        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22260%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22400%22 height=%22260%22/%3E%3Ctext x=%22200%22 y=%22130%22 font-size=%2214%22 fill=%22%236b7280%22 text-anchor=%22middle%22%3EPlaceGraph Concept%3C/text%3E%3C/svg%3E'
      ],
      model: 'mock'
    };
  }
}
