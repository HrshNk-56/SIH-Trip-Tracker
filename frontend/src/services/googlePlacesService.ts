const MAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

export interface PlaceItem {
  name: string;
  address: string;
  rating?: number;
  place_id?: string;
}

async function textSearch(query: string): Promise<PlaceItem[]> {
  if (!MAPS_KEY) return [];
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${MAPS_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 5).map((r: any) => ({
      name: r.name,
      address: r.formatted_address,
      rating: r.rating,
      place_id: r.place_id,
    }));
  } catch {
    return [];
  }
}

export async function getSuggestionsForDay(destination: string, day: number) {
  const out: Record<string, PlaceItem[]> = {};
  if (!destination) return out;
  if (day === 1) {
    out['Places to stay'] = await textSearch(`best hotels in ${destination}`);
    out['Places to visit'] = await textSearch(`tourist attractions in ${destination}`);
  } else if (day === 2) {
    out['Food'] = await textSearch(`best restaurants in ${destination}`);
    out['Shopping'] = await textSearch(`shopping in ${destination}`);
  } else {
    out['Tickets to leave'] = await textSearch(`bus stations or railway stations or airport in ${destination}`);
  }
  return out;
}

export function mapsPlaceUrl(item: PlaceItem) {
  if (item.place_id) return `https://www.google.com/maps/place/?q=place_id:${item.place_id}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (item.address||''))}`;
}