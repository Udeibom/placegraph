import type { FloorPlanReading, Project, SpatialConcept, SpatialLayoutRoom } from '@placegraph/types';

// ─── Zone-name normalisation ──────────────────────────────────────────────
// Maps raw LLM zone names → display names that make sense to a non-architect.

const ZONE_ALIASES: Array<{ patterns: RegExp; label: string }> = [
  { patterns: /\b(bar|wine|counter|service\s+bar|main\s+bar)\b/i,           label: 'Bar' },
  { patterns: /\b(main\s+seat|dining|seating|social|lounge)\b/i,            label: 'Main seating' },
  { patterns: /\b(entrance|arrival|threshold|entry|foyer|reception)\b/i,    label: 'Entrance' },
  { patterns: /\b(kitchen|prep|cooking|back[\s_-]?of[\s_-]?house|boh)\b/i, label: 'Kitchen' },
  { patterns: /\b(private|nook|ceremony|event|bookable|pdR|pod)\b/i,        label: 'Private nook' },
  { patterns: /\b(retail|shop|display|maker|goods)\b/i,                      label: 'Retail corner' },
  { patterns: /\b(quiet|calm|study|reading|library)\b/i,                     label: 'Quiet zone' },
  { patterns: /\b(terrace|garden|outdoor|exterior\s+seat)\b/i,               label: 'Terrace' },
  { patterns: /\b(store|storage|stock|back\s+room)\b/i,                      label: 'Storage' },
  { patterns: /\b(staff|office|admin)\b/i,                                   label: 'Staff area' },
];

function friendlyZoneName(raw: string): string {
  // First try alias matching on the original string
  for (const { patterns, label } of ZONE_ALIASES) {
    if (patterns.test(raw)) return label;
  }

  // Split camelCase / PascalCase into words: "frontBar" → "Front bar",
  // "flexibleZone" → "Flexible zone", "privateDining" → "Private dining"
  const split = raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')   // camelCase split
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // ABCDef → ABC Def
    .replace(/_/g, ' ')                      // snake_case
    .replace(/-/g, ' ')                      // kebab-case
    .trim();

  // Try alias matching again on the split string
  for (const { patterns, label } of ZONE_ALIASES) {
    if (patterns.test(split)) return label;
  }

  // Capitalise first letter only
  return split.charAt(0).toUpperCase() + split.slice(1).toLowerCase();
}

// ─── Primary-zone detection ───────────────────────────────────────────────
// The primary zone is the largest room in the concept. We want the bar/main
// seating zone to always be the biggest rectangle in the SVG.

const PRIMARY_ZONE_PATTERNS = [
  /\b(bar|wine|counter|service\s+bar)\b/i,
  /\b(main\s+seat|dining|seating|social|lounge)\b/i,
  /\b(primary|main\s+hall|main\s+room|hall)\b/i,
];

function isPrimaryZone(name: string): boolean {
  return PRIMARY_ZONE_PATTERNS.some((p) => p.test(name));
}

// ─── Layout builder from concept zones ───────────────────────────────────
// Takes the full list of zone names from concept.zones (which always reflects
// what the LLM described) and produces an SVG-ready layout grid.
// Grid is 96 × 90 units (leaving a 4-unit margin all around inside 100×100).

function buildLayoutFromZones(zoneNames: string[]): SpatialLayoutRoom[] {
  if (!zoneNames.length) return [];

  const friendly = zoneNames.map(friendlyZoneName);
  const n = friendly.length;

  // Split zones into primary (large) and secondary (smaller) buckets.
  const primaryIdxs = friendly
    .map((name, i) => ({ name, i }))
    .filter(({ name }) => isPrimaryZone(name))
    .map(({ i }) => i);

  // If nothing matches the primary patterns, treat the first zone as primary.
  if (!primaryIdxs.length) primaryIdxs.push(0);

  // Layout strategy: primary zone takes the left ~55% of the canvas, full
  // height. Secondary zones tile the right ~41% in equal rows.
  const secondaryIdxs = friendly
    .map((_, i) => i)
    .filter((i) => !primaryIdxs.includes(i));

  const rooms: SpatialLayoutRoom[] = [];

  // Primary zone(s) — stack vertically in the left column if >1 primary
  const primaryH = Math.floor(90 / primaryIdxs.length);
  primaryIdxs.forEach((idx, rank) => {
    rooms.push({
      name: friendly[idx],
      purpose: zoneNames[idx],
      x: 4,
      y: 4 + rank * primaryH,
      w: n <= 2 ? 92 : 54,
      h: primaryH - 2,
    });
  });

  // Secondary zones — tile right column
  if (secondaryIdxs.length) {
    const secW = n <= 2 ? 0 : 38;
    const secH = Math.floor(90 / secondaryIdxs.length);
    secondaryIdxs.forEach((idx, rank) => {
      rooms.push({
        name: friendly[idx],
        purpose: zoneNames[idx],
        x: 58,
        y: 4 + rank * secH,
        w: secW,
        h: secH - 2,
      });
    });
  }

  return rooms;
}

