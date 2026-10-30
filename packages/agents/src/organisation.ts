import type {
  DecisionFrame,
  OrganisationProfile,
  OrganisationProfileType,
  Project
} from '@placegraph/types';

const PROFILE_LABELS: Record<OrganisationProfileType, string> = {
  developer: 'Developer',
  hospitality: 'Hospitality group',
  retail: 'Retail brand',
  operator: 'Operator',
  facility: 'Facility operator',
  investor: 'Investor',
  mixed_use: 'Mixed-use owner',
  other: 'Decision owner'
};

const PROFILE_DELIVERABLES: Record<OrganisationProfileType, string[]> = {
  developer: ['investment_hypothesis', 'spatial_brief', 'evidence_gaps'],
  hospitality: ['concept_identity', 'fb_daypart_implications', 'programming_model'],
  retail: ['category_format_test', 'community_fit', 'local_collaboration_test'],
  operator: ['programming_model', 'experience_mix', 'tenant_rationale'],
  facility: ['utilisation_model', 'audience_mix', 'programming_model'],
  investor: ['underwriting_implications', 'evidence_risk', 'validation_plan'],
  mixed_use: ['mix_and_adjacency', 'audience_compatibility', 'spatial_brief'],
  other: ['decision_brief', 'evidence_gaps', 'next_investigation']
};

function fromLegacyOperator(operatorType: Project['operatorType']): OrganisationProfileType {
  if (operatorType === 'hospitality') return 'hospitality';
  if (operatorType === 'retail') return 'retail';
  if (operatorType === 'operator') return 'operator';
  if (operatorType === 'developer') return 'developer';
  return 'other';
}

export function resolveOrganisationProfiles(project: Project): {
  profiles: OrganisationProfile[];
  primaryProfileId?: string;
} {
  if (project.organisationProfiles?.length) {
    const profiles = project.organisationProfiles.map((profile) => ({
      ...profile,
      deliverables: profile.deliverables?.length
        ? profile.deliverables
        : PROFILE_DELIVERABLES[profile.type] || PROFILE_DELIVERABLES.other
    }));
    const primary =
      profiles.find((profile) => profile.id === project.primaryProfileId) ||
      profiles.find((profile) => profile.primary) ||
      profiles[0];
    return { profiles, primaryProfileId: primary?.id };
  }

  const type = fromLegacyOperator(project.operatorType);
  const id = `profile-${type}`;
  return {
    profiles: [
      {
        id,
        type,
        name: PROFILE_LABELS[type],
        primary: true,
        mandate: project.objective,
        deliverables: PROFILE_DELIVERABLES[type]
      }
    ],
    primaryProfileId: id
  };
}

export function resolveDecisionFrame(project: Project): DecisionFrame {
  if (project.decisionFrame) return project.decisionFrame;

  const type: DecisionFrame['type'] =
    project.mode === 'discover'
      ? 'develop'
      : project.operatorType === 'retail'
        ? 'store_format'
        : project.operatorType === 'operator'
          ? 'utilisation'
          : project.operatorType === 'developer'
            ? 'develop'
            : project.operatorType === 'hospitality'
              ? 'establish'
              : project.concept?.format
                ? 'establish'
                : 'other';

  return {
    type,
    subject: project.businessType || project.name,
    capitalIntent: project.investmentIntent || project.budgetRange,
    successTests: [],
    constraints: (project.constraints || []).map((constraint) => `${constraint.key}: ${constraint.value}`)
  };
}

export function decisionTypeLabel(type: DecisionFrame['type']): string {
  const labels: Record<DecisionFrame['type'], string> = {
    develop: 'Develop a new proposition',
    establish: 'Establish a concept',
    enter_market: 'Enter a market',
    tenant_mix: 'Set a tenant mix',
    reposition: 'Reposition an asset',
    adapt: 'Adapt an existing business',
    store_format: 'Choose a store format',
    utilisation: 'Improve space utilisation',
    audience_choice: 'Choose a target audience',
    other: 'Capital decision'
  };
  return labels[type];
}
