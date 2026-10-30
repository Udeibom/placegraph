import type {
  CulturalRelationship,
  DecisionBrief,
  DecisionDeliverable,
  DecisionFrame,
  EvidenceClaim,
  EvidenceGate,
  LocationContext,
  Opportunity,
  OrganisationProfile,
  Project,
  QlooContext
} from '@placegraph/types';
import { generateId } from '@placegraph/core';
import { decisionTypeLabel } from './organisation';

function deliverable(
  type: string,
  title: string,
  body: string,
  evidenceClaimIds: string[],
  limitations: string[]
): DecisionDeliverable {
  return {
    id: generateId('deliv'),
    type,
    title,
    body,
    evidenceClaimIds,
    limitations
  };
}

function linksFor(profile: OrganisationProfile, claims: EvidenceClaim[]): string[] {
  const types = new Set(profile.deliverables);
  if (!types.size) return claims.slice(0, 6).map((claim) => claim.id);
  return claims
    .filter((claim) => {
      if (types.has('spatial_brief') && claim.stage === 'relationship_analysis') return true;
      if (types.has('evidence_risk') && claim.quality !== 'strong') return true;
      if (types.has('programming_model') && claim.evidenceType === 'qloo_affinity') return true;
      if (types.has('category_format_test') && claim.evidenceType === 'qloo_affinity') return true;
      return false;
    })
    .slice(0, 8)
    .map((claim) => claim.id);
}

function profileDeliverables(
  profile: OrganisationProfile,
  input: {
    project: Project;
    frame: DecisionFrame;
    relationships: CulturalRelationship[];
    opportunities: Opportunity[];
    claims: EvidenceClaim[];
    location?: LocationContext;
  }
): DecisionDeliverable[] {
  const topRelationships = input.relationships.slice(0, 4).map((relationship) => relationship.object);
  const opportunityTitles = input.opportunities.slice(0, 4).map((opportunity) => opportunity.title);
  const links = linksFor(profile, input.claims);
  const limitations = ['Projection of shared evidence; this deliverable adds framing, not new cultural facts.'];

  if (profile.type === 'developer') {
    return [
      deliverable(
        'investment_hypothesis',
        'Investment hypothesis',
        `${decisionTypeLabel(input.frame.type)} for ${input.frame.subject || input.project.name}. The defensible hypothesis depends on ${topRelationships.join(', ') || 'relationships that are not yet established'}.`,
        links,
        limitations
      ),
      deliverable(
        'spatial_brief',
        'Spatial brief starting point',
        opportunityTitles.length
          ? `Translate only after selecting one opportunity: ${opportunityTitles.join('; ')}.`
          : 'No opportunity has passed the evidence gate, so no spatial brief should be issued yet.',
        links,
        [...limitations, 'Geometry and floor area remain site constraints, not Qloo outputs.']
      ),
      deliverable(
        'evidence_gaps',
        'Evidence gaps before capital commitment',
        'Validate demand, spend, operational feasibility, and the unresolved audience questions before treating the hypothesis as an investment case.',
        input.claims.filter((claim) => claim.quality !== 'strong').slice(0, 6).map((claim) => claim.id),
        limitations
      )
    ];
  }

  if (profile.type === 'hospitality') {
    return [
      deliverable(
        'concept_identity',
        'Concept identity hypothesis',
        `The concept should express the strongest shared relationship (${topRelationships[0] || 'not established'}) without copying the reference literally.`,
        links,
        limitations
      ),
      deliverable(
        'fb_daypart_implications',
        'F&B and daypart implications',
        'Use the relationship mix to frame food, beverage, and daypart hypotheses; validate them against local supply and operating constraints.',
        links,
        [...limitations, 'Qloo does not establish kitchen feasibility, licences, or willingness to pay.']
      ),
      deliverable(
        'programming_model',
        'Programming model',
        'Programme only the relationships that are supported by scored affinities. Do not turn a cultural reference into an events strategy without separate evidence.',
        links,
        limitations
      )
    ];
  }

  if (profile.type === 'retail') {
    return [
      deliverable(
        'category_format_test',
        'Category and format test',
        `Test categories connected to ${topRelationships.join(', ') || 'the unresolved relationship set'} against catchment, spend, and supply.`,
        links,
        [...limitations, 'Affinity does not establish product demand or price point.']
      ),
      deliverable(
        'community_fit',
        'Community fit',
        'Position relative to existing local expression rather than treating cultural affinity as permission to transplant a format.',
        links,
        limitations
      ),
      deliverable(
        'local_collaboration_test',
        'Local collaboration test',
        'Use local POIs and relationships to identify collaboration hypotheses, then verify commercial fit and availability.',
        links,
        limitations
      )
    ];
  }

  if (profile.type === 'operator' || profile.type === 'facility') {
    return [
      deliverable(
        'programming_model',
        'Programming model hypothesis',
        input.opportunities.length
          ? `Programme against the selected opportunity only: ${opportunityTitles[0]}.`
          : 'No evidence-qualified opportunity is available to programme against.',
        links,
        limitations
      ),
      deliverable(
        'experience_mix',
        'Experience mix',
        `Balance shared and audience-specific relationships: ${topRelationships.join(', ') || 'none established'}.`,
        links,
        limitations
      ),
      deliverable(
        'tenant_rationale',
        'Tenant rationale',
        'Tenant categories should be projections of the shared evidence, not a separate cultural analysis.',
        links,
        limitations
      )
    ];
  }

  if (profile.type === 'investor') {
    return [
      deliverable(
        'underwriting_implications',
        'Underwriting implications',
        'Separate cultural fit from demand, revenue, cost, and delivery risk. Cultural affinity is not an underwriting assumption.',
        links,
        limitations
      ),
      deliverable(
        'evidence_risk',
        'Evidence risk',
        'Treat unresolved audiences and failed or insufficient Qloo stages as diligence items, not footnotes.',
        input.claims.filter((claim) => claim.quality !== 'strong').slice(0, 8).map((claim) => claim.id),
        limitations
      ),
      deliverable(
        'validation_plan',
        'Validation plan',
        'Commission demand, catchment, competitor, and operational validation before relying on the cultural hypothesis.',
        links,
        limitations
      )
    ];
  }

  return [
    deliverable(
      'decision_brief',
      'Decision brief',
      `${decisionTypeLabel(input.frame.type)} for ${input.frame.subject || input.project.name}. ${topRelationships.length ? `The strongest cultural relationships are ${topRelationships.join(', ')}.` : 'No cultural relationship is strong enough to frame the decision yet.'}`,
      links,
      limitations
    ),
    deliverable(
      'evidence_gaps',
      'Evidence gaps',
      'Resolve the listed uncertainties before presenting the cultural hypothesis as a recommendation.',
      input.claims.filter((claim) => claim.quality !== 'strong').slice(0, 6).map((claim) => claim.id),
      limitations
    )
  ];
}

