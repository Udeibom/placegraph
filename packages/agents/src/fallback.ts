import { generateId } from '@placegraph/core';
import type {
  AnalysisSnapshot,
  ArchitecturalDecision,
  CulturalLandscape,
  ExperienceRequirement,
  Opportunity,
  Project,
  SpatialConcept,
  Strategy
} from '@placegraph/types';
import { ensureLayout } from './layout';

function locLabel(project: Project): string {
  return (
    project.location.neighborhood ||
    project.location.city ||
    project.location.address ||
    'this location'
  );
}

function audienceLine(project: Project): string {
  if (!project.audiences?.length) return 'people already associated with the area and visitors the project hopes to attract';
  return project.audiences.map((a) => a.name).join(', ');
}

export function fallbackLandscapes(project: Project, snapshot: Pick<AnalysisSnapshot, 'qlooContext' | 'locationContext'>) {
  const place = locLabel(project);
  const pois = snapshot.locationContext?.pois || [];
  const affinities = snapshot.qlooContext?.affinities || [];
  const crowded = summarizeCategories(pois);

  const existing: CulturalLandscape = {
    type: 'existing',
    summary: pois.length
      ? `Around ${place}, observed businesses include ${pois
          .slice(0, 6)
          .map((p) => p.name)
          .join(', ')}. Dominant patterns appear to be ${crowded.join(', ') || 'mixed hospitality and retail'}. This is existing supply, not proof of underlying preference.`
      : `Local commercial inventory for ${place} is incomplete. The existing landscape cannot be treated as a reliable map of demand.`,
    experiences: pois.slice(0, 12).map((p) => ({
      name: p.name,
      category: p.category,
      notes: p.distanceM ? `~${p.distanceM}m from the property` : undefined,
      source: 'local' as const
    })),
    audiencesServed: project.audiences?.map((a) => a.name) || ['Local residents', 'Passers-by'],
    crowdedPatterns: crowded,
    gaps: ['Experiences suggested by cultural affinities but weakly represented in nearby POIs'],
    evidenceQuality: snapshot.locationContext?.evidenceQuality || 'moderate'
  };

  const potential: CulturalLandscape = {
    type: 'potential',
    summary: affinities.length
      ? `Qloo-linked cultural relationships around ${place} include ${affinities
          .slice(0, 5)
          .map((a: any) => a.target)
          .join(', ')}. These are affinities, not a brief to copy those aesthetics.`
      : `Cultural affinity evidence is thin for ${place}. Potential landscape is uncertain.`,
    experiences: affinities.slice(0, 10).map((a: any) => ({
      name: a.target,
      category: a.domain,
      source: 'qloo' as const,
      affinity: a.strength
    })),
    audiencesServed: project.audiences?.map((a) => a.name) || [],
    crowdedPatterns: [],
    gaps: crowded.length ? [`Limited overlap between observed ${crowded[0]} supply and cross-domain affinities`] : [],
    evidenceQuality: snapshot.qlooContext?.insufficient ? 'insufficient' : snapshot.qlooContext?.source === 'live' ? 'strong' : 'moderate'
  };

  const proposed: CulturalLandscape = {
    type: 'proposed',
    summary: `A new ${project.projectType} at ${place} could reinforce the strongest local pattern, occupy cultural whitespace, or become a destination for ${audienceLine(project)}. Which is defensible depends on the objective: ${project.objective}`,
    experiences: [],
    audiencesServed: [],
    crowdedPatterns: [],
    gaps: [],
    evidenceQuality: 'moderate'
  };

  return { existing, potential, proposed };
}

