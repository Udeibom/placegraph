import type { FloorPlanReading, Project } from '@placegraph/types';
import { parseJsonFromLlm } from '@placegraph/core';
import type { LLMProvider } from './providers/llm';

const SPATIAL_KEYWORDS: Array<{ keys: string[]; name: string; notes: string }> = [
  { keys: ['kitchen', 'prep', 'cooking'],    name: 'Kitchen',          notes: 'Food preparation' },
  { keys: ['dining', 'restaurant', 'seats'], name: 'Dining room',      notes: 'Primary guest experience' },
  { keys: ['bar', 'drinks', 'counter'],      name: 'Bar / counter',    notes: 'Beverage service' },
  { keys: ['entrance', 'entry', 'lobby', 'reception'], name: 'Entrance / lobby', notes: 'Arrival threshold' },
  { keys: ['outdoor', 'terrace', 'garden', 'external'], name: 'Outdoor space', notes: 'External area' },
  { keys: ['private', 'event', 'function'], name: 'Private dining',    notes: 'Bookable event space' },
  { keys: ['storage', 'store', 'cellar'],   name: 'Storage',           notes: 'Back of house storage' },
  { keys: ['toilet', 'wc', 'bathroom'],     name: 'Toilets',           notes: 'Amenities' },
  { keys: ['office', 'admin', 'manager'],   name: 'Office / admin',    notes: 'Staff administration' },
];

function inferRoomsFromConstraints(project: Project): FloorPlanReading['rooms'] {
  const all = project.constraints.map((c) => `${c.key} ${c.value}`.toLowerCase());
  const found: FloorPlanReading['rooms'] = [];
  const seen = new Set<string>();

  for (const entry of SPATIAL_KEYWORDS) {
    if (entry.keys.some((k) => all.some((s) => s.includes(k)))) {
      if (!seen.has(entry.name)) {
        found.push({ name: entry.name, notes: entry.notes });
        seen.add(entry.name);
      }
    }
  }

  return found;
}

function briefReading(project: Project): FloorPlanReading {
  // Try to infer rooms from constraints first
  const constraintRooms = inferRoomsFromConstraints(project);

  const defaultRooms: FloorPlanReading['rooms'] =
    constraintRooms.length > 0
      ? constraintRooms
      : project.projectType === 'hotel'
      ? [
          { name: 'Lobby / arrival', notes: 'Public identity' },
          { name: 'F&B', notes: 'Restaurant and bar' },
          { name: 'Support', notes: 'BOH, admin' },
        ]
      : project.projectType === 'retail'
      ? [
          { name: 'Sales floor', notes: 'Primary merchandise' },
          { name: 'Stock / service', notes: 'Back of house' },
        ]
      : [
          { name: 'Arrival', notes: 'Threshold from street' },
          { name: 'Primary room', notes: 'Main occupied experience' },
          { name: 'Support', notes: 'Kitchen / service' },
        ];

  const constraints = [
    ...(project.floorArea ? [`Declared floor area: ${project.floorArea}`] : []),
    ...project.constraints.map((c) => `${c.key}: ${c.value}`),
  ];

  if (!project.floorPlanUrl && !project.floorArea && !constraints.length) {
    return {
      source: 'none',
      summary: 'No floor plan or dimensional brief was provided. Spatial proposals are typological, not site-specific.',
      rooms: [],
      constraints: [],
      usable: false,
    };
  }

  const source = constraintRooms.length > 0 ? 'brief' : 'brief';
  const summary = constraintRooms.length > 0
    ? `Spatial organisation inferred from brief constraints for ${project.name}. Rooms are derived from constraint descriptions, not from a drawing.`
    : project.floorPlanUrl
    ? `A floor plan image was uploaded for ${project.name}${project.floorArea ? ` (${project.floorArea})` : ''}. Without a successful vision pass, architecture uses the brief and typical ${project.projectType} organisation.`
    : `No plan drawing. Preliminary organisation is inferred from a ${project.projectType} brief${project.floorArea ? ` of ${project.floorArea}` : ''}.`;

  return {
    source,
    summary,
    rooms: defaultRooms,
    constraints,
    usable: Boolean(project.floorArea || project.floorPlanUrl || project.constraints.length),
  };
}

const VISION_PROMPT = (project: Project) => `You are reading a commercial floor plan drawing for PlaceGraph.

Project type: ${project.projectType}
Floor area: ${project.floorArea || 'unknown'}

Return JSON only, no markdown:
{
  "summary": "description of what the drawing shows — include structure, entry points, ceiling notes, split levels, and likely room uses",
  "rooms": [
    {
      "name": "Room name as shown in the drawing",
      "notes": "spatial notes",
      "approxShare": 0.25
    }
  ],
  "structuralFeatures": ["list of visible structural features — columns, load-bearing walls, existing openings"],
  "accessPoints": ["main entrance", "service entrance", "fire exits"],
  "ceilingNotes": "any visible notes about ceiling height, levels, or split levels",
  "constraints": ["structural or operational observations"]
}

Rules:
- approxShare is approximate percentage of total floor area (0–1, all rooms should sum to ~1.0)
- Do not invent rooms that are not evidenced in the drawing
- If the image is unclear or ambiguous, note that in summary
- This is a reading, not a design`;

export async function readFloorPlan(project: Project, llm: LLMProvider): Promise<FloorPlanReading> {
  const fallback = briefReading(project);
  const image    = project.floorPlanUrl;

  if (!image || !image.startsWith('data:image') || !llm.available) return fallback;

  if (image.length > 3_500_000) {
    return {
      ...fallback,
      summary: `${fallback.summary} The uploaded image was too large for vision analysis (>${Math.round(image.length / 1e6)}MB).`,
    };
  }

  try {
    const content = await llm.completeVision(VISION_PROMPT(project), image);
    const parsed  = parseJsonFromLlm<any>(content, null);

    if (!parsed || !parsed.summary) return fallback;

    const rooms = Array.isArray(parsed.rooms) ? parsed.rooms : fallback.rooms;
    const constraints = [
      ...fallback.constraints,
      ...(parsed.constraints ?? []),
      ...(parsed.structuralFeatures ?? []),
      ...(parsed.accessPoints ?? []),
      ...(parsed.ceilingNotes ? [`Ceiling: ${parsed.ceilingNotes}`] : []),
    ];

    return {
      source: 'vision',
      summary: parsed.summary,
      rooms,
      constraints,
      usable: true,
    };
  } catch {
    return fallback;
  }
}
