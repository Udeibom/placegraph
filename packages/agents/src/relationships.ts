import type {
  AudienceResolution,
  CulturalRelationship,
  EvidenceClaim,
  EvidenceQuality
} from '@placegraph/types';
import type { QlooAffinity } from '@placegraph/qloo';
import { normalizeQlooId } from '@placegraph/qloo';
import { generateId } from '@placegraph/core';
import { makeEvidenceClaim } from './claim';

function strongestQuality(rows: AudienceResolution[]): EvidenceQuality {
  if (rows.some((row) => row.quality === 'strong')) return 'strong';
  if (rows.some((row) => row.quality === 'moderate')) return 'moderate';
  if (rows.some((row) => row.quality === 'approximate')) return 'approximate';
  if (rows.some((row) => row.quality === 'unresolved')) return 'unresolved';
  return 'insufficient';
}

function normalizedName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchLocal(target: string, pois: { name: string; category?: string }[]): string[] {
  const needle = normalizedName(target);
  if (!needle) return [];
  return pois
    .filter((poi) => {
      const name = normalizedName(poi.name);
      if (name.length < 4) return false;
      if (name === needle) return true;
      const shorter = name.length <= needle.length ? name : needle;
      const longer = name.length > needle.length ? name : needle;
      return shorter.length >= 5 && ` ${longer} `.includes(` ${shorter} `);
    })
    .map((poi) => poi.name)
    .slice(0, 3);
}

function affinityRows(audiences: AudienceResolution[]): Array<{
  target: string;
  score: number;
  seedCount: number;
  audienceIds: string[];
  audienceNames: string[];
  urn?: string;
  targetId?: string;
}> {
  const grouped = new Map<
    string,
    {
      target: string;
      score: number;
      seedCount: number;
      audienceIds: string[];
      audienceNames: string[];
      urn?: string;
      targetId?: string;
    }
  >();

  for (const audience of audiences) {
    for (const affinity of audience.affinities) {
      const key = normalizeQlooId(affinity.urn || affinity.targetId) || affinity.target.toLowerCase();
      const existing = grouped.get(key);
      if (existing) {
        existing.audienceIds.push(audience.id);
        existing.audienceNames.push(audience.name);
        existing.score = Math.max(existing.score, affinity.strength);
        existing.seedCount = Math.max(existing.seedCount, affinity.seedCount);
      } else {
        grouped.set(key, {
          target: affinity.target,
          score: affinity.strength,
          seedCount: affinity.seedCount,
          audienceIds: [audience.id],
          audienceNames: [audience.name],
          urn: affinity.urn,
          targetId: affinity.targetId
        });
      }
    }
  }

  return [...grouped.values()].sort((a, b) => {
    if (b.audienceIds.length !== a.audienceIds.length) {
      return b.audienceIds.length - a.audienceIds.length;
    }
    return b.score - a.score;
  });
}

