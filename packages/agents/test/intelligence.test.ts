import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  AudienceResolution,
  EvidenceClaim,
  EvidenceGate,
  LocationContext,
  Project,
  QlooContext
} from '@placegraph/types';
import { buildEvidenceGate } from '../src/evidence.ts';
import { deriveCulturalRelationships } from '../src/relationships.ts';
import { buildDecisionBrief } from '../src/decision.ts';
import {
  resolveDecisionFrame,
  resolveOrganisationProfiles
} from '../src/organisation.ts';

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

function resolution(name: string, quality: AudienceResolution['quality'] = 'strong'): AudienceResolution {
  return {
    id: `aud-${name}`,
    name,
    query: name,
    status: 'resolved',
    quality,
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
    limitations: []
  };
}

function claim(id: string): EvidenceClaim {
  return {
    id,
    stage: 'relationship_analysis',
    claim: 'A scored Qloo relationship exists.',
    evidenceType: 'qloo_affinity',
    source: 'qloo',
    quality: 'strong',
    scope: { audienceIds: [] },
    qlooRefs: [],
    localRefs: [],
    supporting: [],
    limitations: [],
    validationRequired: []
  };
}

function qloo(overrides: Partial<QlooContext> = {}): QlooContext {
  return {
    source: 'live',
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

function location(overrides: Partial<LocationContext> = {}): LocationContext {
  return {
    query: 'Clerkenwell, London',
    evidenceQuality: 'strong',
    pois: [{ name: 'Brilliant Corners', category: 'bar' }],
    notes: [],
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

test('evidence gate fails closed when Qloo has no live evidence', () => {
  const failed = qloo({
    source: 'failed',
    affinities: [],
    insufficient: true,
    failure: {
      kind: 'authentication',
      message: 'Invalid API key',
      retryable: false,
      environment: 'production'
    }
  });
  const result = buildEvidenceGate({
    llmAvailable: true,
    location: location(),
    qloo: failed,
    project: project()
  });

  assert.equal(result.allowConfidentRecommendation, false);
  assert.equal(result.qlooStatus, 'failed');
  assert.match(result.blockedReason || '', /Invalid API key/);
});

test('evidence gate blocks unresolved audiences even with scored affinities', () => {
  const unresolved = resolution('Unresolved audience', 'unresolved');
  unresolved.status = 'unresolved';
  const result = buildEvidenceGate({
    llmAvailable: true,
    location: location(),
    qloo: qloo({ audienceResolutions: [unresolved] }),
    project: project()
  });

  assert.equal(result.allowConfidentRecommendation, false);
  assert.match(result.blockedReason || '', /unresolved/i);
});

test('evidence gate allows a confident recommendation only when all prerequisites hold', () => {
  const result = buildEvidenceGate({
    llmAvailable: true,
    location: location(),
    qloo: qloo(),
    project: project()
  });

  assert.equal(result.allowConfidentRecommendation, true);
  assert.equal(result.qlooStatus, 'ready');
  assert.equal(result.evidenceSummary?.canRecommend, true);
});

test('a shared affinity across audiences becomes a local expression relationship', () => {
  const result = deriveCulturalRelationships({
    audiences: [resolution('Design-aware diners'), resolution('Clerkenwell residents')],
    pois: [{ name: 'Brilliant Corners', category: 'bar' }],
    placeAffinities: [],
    placeLabel: 'Clerkenwell',
    environment: 'live'
  });

  assert.equal(result.relationships.length, 1);
  assert.equal(result.relationships[0].relationshipType, 'local_expression');
  assert.equal(result.relationships[0].audienceIds.length, 2);
  assert.ok(result.relationships[0].evidenceClaimIds.length > 0);
  assert.equal(result.claims[0].sourceEnvironment, 'live');
});

test('decision briefs share evidence but frame deliverables for the primary profile', () => {
  const base = project();
  const { profiles, primaryProfileId } = resolveOrganisationProfiles(base);
  const frame = resolveDecisionFrame(base);
  const relationships = deriveCulturalRelationships({
    audiences: [resolution('Design-aware diners')],
    placeAffinities: [],
    placeLabel: 'Clerkenwell',
    environment: 'live'
  });

  const brief = buildDecisionBrief({
    project: base,
    frame,
    profiles,
    primaryProfileId,
    location: location(),
    qloo: qloo(),
    relationships: relationships.relationships,
    opportunities: [],
    claims: relationships.claims,
    gate: gate()
  });

  assert.ok(brief.deliverables.length > 0);
  assert.equal(brief.relationships.length, relationships.relationships.length);
  assert.equal(brief.primaryProfileId, primaryProfileId);

  const retail = project({
    organisationProfiles: [
      { id: 'retail', type: 'retail', name: 'Retail brand', primary: true, deliverables: [] }
    ],
    primaryProfileId: 'retail'
  });
  const retailResolved = resolveOrganisationProfiles(retail);
  const retailBrief = buildDecisionBrief({
    project: retail,
    frame: resolveDecisionFrame(retail),
    profiles: retailResolved.profiles,
    primaryProfileId: retailResolved.primaryProfileId,
    location: location(),
    qloo: qloo(),
    relationships: relationships.relationships,
    opportunities: [],
    claims: relationships.claims,
    gate: gate()
  });

  assert.deepEqual(retailBrief.relationships, brief.relationships);
  assert.notDeepEqual(
    retailBrief.deliverables.map((deliverable) => deliverable.type),
    brief.deliverables.map((deliverable) => deliverable.type)
  );
});
