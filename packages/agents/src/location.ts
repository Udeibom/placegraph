import type { LocationContext, PlacePoi, Project } from '@placegraph/types';

// Nominatim's usage policy requires an identifying User-Agent with contact details.
// The previous UA had none, so requests were silently rejected and every location
// looked unmatched (which pushed the whole analysis onto generic fallback copy).
const USER_AGENT = 'PlaceGraph/1.0 (+https://placegraph.vercel.app; contact@placegraph.app)';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://overpass.osm.ch/api/interpreter'
];

interface GeoResult {
  lat: number;
  lng: number;
  displayName?: string;
  city?: string;
}

function locationQuery(project: Project): string {
  return (
    project.location.address ||
    [project.location.neighborhood, project.location.city].filter(Boolean).join(', ') ||
    project.name
  );
}

function locationCandidates(project: Project): string[] {
  const raw = [
    locationQuery(project),
    [project.location.neighborhood, project.location.city].filter(Boolean).join(', '),
    project.location.city
  ];
  return Array.from(new Set(raw.filter((q): q is string => Boolean(q)).map((q) => q.trim())));
}

async function geocodeNominatim(query: string): Promise<GeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return null;
    const results = (await res.json()) as any[];
    const hit = results?.[0];
    if (!hit) return null;
    const address = hit.address ?? {};
    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      displayName: hit.display_name,
      city: address.city || address.town || address.village || address.state_district
    };
  } catch {
    return null;
  }
}

async function geocodePhoton(query: string): Promise<GeoResult | null> {
  try {
    const url = `https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const feature = data.features?.[0];
    const coords = feature?.geometry?.coordinates;
    if (!coords) return null;
    const props = feature.properties ?? {};
    return {
      lat: coords[1],
      lng: coords[0],
      displayName: [props.name, props.state, props.country].filter(Boolean).join(', '),
      city: props.city || props.name
    };
  } catch {
    return null;
  }
}

export async function gatherLocationContext(project: Project): Promise<LocationContext> {
  const query = locationQuery(project);
  const notes: string[] = [];
  let lat = project.location.lat;
  let lng = project.location.lng;
  let displayName: string | undefined;
  let city = project.location.city;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    let resolved: GeoResult | null = null;
    for (const candidate of locationCandidates(project)) {
      resolved = (await geocodeNominatim(candidate)) || (await geocodePhoton(candidate));
      if (resolved) break;
    }
    if (resolved) {
      lat = resolved.lat;
      lng = resolved.lng;
      displayName = resolved.displayName;
      city = city || resolved.city;
    } else {
      notes.push('Geocoding returned no match; geographic evidence is incomplete.');
    }
  }

  let pois: PlacePoi[] = [];
  if (typeof lat === 'number' && typeof lng === 'number') {
    try {
      pois = await nearbyPois(lat, lng, project.projectType);
    } catch {
      notes.push('OpenStreetMap Overpass lookup failed.');
    }
    if (!pois.length) {
      pois = await nominatimPois(lat, lng, project.projectType);
      if (pois.length) {
        notes.push('POI evidence came from Nominatim because Overpass mirrors were unavailable.');
      } else {
        notes.push('Nearby commercial POIs could not be retrieved at this resolution.');
      }
    }
  }

  const barCount = pois.filter((p) =>
    ['bar', 'pub', 'wine_bar', 'nightclub'].includes(p.category ?? '')
  ).length;

  if (barCount === 0) {
    notes.push(
      'No bars or pubs found in POI results. This may reflect OSM data coverage, not actual absence. Do not assert that no bars exist nearby without verification.'
    );
  }

  const evidenceQuality =
    pois.length >= 8 ? 'strong' : pois.length >= 3 || displayName ? 'moderate' : 'insufficient';

  const coverageQuality: 'comprehensive' | 'partial' | 'sparse' =
    pois.length >= 15 ? 'comprehensive' : pois.length >= 5 ? 'partial' : 'sparse';

  return {
    query,
    displayName,
    lat,
    lng,
    city,
    evidenceQuality,
    coverageQuality,
    pois,
    notes
  };
}

async function nearbyPois(lat: number, lng: number, projectType: string): Promise<PlacePoi[]> {
  const amenity =
    projectType === 'hotel'
      ? 'hotel|restaurant|cafe|bar|pub|wine_bar|nightclub'
      : projectType === 'retail'
        ? 'shop|cafe|restaurant|marketplace|bar|pub|wine_bar|nightclub'
        : 'restaurant|cafe|bar|pub|wine_bar|nightclub|fast_food|hotel';
  const shop = 'wine|alcohol|deli';

  const query = `
    [out:json][timeout:20];
    (
      node["amenity"~"${amenity}"](around:700,${lat},${lng});
      way["amenity"~"${amenity}"](around:700,${lat},${lng});
      node["shop"](around:500,${lat},${lng});
      way["shop"~"${shop}"](around:500,${lat},${lng});
    );
    out center 50;
  `;

  const attempts = OVERPASS_ENDPOINTS.map(async (endpoint) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': USER_AGENT,
        Accept: 'application/json'
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) throw new Error(`${endpoint} returned ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data?.elements) || data.elements.length === 0) {
      throw new Error(`${endpoint} returned no elements`);
    }
    return data;
  });

  let data: any = null;
  try {
    data = await Promise.any(attempts);
  } catch {
    return [];
  }

  const elements = Array.isArray(data.elements) ? data.elements : [];
  const pois: PlacePoi[] = [];
  for (const el of elements) {
    const name = el.tags?.name;
    if (!name) continue;
    const plat = el.lat ?? el.center?.lat;
    const plng = el.lon ?? el.center?.lon;
    pois.push({
      name,
      category: el.tags?.amenity || el.tags?.shop || 'place',
      lat: plat,
      lng: plng,
      distanceM:
        typeof plat === 'number' && typeof plng === 'number'
          ? haversineM(lat, lng, plat, plng)
          : undefined
    });
  }
  return dedupePois(pois);
}

