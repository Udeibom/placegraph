const PROFILES = {
    artisanal: {
        entities: [
            { id: 'mock_art_1', name: 'Independent galleries', domain: 'art' },
            { id: 'mock_din_1', name: 'Chef-driven dining', domain: 'dining' },
            { id: 'mock_hot_1', name: 'Design-led boutique hotels', domain: 'hospitality' }
        ],
        affinities: [
            { target: 'Contemporary art', strength: 0.81, domain: 'art' },
            { target: 'Natural wine', strength: 0.74, domain: 'dining' },
            { target: 'Independent bookstores', strength: 0.69, domain: 'retail' },
            { target: 'Jazz and live acoustic music', strength: 0.66, domain: 'music' },
            { target: 'Craft ceramics and material culture', strength: 0.71, domain: 'design' },
            { target: 'Slow travel hospitality', strength: 0.64, domain: 'travel' }
        ]
    },
    nightlife: {
        entities: [
            { id: 'mock_mus_1', name: 'Electronic music venues', domain: 'music' },
            { id: 'mock_din_2', name: 'Late-night dining', domain: 'dining' }
        ],
        affinities: [
            { target: 'Electronic and club culture', strength: 0.78, domain: 'music' },
            { target: 'Cocktail-led hospitality', strength: 0.76, domain: 'dining' },
            { target: 'Streetwear brands', strength: 0.7, domain: 'fashion' },
            { target: 'Late cinema and entertainment', strength: 0.62, domain: 'film' },
            { target: 'Destination nightlife travel', strength: 0.67, domain: 'travel' }
        ]
    },
    heritage: {
        entities: [
            { id: 'mock_her_1', name: 'Historic neighborhood dining', domain: 'dining' },
            { id: 'mock_mus_2', name: 'Classical and folk performance', domain: 'music' }
        ],
        affinities: [
            { target: 'Regional cuisine traditions', strength: 0.8, domain: 'dining' },
            { target: 'Heritage hospitality', strength: 0.73, domain: 'hospitality' },
            { target: 'Craft and artisan brands', strength: 0.68, domain: 'fashion' },
            { target: 'Historic walking culture', strength: 0.66, domain: 'travel' },
            { target: 'Literary and film heritage', strength: 0.61, domain: 'film' }
        ]
    },
    corporate: {
        entities: [
            { id: 'mock_biz_1', name: 'Business travel hotels', domain: 'hospitality' },
            { id: 'mock_din_3', name: 'Premium business dining', domain: 'dining' }
        ],
        affinities: [
            { target: 'Business travel hospitality', strength: 0.77, domain: 'hospitality' },
            { target: 'Premium dining', strength: 0.74, domain: 'dining' },
            { target: 'Wellness and recovery brands', strength: 0.65, domain: 'brand' },
            { target: 'Quiet luxury fashion', strength: 0.63, domain: 'fashion' },
            { target: 'Destination conferences', strength: 0.6, domain: 'travel' }
        ]
    }
};
function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}
function profileFor(query) {
    const q = query.toLowerCase();
    if (/(soho|brooklyn|lisbon|copenhagen|melbourne|portland)/.test(q))
        return PROFILES.artisanal;
    if (/(ibiza|berlin|miami|shoreditch|warehouse)/.test(q))
        return PROFILES.nightlife;
    if (/(rome|kyoto|old town|historic|marais|bath)/.test(q))
        return PROFILES.heritage;
    if (/(midtown|canary|financial|airport|business)/.test(q))
        return PROFILES.corporate;
    const keys = Object.keys(PROFILES);
    return PROFILES[keys[hash(q) % keys.length]];
}
export class QlooMockClient {
    async searchEntities(query) {
        const profile = profileFor(query);
        return [
            { id: `mock_loc_${hash(query)}`, name: query, domain: 'location' },
            ...profile.entities
        ];
    }
    async getAffinities(entity) {
        return profileFor(String(entity)).affinities;
    }
    async searchAudiences(query) {
        const h = hash(query);
        return [
            {
                entityId: `mock_aud_${h}`,
                id: `urn:audience:mock:${h}`,
                name: query,
                type: 'urn:audience:mock',
                parents: [],
                tags: ['mock']
            }
        ];
    }
    async getAudienceAffinities(audienceIds) {
        return profileFor(audienceIds.join(' ')).affinities;
    }
    async getCrossDomain(context) {
        const seed = context.entities[0] || 'place';
        const profile = profileFor(seed);
        return {
            results: {
                places: profile.entities,
                brands: profile.affinities.filter((a) => a.domain === 'fashion' || a.domain === 'brand'),
                artists: profile.affinities.filter((a) => a.domain === 'music')
            },
            source: 'mock'
        };
    }
}
