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

const ML_API = 'http://localhost:5000';

export const tripService = {
  async predictTrip(data: TripPredictionRequest): Promise<TripPredictionResponse> {
    const res = await fetch(`${ML_API}/predict-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Prediction failed');
    return res.json();
  },
};
