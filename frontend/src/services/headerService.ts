export type TripHeader = {
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  spentINR: number;
  places: number;
};

const API = 'http://localhost:8080';

export const headerService = {
  async get(): Promise<TripHeader> {
    const res = await fetch(`${API}/api/trip-header`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch trip header');
    return res.json();
  },
  async update(data: TripHeader): Promise<TripHeader> {
    const res = await fetch(`${API}/api/trip-header`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update trip header');
    return res.json();
  }
};
