import type { QlooAffinity } from '@placegraph/qloo';
import type { CulturalPattern, Project } from '@placegraph/types';

interface CulturalMode {
  key: string;
  label: string;
  genres: string[];
  names: string[];
  domain?: string; // if set, matched by affinity.domain instead of genre/name
  implication: string;
}

const MODES: CulturalMode[] = [
  // ── Place-based modes ────────────────────────────────────────────────────
  {
    key: 'hospitality',
    label: 'Hospitality & hosting',
    genres: ['hotel', 'hostel', 'resort', 'guest_house', 'lodge', 'motel', 'suites'],
    names: ['hotel', 'suite', 'lodge', 'resort', 'guest house', 'hostel'],
    implication: 'Hosting is a locally legible mode: arrival, comfort and service should be explicit, not incidental.'
  },
  {
    key: 'worship',
    label: 'Ritual & ceremony',
    genres: ['church', 'pentecostal_church', 'mosque', 'chapel', 'place_of_worship', 'cathedral'],
    names: ['church', 'mosque', 'chapel', 'cathedral', 'ministry'],
    implication: 'Ceremony implies a dignified, acoustically controlled room that can hold weekly use and life-cycle celebrations.'
  },
  {
    key: 'social',
    label: 'Social eating & nightlife',
    genres: ['restaurant', 'bar', 'cafe', 'nightclub', 'pub', 'lounge'],
    names: ['restaurant', 'bar', 'cafe', 'kitchen', 'lounge', 'grill'],
    implication: 'Social eating implies a relaxed, slightly noisy edge that can be acoustically separated from quiet work.'
  },
  {
    key: 'gathering',
    label: 'Spectacle & gathering',
    genres: ['stadium', 'event_venue', 'arena', 'theater', 'theatre', 'convention_center', 'auditorium'],
    names: ['stadium', 'event centre', 'event center', 'arena', 'theatre', 'theater', 'convention'],
    implication: 'Event affinity implies peak-crowd capacity, clear circulation and a service route that does not cross the main room.'
  },
  {
    key: 'commerce',
    label: 'Everyday commerce',
    genres: ['market', 'department_store', 'shopping_mall', 'store', 'supermarket', 'shop', 'plaza'],
    names: ['market', 'plaza', 'store', 'supermarket', 'mall', 'shop'],
    implication: 'Commerce implies an open, bargaining-friendly edge where local makers and everyday errands are visible from the street.'
  },
  {
    key: 'learning',
    label: 'Campus & learning',
    genres: ['public_university', 'university', 'college', 'school', 'library', 'campus'],
    names: ['university', 'college', 'school', 'library', 'campus', 'halls'],
    implication: 'Campus affinity implies a calm, repeatable everyday core with long dwell, low-friction arrival and reliable power/Wi-Fi.'
  },
  {
    key: 'residential',
    label: 'Residential & neighbourly',
    genres: ['housing_complex', 'residential', 'neighborhood', 'apartment', 'estate'],
    names: ['estate', 'housing', 'residence', 'apartment', 'close'],
    implication: 'Residential affinity implies neighbourly access and domestic comfort rather than a destination-only spectacle.'
  },
  // ── Cross-domain modes ────────────────────────────────────────────────────
  // These are matched by affinity.domain (set by the Qloo client), not genre.
  {
    key: 'music',
    label: 'Music & listening culture',
    genres: [],
    names: [],
    domain: 'music',
    implication: 'Music affinity signals an audience that treats sonic atmosphere as core, not background — sonic identity, curation and acoustics should be first-order design decisions.'
  },
  {
    key: 'brand',
    label: 'Brand & design sensibility',
    genres: [],
    names: [],
    domain: 'brand',
    implication: 'Brand affinity reveals the aesthetic register and material expectations this audience brings — the fit-out, packaging and service choreography should match those references.'
  },
  {
    key: 'film',
    label: 'Film & visual culture',
    genres: [],
    names: [],
    domain: 'film',
    implication: 'Film affinity signals a visually literate audience that reads spatial narrative — the space should have a legible editorial point of view, not just a décor style.'
  },
  {
    key: 'fashion',
    label: 'Fashion & style identity',
    genres: [],
    names: [],
    domain: 'fashion',
    implication: 'Fashion affinity shows how this audience presents and performs identity — staff presentation, interior material quality, and the social optics of the space matter to them.'
  },
];

function normalizedGenre(affinity: QlooAffinity): string {
  return (affinity.genre || '').toLowerCase();
}

function genreTokens(affinity: QlooAffinity): string[] {
  return [...new Set(normalizedGenre(affinity).split(/[^a-z0-9]+/).filter(Boolean))];
}

