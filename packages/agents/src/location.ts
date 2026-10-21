import type { LocationContext, PlacePoi, Project } from '@placegraph/types';

function locationQuery(project: Project): string {
  return (
    project.location.address ||
    [project.location.neighborhood, project.location.city].filter(Boolean).join(', ') ||
    project.name
  );
}

export async function gatherLocationContext(project: Project): Promise<LocationContext> {
  const query = locationQuery(project);
  const notes: string[] = [];
  let lat = project.location.lat;
  let lng = project.location.lng;
  let displayName: string | undefined;
  let city = project.location.city;

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'User-Agent': 'PlaceGraph/1.0 (cultural-architecture agent)' },
      signal: AbortSignal.timeout(8000)
    });
    if (geoRes.ok) {
      const results = (await geoRes.json()) as any[];
      if (results?.[0]) {
        lat = parseFloat(results[0].lat);
        lng = parseFloat(results[0].lon);
        displayName = results[0].display_name;
        city = city || results[0].address?.city || results[0].display_name?.split(',')[0];
      } else {
        notes.push('Geocoding returned no match; geographic evidence is incomplete.');
      }
    } else {
      notes.push('Geocoding service was unavailable.');
    }
  } catch {
    notes.push('Geocoding request failed; continuing without coordinates.');
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

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(18000)
  });
  if (!res.ok) return [];
  const data = await res.json();
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