export function deriveCulturalRelationships(input: {
  audiences: AudienceResolution[];
  pois?: { name: string; category?: string }[];
  placeAffinities?: QlooAffinity[];
  crossDomain?: any;
  placeLabel: string;
  environment?: string;
}): { relationships: CulturalRelationship[]; claims: EvidenceClaim[] } {
  const relationships: CulturalRelationship[] = [];
  const claims: EvidenceClaim[] = [];
  const known = new Set<string>();

  for (const row of affinityRows(input.audiences)) {
    const peers = input.audiences.filter((audience) => row.audienceIds.includes(audience.id));
    const localMatches = matchLocal(row.target, input.pois || []);
    const shared = row.audienceIds.length > 1;
    const quality = shared ? strongestQuality(peers) : strongestQuality(peers);
    const type = localMatches.length
      ? 'local_expression'
      : shared
        ? 'shared_affinity'
        : 'complementary_affinity';

    const claim = makeEvidenceClaim({
      stage: 'relationship_analysis',
      claim: `Qloo associates ${row.target} with ${row.audienceNames.join(', ')}${input.placeLabel ? ` around ${input.placeLabel}` : ''}.`,
      evidenceType: 'qloo_affinity',
      source: 'qloo',
      quality,
      scope: {
        place: input.placeLabel,
        audienceIds: row.audienceIds
      },
      confidence: shared ? 0.72 : 0.58,
      qlooRefs: [row.urn, row.targetId].filter((value): value is string => Boolean(value)),
      localRefs: localMatches,
      supporting: [
        `Affinity score: ${row.score.toFixed(3)}`,
        `Supported by ${row.seedCount} seed${row.seedCount === 1 ? '' : 's'}`,
        shared ? `Shared across ${row.audienceIds.length} audiences` : 'Observed for one audience'
      ],
      limitations: [
        'Affinity is a cultural relationship, not demand.',
        ...(localMatches.length
          ? []
          : ['No matching local business was found in the available POI inventory.'])
      ],
      interpretation: shared
        ? 'This is a convergence point across audience profiles.'
        : 'This relationship is specific to one audience profile.',
      implication: localMatches.length
        ? 'The relationship already has some local expression; test depth and execution rather than absence.'
        : 'The relationship may be under-expressed locally, but local inventory is incomplete.',
      validationRequired: [
        'Validate whether the relationship translates into visits, spend, or participation.',
        'Check local supply beyond the available POI inventory.'
      ],
      sourceEnvironment: input.environment
    });
    claims.push(claim);

    const key = `${row.target.toLowerCase()}|${type}`;
    if (!known.has(key)) {
      known.add(key);
      relationships.push({
        id: generateId('rel'),
        subject: shared ? 'Shared audience relationship' : peers[0]?.name || 'Audience',
        object: row.target,
        relationshipType: type,
        audienceIds: row.audienceIds,
        score: row.score,
        seedCount: row.seedCount,
        evidenceType: 'qloo_affinity',
        quality,
        interpretation: claim.interpretation || '',
        commercialRelevance: localMatches.length
          ? `Already visible locally at ${localMatches.join(', ')}; the decision is about depth, format, and differentiation.`
          : 'Potentially underexpressed in the local inventory; test demand before capital commitment.',
        limitations: claim.limitations,
        evidenceClaimIds: [claim.id]
      });
    }
  }

  for (const affinity of input.placeAffinities || []) {
    const key = normalizeQlooId(affinity.urn || affinity.targetId) || affinity.target.toLowerCase();
    if ([...known].some((entry) => entry.startsWith(`${affinity.target.toLowerCase()}|`))) continue;
    const localMatches = matchLocal(affinity.target, input.pois || []);
    const claim = makeEvidenceClaim({
      stage: 'relationship_analysis',
      claim: `Qloo returned a scored place affinity between ${input.placeLabel} and ${affinity.target}.`,
      evidenceType: 'qloo_affinity',
      source: 'qloo',
      quality: affinity.strength >= 0.5 ? 'moderate' : 'approximate',
      scope: { place: input.placeLabel, audienceIds: [] },
      confidence: 0.5,
      qlooRefs: [affinity.urn, affinity.targetId, key].filter((value): value is string => Boolean(value)),
      localRefs: localMatches,
      supporting: [`Affinity score: ${affinity.strength.toFixed(3)}`],
      limitations: [
        'Place-level affinity is not audience-specific.',
        'Affinity is not demand.'
      ],
      interpretation: 'The place anchor has a cultural relationship with this entity.',
      implication: 'Use as context, not as proof that an audience wants it.',
      validationRequired: ['Confirm the relationship with audience-specific evidence.'],
      sourceEnvironment: input.environment
    });
    claims.push(claim);
    const relationshipKey = `${affinity.target.toLowerCase()}|place`;
    if (!known.has(relationshipKey)) {
      known.add(relationshipKey);
      relationships.push({
        id: generateId('rel'),
        subject: input.placeLabel || 'Place',
        object: affinity.target,
        relationshipType: localMatches.length ? 'local_expression' : 'cross_domain',
        audienceIds: [],
        score: affinity.strength,
        seedCount: affinity.seedCount ?? 1,
        evidenceType: 'qloo_affinity',
        quality: claim.quality,
        interpretation: claim.interpretation || '',
        commercialRelevance: 'Context for place character; not sufficient for an audience-specific decision.',
        limitations: claim.limitations,
        evidenceClaimIds: [claim.id]
      });
    }
  }

  const cross = input.crossDomain?.results;
  if (cross && !Array.isArray(cross)) {
    for (const [domain, rows] of Object.entries(cross)) {
      if (!Array.isArray(rows)) continue;
      for (const raw of rows.slice(0, 5)) {
        const affinity = raw as QlooAffinity;
        const key = `${affinity.target?.toLowerCase()}|cross|${domain}`;
        if (!affinity.target || known.has(key)) continue;
        const claim = makeEvidenceClaim({
          stage: 'cross_domain',
          claim: `Qloo returned a scored ${domain} affinity for ${affinity.target}.`,
          evidenceType: 'qloo_affinity',
          source: 'qloo',
          quality: affinity.strength >= 0.5 ? 'moderate' : 'approximate',
          scope: { place: input.placeLabel, audienceIds: [] },
          confidence: 0.45,
          qlooRefs: [affinity.urn, affinity.targetId].filter((value): value is string => Boolean(value)),
          supporting: [`Affinity score: ${affinity.strength.toFixed(3)}`],
          limitations: [
            'Cross-domain affinity is not demand or a licence to copy the reference.',
            'Cross-domain evidence is less specific than place affinity.'
          ],
          interpretation: 'A broader cultural relationship associated with the place anchor.',
          implication: 'Use as creative context only; do not present it as local demand.',
          validationRequired: ['Test whether the reference is meaningful to the specified audiences.'],
          sourceEnvironment: input.environment
        });
        claims.push(claim);
        known.add(key);
        relationships.push({
          id: generateId('rel'),
          subject: input.placeLabel || 'Place',
          object: affinity.target,
          relationshipType: 'cross_domain',
          audienceIds: [],
          score: affinity.strength,
          seedCount: affinity.seedCount ?? 1,
          evidenceType: 'qloo_affinity',
          quality: claim.quality,
          interpretation: claim.interpretation || '',
          commercialRelevance: 'Creative context for concept and programming; not a demand claim.',
          limitations: claim.limitations,
          evidenceClaimIds: [claim.id]
        });
      }
    }
  }

  return { relationships, claims };
}
