import type { FloorPlanReading, Project, SpatialConcept, SpatialLayoutRoom } from '@placegraph/types';

export function defaultLayout(project: Project, concept?: SpatialConcept, floorPlan?: FloorPlanReading): SpatialLayoutRoom[] {
  if (concept?.layout?.length) return concept.layout;
  if (floorPlan?.rooms?.length) {
    const n = floorPlan.rooms.length;
    return floorPlan.rooms.map((room, i) => ({
      name: room.name,
      purpose: room.notes,
      x: 4 + (i % 2) * 48,
      y: 8 + Math.floor(i / 2) * (80 / Math.max(1, Math.ceil(n / 2))),
      w: 44,
      h: Math.min(36, 76 / Math.max(1, Math.ceil(n / 2)))
    }));
  }

  const type = project.projectType;
  if (type === 'hotel') {
    return [
      { name: 'Arrival / lobby', purpose: 'Identity and shared audience ground', x: 4, y: 8, w: 54, h: 36 },
      { name: 'Restaurant / bar', purpose: 'Public F&B', x: 60, y: 8, w: 36, h: 36 },
      { name: 'Event / complementary', purpose: 'Divergent audience needs', x: 4, y: 48, w: 36, h: 44 },
      { name: 'Back of house', purpose: 'Operations', x: 42, y: 48, w: 54, h: 44 }
    ];
  }
  if (type === 'retail') {
    return [
      { name: 'Threshold', purpose: 'Street identity', x: 4, y: 8, w: 18, h: 84 },
      { name: 'Primary merchandise', purpose: 'Core offer', x: 24, y: 8, w: 48, h: 54 },
      { name: 'Secondary / discovery', purpose: 'Complementary audience', x: 74, y: 8, w: 22, h: 54 },
      { name: 'Service / stock', purpose: 'Operations', x: 24, y: 66, w: 72, h: 26 }
    ];
  }
  return [
    { name: 'Arrival', purpose: 'Cultural identification', x: 4, y: 8, w: 22, h: 84 },
    { name: 'Primary', purpose: 'Core dining / experience', x: 28, y: 8, w: 46, h: 58 },
    { name: 'Secondary', purpose: 'Complementary or quieter room', x: 76, y: 8, w: 20, h: 58 },
    { name: 'Support', purpose: 'Kitchen and service', x: 28, y: 70, w: 68, h: 22 }
  ];
}

export function ensureLayout(project: Project, concept: SpatialConcept, floorPlan?: FloorPlanReading): SpatialConcept {
  return {
    ...concept,
    layout: defaultLayout(project, concept, floorPlan)
  };
}
