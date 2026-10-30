import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  AnalysisSnapshot,
  AudienceResolution,
  EvidenceGate,
  LocationContext,
  Project,
  QlooContext
} from '@placegraph/types';
import { resolveAudienceEvidence, type AudienceQlooClient } from '../src/audiences.ts';
import { buildEvidenceGate } from '../src/evidence.ts';
import { locationCandidates, locationScope } from '../src/qloo-context.ts';
import { deriveCulturalRelationships } from '../src/relationships.ts';
import { fallbackOpportunities, fallbackStrategies } from '../src/fallback.ts';

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj-test',
    name: 'Test project',
    location: { city: 'London', neighborhood: 'Clerkenwell', address: 'St John Street' },
    mode: 'evaluate',
    projectType: 'restaurant',
    businessType: 'destination restaurant',
    organisationProfiles: [],
    objective: 'Test the cultural evidence.',
    audiences: [
      { name: 'Design-aware diners', priority: 1 },
      { name: 'Clerkenwell residents', priority: 2 }
    ],
    constraints: [],
    status: 'draft',
    ...overrides
  } as Project;
}

function resolution(
  name: string,
  overrides: Partial<AudienceResolution> = {}
): AudienceResolution {
  return {
    id: `aud-${name}`,
    name,
    query: name,
    status: 'resolved',
    quality: 'strong',
    identifiers: [],
    seeds: [],
    affinities: [
      {
        target: 'Brilliant Corners',
        urn: 'urn:entity:place:brilliant-corners',
        strength: 0.71,
        seedCount: 2
      }
    ],
    evidenceClaimIds: [],
    limitations: [],
    ...overrides
  };
}

function location(overrides: Partial<LocationContext> = {}): LocationContext {
  return {
    query: 'Clerkenwell, London',
    evidenceQuality: 'strong',
    pois: [{ name: 'Brilliant Corners', category: 'bar' }],
    notes: [],
    ...overrides
  };
}

function qloo(overrides: Partial<QlooContext> = {}): QlooContext {
  return {
    source: 'live',
    locationResolution: {
      query: 'London, United Kingdom',
      resolved: true,
      scope: 'city',
      candidatesTried: ['London']
    },
    entities: [],
    affinities: Array.from({ length: 5 }, (_, index) => ({
      target: `Place ${index}`,
      strength: 0.5 + index / 10
    })),
    audienceAffinities: {},
    crossDomain: null,
    culturalPatterns: [],
    culturalThesis: '',
    notes: [],
    insufficient: false,
    audienceResolutions: [resolution('Design-aware diners'), resolution('Clerkenwell residents')],
    evidenceClaims: [],
    environment: 'live',
    ...overrides
  };
}

function gate(): EvidenceGate {
  return {
    locationQuality: 'strong',
    qlooQuality: 'strong',
    llmAvailable: true,
    intelligenceMode: 'live',
    allowConfidentRecommendation: true,
    qlooStatus: 'ready',
    warnings: []
  };
}

test('location candidates never substitute undefined, state-only, or country-only filters', () => {
  const withCity = locationCandidates(project(), {
    ...location(),
    displayName: 'Clerkenwell, London, United Kingdom'
  });

  assert.deepEqual(withCity, ['Clerkenwell, London', 'London, United Kingdom', 'London']);
  assert.ok(withCity.every((candidate) => candidate && candidate !== 'undefined'));

  const withPostcode = locationCandidates(project(), {
    ...location(),
    displayName: 'Clerkenwell, London, EC1R 0EA, United Kingdom'
  });
  assert.deepEqual(withPostcode, ['Clerkenwell, London', 'London, United Kingdom', 'London']);

  const withoutCity = locationCandidates(
    project({ location: { neighborhood: 'Soho' } }),
    { ...location(), displayName: 'Soho, London, United Kingdom' }
  );
  assert.deepEqual(withoutCity, []);
});

test('location scope does not promote a city or region to neighbourhood precision', () => {
  const base = project();
  assert.equal(locationScope(base, 'London, United Kingdom'), 'city');
  assert.equal(locationScope(base, 'Clerkenwell, London, United Kingdom'), 'neighborhood');
  assert.equal(locationScope(base, 'Greater London, United Kingdom'), 'region');
  assert.equal(locationScope(base, undefined), 'unresolved');
});

test('a live Qloo run with unresolved geography is blocked even with scored affinities', () => {
  const unresolved = qloo({
    locationResolution: {
      resolved: false,
      scope: 'unresolved',
      candidatesTried: ['London']
    }
  });
  const result = buildEvidenceGate({
    llmAvailable: true,
    location: location(),
    qloo: unresolved,
    project: project()
  });

  assert.equal(result.allowConfidentRecommendation, false);
  assert.match(result.blockedReason || '', /geography/i);
  assert.equal(result.evidenceSummary?.canRecommend, false);
});

test('a city-scoped Qloo run can pass the gate when other prerequisites hold', () => {
  const result = buildEvidenceGate({
    llmAvailable: true,
    location: location(),
    qloo: qloo(),
    project: project()
  });

  assert.equal(result.allowConfidentRecommendation, true);
});

