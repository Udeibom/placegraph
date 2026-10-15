export class QlooMockClient {
    async searchEntities(query) {
        const entities = {
            restaurant: [
                { id: 'rest_1', name: 'Modern Bistro', domain: 'dining' },
                { id: 'rest_2', name: 'Farm-to-Table', domain: 'dining' }
            ],
            hotel: [
                { id: 'hot_1', name: 'Boutique Hotel', domain: 'hospitality' }
            ],
            neighborhood: [
                { id: 'hood_1', name: query, domain: 'location' }
            ]
        };
        return entities[query.toLowerCase()] || [{ id: `mock_${query}`, name: query, domain: 'general' }];
    }
    async getAffinities(entity) {
        return [
            { target: 'Contemporary Art', strength: 0.75, domain: 'art' },
            { target: 'Live Music', strength: 0.68, domain: 'music' },
            { target: 'Boutique Hospitality', strength: 0.72, domain: 'hospitality' },
            { target: 'Design Brands', strength: 0.65, domain: 'fashion' },
            { target: 'Craft Cocktails', strength: 0.71, domain: 'dining' }
        ];
    }
}