function inferMode(affinity: QlooAffinity): CulturalMode | undefined {
  // 1. Domain-based match first (music, brand, film, fashion)
  if (affinity.domain) {
    const domainMode = MODES.find(
      (m) => m.domain && affinity.domain?.toLowerCase().includes(m.domain)
    );
    if (domainMode) return domainMode;
  }

  // 2. Genre-based match
  const genre = normalizedGenre(affinity);
  const tokens = new Set(genreTokens(affinity));
  const byGenre = MODES.find((mode) =>
    mode.genres.some((candidate) =>
      tokens.has(candidate) || (candidate.includes('_') && genre.includes(candidate))
    )
  );
  if (byGenre) return byGenre;

  // 3. Name-based match
  const name = affinity.target.toLowerCase();
  return MODES.find((mode) =>
    mode.names.some((candidate) => name.includes(candidate))
  );
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

interface ThesisOptions {
  allowsEventProgramming?: boolean;
}

export function projectAllowsEventProgramming(
  project: Pick<Project, 'objective' | 'constraints' | 'projectType'>
): boolean {
  const text = [
    project.objective,
    project.projectType,
    ...(project.constraints || []).map((constraint) => `${constraint.key} ${constraint.value}`)
  ]
    .join(' ')
    .toLowerCase();

  if (/\b(no|without|not|non)[- ]?(event|events|programming)\b/.test(text)) return false;
  if (/\bevent programming (is )?(out of scope|not required|not allowed|avoided)\b/.test(text)) return false;
  return true;
}

function buildThesis(patterns: CulturalPattern[], options: ThesisOptions = {}): string {
  if (!patterns.length) {
    return 'The scored affinities do not yet resolve into a legible cultural pattern. Treat the programme as an open hypothesis.';
  }

  // Separate place-based and cross-domain patterns for the thesis
  const placePatterns = patterns.filter((p) =>
    !['music', 'brand', 'film', 'fashion'].includes(p.key)
  );
  const crossDomainPatterns = patterns.filter((p) =>
    ['music', 'brand', 'film', 'fashion'].includes(p.key)
  );

  const modes = placePatterns.slice(0, 6).map((p) => p.label.toLowerCase());
  const more = placePatterns.length > 6 ? ' among other signals' : '';
  const anchors = placePatterns
    .slice(0, 3)
    .map((p) => `${p.label.toLowerCase()} (${p.places.slice(0, 2).join(', ')})`)
    .join('; ');

  let base: string;

  if (placePatterns.length === 0 && crossDomainPatterns.length > 0) {
    // Only cross-domain affinities — still produce a useful thesis
    const cdLabels = crossDomainPatterns.map((p) => p.label.toLowerCase()).join(' and ');
    const cdAnchors = crossDomainPatterns
      .slice(0, 2)
      .flatMap((p) => p.places.slice(0, 2))
      .join(', ');
    base = `Qloo affinities resolve around ${cdLabels} rather than place genres, with anchors including ${cdAnchors}. The cultural proposition should foreground identity and aesthetic sensibility over spatial programme.`;
  } else if (placePatterns.length === 1) {
    base = `Scored affinities concentrate in ${modes[0]}. The strongest reading is a focused ${placePatterns[0].label.toLowerCase()} proposition anchored by ${placePatterns[0].places.slice(0, 3).join(', ')}, not a generic multi-use venue.`;
  } else {
    const campus = placePatterns.some((p) => p.key === 'learning');
    const allowsEvents = options.allowsEventProgramming !== false;
    const proposition = placePatterns.length >= 3
      ? campus
        ? allowsEvents
          ? 'a campus-edge social house that can shift between everyday use, hospitality and ceremony'
          : 'a campus-edge social house with a calm everyday core and a sociable hospitality edge'
        : allowsEvents
          ? 'a hybrid social house that can shift between everyday use, hospitality and ceremony'
          : 'a hybrid social house with a calm everyday core and a sociable hospitality edge'
      : `a ${placePatterns[0].label.toLowerCase()} project with a secondary ${placePatterns[1].label.toLowerCase()} layer`;

    const constraintNote = allowsEvents
      ? ''
      : ' Because programmed events are out of scope, the gathering and ceremony signals should become everyday ritual, hosting and small-group flexibility — not an events hall.';

    base = `Scored affinities cluster across ${joinList(modes)}${more}. The strongest reading is ${proposition} — not a single-purpose venue. Anchors: ${anchors}.${constraintNote}`;
  }

  // Append cross-domain layer if present
  if (crossDomainPatterns.length > 0) {
    const cdLabels = crossDomainPatterns.map((p) => p.label.toLowerCase()).join(', ');
    const cdTopNames = crossDomainPatterns
      .flatMap((p) => p.places.slice(0, 2))
      .slice(0, 4)
      .join(', ');
    base += ` Cross-domain affinities add a ${cdLabels} layer (${cdTopNames}), signalling the aesthetic and identity expectations this audience brings to the space.`;
  }

  return base;
}

export function deriveCulturalPatterns(
  affinities: QlooAffinity[],
  options: ThesisOptions = {}
): {
  culturalPatterns: CulturalPattern[];
  culturalThesis: string;
} {
  const grouped = new Map<string, { mode: CulturalMode; items: QlooAffinity[] }>();

  for (const affinity of affinities) {
    if (!affinity?.target || typeof affinity.strength !== 'number') continue;
    const mode = inferMode(affinity);
    if (!mode) continue;
    const entry = grouped.get(mode.key) || { mode, items: [] };
    entry.items.push(affinity);
    grouped.set(mode.key, entry);
  }

  const culturalPatterns = [...grouped.values()]
    .map(({ mode, items }) => {
      const sorted = [...items].sort((a, b) => b.strength - a.strength || a.target.localeCompare(b.target));
      return {
        key: mode.key,
        label: mode.label,
        count: sorted.length,
        places: sorted.map((item) => item.target).slice(0, 8),
        genres: [...new Set(sorted.map((item) => item.genre).filter((g): g is string => Boolean(g)))],
        implication: mode.implication
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      const order = new Map(MODES.map((mode, index) => [mode.key, index]));
      return (order.get(a.key) ?? 99) - (order.get(b.key) ?? 99);
    });

  return {
    culturalPatterns,
    culturalThesis: buildThesis(culturalPatterns, options)
  };
}