export function fallbackOpportunities(project: Project, runId: string, snapshot: AnalysisSnapshot): Opportunity[] {
  const place = locLabel(project);
  const affinities = (snapshot.qlooContext?.affinities || []).map((a: any) => a.target);
  const pois = snapshot.locationContext?.pois?.map((p) => p.name) || [];
  const cultural = affinities.slice(0, 3).join(', ') || 'adjacent cultural interests';

  return [
    {
      id: generateId('opp'),
      analysisRunId: runId,
      type: 'alignment',
      title: `Local cultural alignment for ${place}`,
      whoServes: project.audiences?.[0]?.name || `People already associated with ${place}`,
      why: `The project can deepen an identity already readable in the surrounding environment rather than competing as a generic ${project.projectType}.`,
      evidenceRefs: pois.slice(0, 5),
      assumptions: ['Existing venues succeed partly because of cultural fit, not only convenience.'],
      uncertainties: ['Whether the apparent local pattern is preference or developer copycatting.'],
      competitors: pois.slice(0, 4),
      rationale: `Align the ${project.projectType} with patterns already present around ${place}, using Qloo only to sharpen who that local culture actually overlaps with.`,
      qlooEstablished: affinities.slice(0, 4),
      locallyEstablished: pois.slice(0, 4),
      inferred: ['Reinforcing the local pattern may be more appropriate than importing a foreign concept.']
    },
    {
      id: generateId('opp'),
      analysisRunId: runId,
      type: 'whitespace',
      title: `Cultural whitespace: ${cultural}`,
      whoServes: audienceLine(project),
      why: `Affinities involving ${cultural} appear relevant, while nearby businesses do not obviously deliver that combination as a physical experience.`,
      evidenceRefs: affinities.slice(0, 5),
      assumptions: ['The affinity cluster is shared enough to support a public commercial environment.'],
      uncertainties: ['Affinity is not demand; feasibility research is still required.'],
      competitors: pois.slice(0, 3),
      rationale: `Compare Qloo relationships against existing supply. The gap is a hypothesis for a differentiated ${project.projectType}, not a mandate.`,
      qlooEstablished: affinities.slice(0, 5),
      locallyEstablished: pois.slice(0, 3),
      inferred: [`Combining ${project.projectType} operations with ${cultural} could be poorly represented locally.`]
    },
    {
      id: generateId('opp'),
      analysisRunId: runId,
      type: 'destination',
      title: `Destination ${project.projectType} for a specific outside audience`,
      whoServes: project.audiences?.find((a) => a.priority === 1)?.name || 'An audience that currently travels elsewhere for this experience',
      why: `The stated objective may require attracting people who are not fully served by what already exists in ${place}.`,
      evidenceRefs: affinities.slice(0, 4),
      assumptions: ['The site can support destination behavior (access, identity, dwell time).'],
      uncertainties: ['Whether the location has enough connection to avoid feeling transplanted.'],
      competitors: pois.slice(0, 4),
      rationale: project.objective,
      qlooEstablished: affinities.slice(0, 4),
      locallyEstablished: pois.slice(0, 3),
      inferred: ['A destination strategy must still belong culturally enough to the place.']
    }
  ];
}

export function fallbackStrategies(project: Project, runId: string, opportunities: Opportunity[]): Strategy[] {
  return opportunities.slice(0, 3).map((op) => ({
    id: generateId('strat'),
    analysisRunId: runId,
    selected: false,
    direction: op.type,
    title: op.title,
    whoServes: op.whoServes,
    why: op.why,
    experienceThesis: `Make ${op.type} tangible: a ${project.projectType} whose spatial sequence, atmosphere and operations exist to serve ${op.whoServes}.`,
    competitors: op.competitors,
    risks: op.uncertainties,
    differentiation: op.type === 'whitespace' ? 'A combination not visibly offered nearby' : op.type === 'destination' ? 'Pull from beyond the immediate catchment' : 'Deeper local cultural fit than copycat peers',
    evidenceRefs: op.evidenceRefs,
    assumptions: op.assumptions,
    uncertainties: op.uncertainties,
    physicalExperience: `Arrival, primary rooms and support spaces should all be judged against: ${op.why}`,
    qlooEstablished: op.qlooEstablished?.[0] || undefined,
    locallyEstablished: op.locallyEstablished?.[0] || undefined,
    inferred: op.inferred?.[0] || undefined,
  }));
}

export function fallbackRequirements(project: Project, strategy: Strategy): ExperienceRequirement[] {
  const rows: Array<Omit<ExperienceRequirement, 'id'>> = [
    {
      strategyId: strategy.id,
      requirement: `Arrival must communicate that this ${project.projectType} is for ${strategy.whoServes}, not a generic fit-out.`,
      rationale: strategy.why,
      priority: 'high',
      source: 'inference',
      zone: 'Arrival'
    },
    {
      strategyId: strategy.id,
      requirement: 'Primary occupied space must support the experience thesis during ordinary operating hours, not only during special programming.',
      rationale: strategy.experienceThesis,
      priority: 'high',
      source: 'inference',
      zone: 'Primary'
    },
    {
      strategyId: strategy.id,
      requirement: 'Where audiences diverge, do not force a homogeneous room; provide complementary zones or acoustic/visual separation.',
      rationale: 'Multiple audiences should not be averaged into one persona.',
      priority: 'high',
      source: 'inference',
      zone: 'Public'
    },
    {
      strategyId: strategy.id,
      requirement: `Operations (service, back-of-house, ${project.projectType === 'hotel' ? 'guest flow' : 'kitchen/stock'}) must remain functional if cultural programming is present.`,
      rationale: 'Cultural intent cannot collapse ordinary commercial function.',
      priority: 'high',
      source: 'operation',
      zone: 'Support'
    },
    {
      strategyId: strategy.id,
      requirement: 'Material, light and furniture direction should be consequences of the strategy, not unrelated aesthetic tags.',
      rationale: strategy.differentiation,
      priority: 'medium',
      source: 'inference',
      zone: 'Atmosphere'
    }
  ];
  if (project.budgetRange) {
    rows.push({
      strategyId: strategy.id,
      requirement: `Concept must remain plausible within budget range ${project.budgetRange}.`,
      rationale: 'Budget is a hard project constraint.',
      priority: 'high',
      source: 'constraint',
      zone: 'Project'
    });
  }
  return rows.map((r) => ({ ...r, id: generateId('req') }));
}

