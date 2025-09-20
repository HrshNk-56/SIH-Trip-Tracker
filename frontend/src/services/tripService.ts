export interface TripPredictionRequest {
  destination: string;
  tripType: 'solo' | 'friends' | 'business';
  participantCount: number;
  days: number;
  budget: number;
}

export interface TripPredictionResponse {
  predictedCost: number;
  tripCategory: string;
  costBreakdown: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  recommendations: string[];
  budgetStatus: string;
}

const ML_API = (import.meta as any).env?.VITE_ML_API || 'http://localhost:5000';

export const tripService = {
  async predictTrip(data: TripPredictionRequest): Promise<TripPredictionResponse> {
    // Try multiple possible endpoints (travel_ai.py or legacy)
    const endpoints = [
      `${ML_API}/travel_ai/predict`,
      `${ML_API}/predict-trip`
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (_) {
        // continue to next endpoint
      }
    }
    // Fallback stub so UI continues without backend
    const base = Math.max(1, data.days) * (data.tripType === 'friends' ? 3500 : 3000) * Math.max(1, data.participantCount);
    const predictedCost = Math.round(base * 1.1);
    const response: TripPredictionResponse = {
      predictedCost,
      tripCategory: data.tripType === 'friends' ? 'Group Leisure' : 'Solo Leisure',
      costBreakdown: {
        accommodation: Math.round(predictedCost * 0.4),
        food: Math.round(predictedCost * 0.25),
        transport: Math.round(predictedCost * 0.2),
        activities: Math.round(predictedCost * 0.15),
      },
      recommendations: ['Keep receipts via Scan bills', 'Use public transport to save costs'],
      budgetStatus: predictedCost > data.budget ? 'Over Budget' : 'Within Budget',
    };
    return response;
  },
};
