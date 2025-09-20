export interface OSMPlace {
  name: string;
  lat: number;
  lon: number;
  address?: string;
}

async function geocodeNominatim(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const arr = await res.json();
    if (!arr || !arr[0]) return null;
    return { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) };
  } catch {
    // try Photon as fallback
    try {
      const purl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
      const res2 = await fetch(purl);
      if (!res2.ok) return null;
      const data = await res2.json();
      const f = data.features && data.features[0];
      if (!f) return null;
      return { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
    } catch {
      return null;
    }
  }
}

async function overpass(query: string): Promise<OSMPlace[]> {
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'text/plain' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.elements || []).map((e: any) => ({
      name: e.tags?.name || 'Unnamed',
      lat: e.lat || e.center?.lat,
      lon: e.lon || e.center?.lon,
      address: e.tags?.addr_full || e.tags?.['addr:street'] || ''
    })).filter((p: OSMPlace) => p.lat && p.lon);
  } catch {
    return [];
  }
}

function buildOverpassAround(lat: number, lon: number, radius: number, filters: string[]): string {
  const filterStr = filters.join('');
  return `[out:json][timeout:25];(
    node${filterStr}(around:${radius},${lat},${lon});
    way${filterStr}(around:${radius},${lat},${lon});
    relation${filterStr}(around:${radius},${lat},${lon});
  );
  out center 20;`;
}

export async function getLeafletSuggestionsForDay(destination: string, day: number) {
  const out: Record<string, OSMPlace[]> = {} as any;
  if (!destination) return { sections: out, center: null };
  const center = await geocodeNominatim(destination);
  if (!center) return { sections: out, center: null };

  const radius = 5000; // 5km
  if (day === 1) {
    const hotelQ = buildOverpassAround(center.lat, center.lon, radius, ["[tourism=hotel]", "[amenity=hotel]"]);
    const visitQ = buildOverpassAround(center.lat, center.lon, radius, ["[tourism=attraction]"]);
    out['Places to stay'] = await overpass(hotelQ);
    out['Places to visit'] = await overpass(visitQ);
  } else if (day === 2) {
    const foodQ = buildOverpassAround(center.lat, center.lon, radius, ["[amenity=restaurant]"]);
    const shopQ = buildOverpassAround(center.lat, center.lon, radius, ["[shop~'mall|supermarket|gift|convenience']"]);
    out['Food'] = await overpass(foodQ);
    out['Shopping'] = await overpass(shopQ);
  } else {
    const leaveQ = buildOverpassAround(center.lat, center.lon, radius, ["[railway=station]", "[aeroway=aerodrome]", "[amenity=bus_station]"]);
    out['Tickets to leave'] = await overpass(leaveQ);
  }
  return { sections: out, center };
}

export function osmPlaceUrl(item: OSMPlace) {
  return `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=15/${item.lat}/${item.lon}`;
}