async function nominatimPois(lat: number, lng: number, projectType: string): Promise<PlacePoi[]> {
  const categories =
    projectType === 'hotel'
      ? ['cafe', 'restaurant', 'bar', 'pub', 'wine_bar']
      : projectType === 'retail'
        ? ['cafe', 'restaurant', 'shop', 'wine', 'alcohol', 'deli']
        : ['cafe', 'restaurant', 'bar', 'pub', 'wine_bar', 'wine'];

  const delta = 0.009;
  const viewbox = `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`;
  const pois: PlacePoi[] = [];

  for (let i = 0; i < categories.length; i++) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 1100));
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=20&bounded=1&viewbox=${encodeURIComponent(viewbox)}&q=${encodeURIComponent(categories[i])}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(9000)
      });
      if (!res.ok) continue;
      const hits = (await res.json()) as any[];
      for (const hit of hits) {
        const plat = parseFloat(hit.lat);
        const plng = parseFloat(hit.lon);
        if (!Number.isFinite(plat) || !Number.isFinite(plng)) continue;
        const name = hit.name || String(hit.display_name || '').split(',')[0];
        if (!name) continue;
        pois.push({
          name,
          category: hit.type || categories[i],
          lat: plat,
          lng: plng,
          distanceM: haversineM(lat, lng, plat, plng)
        });
      }
    } catch {
      // try the next category
    }
  }

  return dedupePois(pois);
}

function dedupePois(pois: PlacePoi[]): PlacePoi[] {
  const unique = new Map<string, PlacePoi>();
  for (const p of pois) if (!unique.has(p.name)) unique.set(p.name, p);
  return Array.from(unique.values())
    .sort((a, b) => (a.distanceM || 0) - (b.distanceM || 0))
    .slice(0, 24);
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}