export function fallbackArchitecture(project: Project, strategy: Strategy, requirements: ExperienceRequirement[]) {
  const decisions: ArchitecturalDecision[] = [
    {
      id: generateId('dec'),
      strategyId: strategy.id,
      zone: 'Arrival',
      decision: `A compressed, legible threshold that states the ${strategy.direction} strategy before the main room.`,
      whyChain: [
        { id: generateId('prov'), kind: 'decision', explanation: 'Arrival is the first spatial proof of who the place is for.', refs: [], qlooRefs: [] }
      ],
      alternatives: ['Transparent storefront with no threshold', 'Theatrical arrival that overpromises programming'],
      constraintsConsidered: project.constraints?.map((c) => `${c.key}: ${c.value}`) || [],
      inferred: 'Identity should be readable without relying on signage adjectives.',
      unverified: 'Whether the street condition can support a stronger threshold.'
    },
    {
      id: generateId('dec'),
      strategyId: strategy.id,
      zone: 'Primary',
      decision:
        strategy.direction === 'whitespace'
          ? 'A primary room that can host the underserved cultural combination without becoming an events hall.'
          : strategy.direction === 'destination'
            ? 'A memorable primary sequence designed for longer dwell and visitors who arrived on purpose.'
            : 'A primary room calibrated to local social patterns rather than imported luxury tropes.',
      whyChain: [
        { id: generateId('prov'), kind: 'inference', explanation: strategy.experienceThesis, refs: [], qlooRefs: strategy.evidenceRefs }
      ],
      alternatives: ['Open plan with no hierarchy', 'Theme overlay on a standard plan'],
      constraintsConsidered: [project.floorArea ? `Floor area ${project.floorArea}` : 'Unknown floor area'],
      qlooEstablished: strategy.evidenceRefs.slice(0, 3).join(', ') || undefined,
      inferred: 'Spatial hierarchy should follow audience convergence and divergence.',
      unverified: 'Commercial demand for the cultural combination remains unproven.'
    },
    {
      id: generateId('dec'),
      strategyId: strategy.id,
      zone: 'Support',
      decision: 'Back-of-house and service routes sized so cultural or flexible use never blocks ordinary operations.',
      whyChain: [
        { id: generateId('prov'), kind: 'constraint', explanation: 'Operational integrity is a professional constraint, not an aesthetic preference.', refs: [], qlooRefs: [] }
      ],
      alternatives: ['Borrow service space for guest spectacle'],
      constraintsConsidered: ['Operating model must survive non-event days'],
      inferred: requirements.find((r) => r.source === 'operation')?.requirement
    }
  ];

  const concept: SpatialConcept = {
    organization: `Public identity → primary experience for ${strategy.whoServes} → quieter secondary rooms → operations.`,
    zones: [
      { name: 'Arrival', purpose: 'Cultural and commercial identification', character: 'Legible, not theatrical', adjacency: 'Street / lobby' },
      { name: 'Primary', purpose: strategy.experienceThesis, character: strategy.differentiation, adjacency: 'Arrival' },
      { name: 'Secondary', purpose: 'Complementary audience needs', adjacency: 'Primary' },
      { name: 'Support', purpose: 'Kitchen, service, staff, storage', adjacency: 'Primary (screened)' }
    ],
    materials: ['Tactile, place-specific materials rather than imported luxury kits'],
    lighting: ['Layered ambient light with adjustable scenes if programming is secondary, not primary'],
    furniture: ['Flexible primary seating that still feels complete when not in event mode'],
    circulation: 'One clear public path; service never crosses the primary experience axis.',
    exterior: `Exterior should belong to ${locLabel(project)} while signalling the chosen strategy.`,
    opsNotes: ['This is a preliminary concept for professional development, not a construction set.']
  };

  return { decisions, concept: ensureLayout(project, concept) };
}

function summarizeCategories(pois: { category?: string }[]): string[] {
  const counts = new Map<string, number>();
  for (const p of pois) {
    const c = p.category || 'place';
    counts.set(c, (counts.get(c) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, n]) => `${k} (${n})`);
}
