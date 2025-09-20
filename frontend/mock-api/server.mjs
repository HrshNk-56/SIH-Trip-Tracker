import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Chatbot mock endpoint
app.post('/chatbot/query', (req, res) => {
  const { message } = req.body || {};
  const reply = message ? `You said: ${message}. Here's a helpful tip: keep receipts using Scan bills!` : 'Hello from mock chatbot!';
  res.json({ reply });
});

// Travel AI mock prediction
app.post(['/travel_ai/predict', '/predict-trip'], (req, res) => {
  const { days = 3, participantCount = 1, tripType = 'solo', budget = 0 } = req.body || {};
  const base = Math.max(1, days) * (tripType === 'friends' ? 3500 : 3000) * Math.max(1, participantCount);
  const predictedCost = Math.round(base * 1.1);
  res.json({
    predictedCost,
    tripCategory: tripType === 'friends' ? 'Group Leisure' : 'Solo Leisure',
    costBreakdown: {
      accommodation: Math.round(predictedCost * 0.4),
      food: Math.round(predictedCost * 0.25),
      transport: Math.round(predictedCost * 0.2),
      activities: Math.round(predictedCost * 0.15),
    },
    recommendations: ['Scan bills to keep track', 'Use public transport to save costs'],
    budgetStatus: predictedCost > budget ? 'Over Budget' : 'Within Budget',
  });
});

// Image processor mock
app.post('/image_process/process-bill', (req, res) => {
  // Return a single example item. In reality you'd parse OCR results.
  res.json({ items: [{ title: 'Restaurant', amount: 450, category: 'Food & Beverages', date: new Date().toISOString().slice(0,10) }] });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Mock ML API running on http://localhost:${port}`));