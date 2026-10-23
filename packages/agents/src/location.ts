import type { LocationContext, PlacePoi, Project } from '@placegraph/types';

// Nominatim's usage policy requires an identifying User-Agent with contact details.
// The previous UA had none, so requests were silently rejected and every location
// looked unmatched (which pushed the whole analysis onto generic fallback copy).
const USER_AGENT = 'PlaceGraph/1.0 (+https://placegraph.vercel.app; contact@placegraph.app)';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
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
      if (!pois.length) notes.push('Nearby commercial POIs could not be retrieved at this resolution.');
    } catch {
      notes.push('OpenStreetMap Overpass lookup failed.');
    }
  }

  const evidenceQuality =
    pois.length >= 8 ? 'strong' : pois.length >= 3 || displayName ? 'moderate' : 'insufficient';

  return {
    query,
    displayName,
    lat,
    lng,
    city,
    evidenceQuality,
    pois,
    notes
  };
}

async function nearbyPois(lat: number, lng: number, projectType: string): Promise<PlacePoi[]> {
  const amenity =
    projectType === 'hotel'
      ? 'hotel|restaurant|cafe|bar'
      : projectType === 'retail'
        ? 'shop|cafe|restaurant|marketplace'
        : 'restaurant|cafe|bar|pub|fast_food|hotel';

  const query = `
    [out:json][timeout:20];
    (
      node["amenity"~"${amenity}"](around:700,${lat},${lng});
      way["amenity"~"${amenity}"](around:700,${lat},${lng});
      node["shop"](around:500,${lat},${lng});
    );
    out center 50;
  `;

  let data: any = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': USER_AGENT,
          Accept: 'application/json'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(18000)
      });
      if (!res.ok) continue;
      data = await res.json();
      break;
    } catch {
      // try the next mirror
    }
  }
  if (!data) return [];
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