test('vague audiences reject unrelated Qloo taxonomies and seeds without affinity lookups', async () => {
  let audienceAffinityCalls = 0;
  let entityAffinityCalls = 0;
  const client: AudienceQlooClient = {
    async searchAudiences() {
      return [
        {
          id: 'urn:audience:local',
          name: 'Local Woman Missing',
          disambiguation: 'A novel',
          tags: ['fiction']
        } as any
      ];
    },
    async searchEntities() {
      return [
        { name: 'Local Woman Missing', urn: 'urn:entity:movie:local-woman-missing', type: 'movie' },
        { name: 'Local Natives', urn: 'urn:entity:artist:local-natives', type: 'artist' },
        { name: 'Local Goat', urn: 'urn:entity:place:local-goat', type: 'place' }
      ];
    },
    async getAffinities() {
      entityAffinityCalls += 1;
      throw new Error('unrelated seeds must not be used for affinity lookups');
    },
    async getAudienceAffinities() {
      audienceAffinityCalls += 1;
      throw new Error('unrelated taxonomy must not be used for affinity lookups');
    }
  };

  const result = await resolveAudienceEvidence(
    project({ audiences: [{ name: 'Local residents', description: 'People living within 1 km', priority: 1 }] }),
    client,
    { locationQuery: 'London, United Kingdom', environment: 'live' }
  );

  assert.equal(result.audiences.length, 1);
  assert.equal(result.audiences[0].status, 'unresolved');
  assert.equal(result.audiences[0].affinities.length, 0);
  assert.equal(audienceAffinityCalls, 0);
  assert.equal(entityAffinityCalls, 0);
});

test('a resolved taxonomy without a local location withholds global audience affinities', async () => {
  let audienceAffinityCalls = 0;
  const client: AudienceQlooClient = {
    async searchAudiences() {
      return [
        {
          id: 'urn:audience:creative-professionals',
          name: 'Creative professionals',
          tags: ['creative']
        } as any
      ];
    },
    async searchEntities() {
      return [];
    },
    async getAffinities() {
      return [];
    },
    async getAudienceAffinities() {
      audienceAffinityCalls += 1;
      return [
        {
          target: 'Museum of Modern Art',
          strength: 0.8,
          domain: 'urn:entity:place'
        }
      ];
    }
  };

  const result = await resolveAudienceEvidence(
    project({ audiences: [{ name: 'Creative professionals', priority: 1 }] }),
    client,
    { environment: 'live' }
  );

  assert.equal(audienceAffinityCalls, 0);
  assert.equal(result.audiences[0].status, 'unresolved');
  assert.equal(result.audiences[0].affinities.length, 0);
  assert.match(result.audiences[0].limitations.join(' '), /withheld/i);
});

test('a generic category word alone does not create a local-expression match', () => {
  const audience = resolution('Design-aware diners', {
    affinities: [
      {
        target: 'The Orangery Restaurant',
        urn: 'urn:entity:place:the-orangery-restaurant',
        strength: 0.7,
        seedCount: 1
      }
    ]
  });

  const result = deriveCulturalRelationships({
    audiences: [audience],
    pois: [{ name: 'Dishoom Shoreditch', category: 'restaurant' }],
    placeAffinities: [],
    placeLabel: 'Clerkenwell',
    environment: 'live'
  });

  assert.equal(result.relationships.length, 1);
  assert.notEqual(result.relationships[0].relationshipType, 'local_expression');
  assert.deepEqual(result.claims[0].localRefs, []);
});

test('fallback opportunity and strategy generation may return zero outputs', () => {
  const noAudience = project({ audiences: [] });
  const snapshot = {
    qlooContext: qloo({ affinities: [] }),
    locationContext: location({ pois: [] })
  } as AnalysisSnapshot;

  const opportunities = fallbackOpportunities(noAudience, 'run-test', snapshot);
  const strategies = fallbackStrategies(noAudience, 'run-test', opportunities, snapshot.qlooContext);
  assert.equal(opportunities.length, 0);
  assert.equal(strategies.length, 0);
});

test('fallback strategies do not assert that Qloo changed the decision', () => {
  const base = project();
  const snapshot = {
    qlooContext: qloo(),
    locationContext: location({
      pois: [
        { name: 'Bar One', category: 'bar' },
        { name: 'Bar Two', category: 'bar' },
        { name: 'Cafe One', category: 'cafe' }
      ]
    })
  } as AnalysisSnapshot;

  const opportunities = fallbackOpportunities(base, 'run-test', snapshot);
  assert.ok(opportunities.length > 0);
  const strategies = fallbackStrategies(base, 'run-test', opportunities, snapshot.qlooContext);
  assert.ok(strategies.length > 0);
  for (const strategy of strategies as Array<Record<string, unknown>>) {
    assert.equal('qlooChangedDecision' in strategy, false);
    assert.equal('evaluationScore' in strategy, false);
  }
});