export function buildDecisionBrief(input: {
  project: Project;
  frame: DecisionFrame;
  profiles: OrganisationProfile[];
  primaryProfileId?: string;
  location?: LocationContext;
  qloo: QlooContext;
  relationships: CulturalRelationship[];
  opportunities: Opportunity[];
  claims: EvidenceClaim[];
  gate: EvidenceGate;
}): DecisionBrief {
  const primary =
    input.profiles.find((profile) => profile.id === input.primaryProfileId) ||
    input.profiles.find((profile) => profile.primary) ||
    input.profiles[0];
  const place = input.project.location.neighborhood || input.project.location.city || input.project.name;
  const resolved = (input.qloo.audienceResolutions || []).filter((audience) => audience.status === 'resolved');
  const approximate = (input.qloo.audienceResolutions || []).filter((audience) => audience.status === 'approximate');
  const unresolved = (input.qloo.audienceResolutions || []).filter(
    (audience) => audience.status === 'unresolved' || audience.status === 'failed'
  );
  const topRelationships = input.relationships.slice(0, 5);
  const eligibleOpportunities = input.opportunities.filter(
    (opportunity) => opportunity.eligible !== false && input.gate.allowConfidentRecommendation
  );

  const uncertainty = [
    ...input.gate.warnings,
    ...unresolved.flatMap((audience) => audience.limitations),
    ...input.relationships.flatMap((relationship) => relationship.limitations)
  ];

  const opportunityValidation = input.opportunities.flatMap(
    (opportunity) => opportunity.validationRequirements || []
  );
  const nextInvestigation = [
    ...(input.gate.evidenceSummary?.whatWouldResolveIt || []),
    ...(opportunityValidation.length
      ? opportunityValidation
      : ['Validate demand, spend, participation, and operational feasibility before capital commitment.'])
  ];

  return {
    mode: input.project.mode,
    frame: input.frame,
    profiles: input.profiles,
    primaryProfileId: primary?.id,
    placeSummary: `${place}. Local evidence quality: ${input.location?.evidenceQuality || 'insufficient'}. ${input.location?.pois?.length || 0} nearby places observed.`,
    audienceSummary: `${resolved.length} resolved, ${approximate.length} approximate, ${unresolved.length} unresolved or failed audience profiles.`,
    culturalSummary: input.relationships.length
      ? `${input.relationships.length} cultural relationships derived from scored Qloo affinities. Strongest: ${topRelationships.map((relationship) => relationship.object).join(', ')}.`
      : 'No cultural relationship has been established from scored Qloo affinities.',
    relationships: input.relationships,
    opportunityIds: eligibleOpportunities.map((opportunity) => opportunity.id),
    uncertainty: [...new Set(uncertainty)].slice(0, 20),
    nextInvestigation: [...new Set(nextInvestigation)].slice(0, 20),
    deliverables: primary
      ? profileDeliverables(primary, {
          project: input.project,
          frame: input.frame,
          relationships: input.relationships,
          opportunities: eligibleOpportunities,
          claims: input.claims,
          location: input.location
        })
      : []
  };
}