// ─── Public API ───────────────────────────────────────────────────────────

export function defaultLayout(
  project: Project,
  concept?: SpatialConcept,
  floorPlan?: FloorPlanReading
): SpatialLayoutRoom[] {
  // 1. If the LLM produced a layout AND it covers all the named zones, use it.
  //    "Covers" means at least as many rooms as zones, and the layout rooms
  //    actually have x/y/w/h coordinates that are non-zero.
  const llmLayout = concept?.layout ?? [];
  const conceptZones = (concept?.zones ?? []).map((z) => z.name).filter(Boolean);

  const llmIsComplete =
    llmLayout.length > 0 &&
    llmLayout.every((r) => r.w > 0 && r.h > 0) &&
    llmLayout.length >= Math.max(1, conceptZones.length);

  if (llmIsComplete) return llmLayout;

  // 2. LLM layout is absent or incomplete — rebuild from concept.zones.
  if (conceptZones.length) {
    return buildLayoutFromZones(conceptZones);
  }

  // 3. Fall back to floor plan rooms if available.
  if (floorPlan?.rooms?.length) {
    const names = floorPlan.rooms.map((r) => r.name).filter(Boolean);
    return buildLayoutFromZones(names);
  }

  // 4. Last resort: hardcoded defaults by project type.
  const type = project.projectType;
  if (type === 'hotel') {
    return [
      { name: 'Arrival / lobby',      purpose: 'Identity and shared audience ground', x: 4,  y: 4,  w: 54, h: 44 },
      { name: 'Restaurant / bar',     purpose: 'Public F&B',                          x: 60, y: 4,  w: 36, h: 44 },
      { name: 'Event / flex',         purpose: 'Divergent audience needs',            x: 4,  y: 50, w: 36, h: 44 },
      { name: 'Back of house',        purpose: 'Operations',                          x: 42, y: 50, w: 54, h: 44 },
    ];
  }
  if (type === 'retail') {
    return [
      { name: 'Threshold',            purpose: 'Street identity',                     x: 4,  y: 4,  w: 18, h: 88 },
      { name: 'Primary merchandise',  purpose: 'Core offer',                          x: 24, y: 4,  w: 48, h: 54 },
      { name: 'Secondary / discovery',purpose: 'Complementary audience',              x: 74, y: 4,  w: 22, h: 54 },
      { name: 'Service / stock',      purpose: 'Operations',                          x: 24, y: 60, w: 72, h: 32 },
    ];
  }
  // bar / restaurant / hospitality / other
  return [
    { name: 'Entrance',       purpose: 'Cultural identification',          x: 4,  y: 4,  w: 22, h: 88 },
    { name: 'Bar',            purpose: 'Core bar and service',             x: 28, y: 4,  w: 46, h: 58 },
    { name: 'Seating / dining',purpose: 'Main social space',               x: 76, y: 4,  w: 20, h: 58 },
    { name: 'Kitchen',        purpose: 'Kitchen and service',              x: 28, y: 64, w: 68, h: 28 },
  ];
}

export function ensureLayout(
  project: Project,
  concept: SpatialConcept,
  floorPlan?: FloorPlanReading
): SpatialConcept {
  return {
    ...concept,
    layout: defaultLayout(project, concept, floorPlan),
  };
}
