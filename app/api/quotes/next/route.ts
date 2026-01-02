import { NextResponse } from 'next/server';
import { store } from '@/app/lib/store';

// Weighted random selection algorithm
function selectWeightedQuote(quotes: any[]) {
  const today = new Date();
  
  // Calculate weights for each quote
  const weightedQuotes = quotes.map(quote => {
    const lastShown = new Date(quote.lastShown);
    const daysSince = Math.floor((today.getTime() - lastShown.getTime()) / (1000 * 60 * 60 * 24));
    const weight = Math.pow(Math.max(daysSince, 1), 2); // Quadratic weighting
    
    return { quote, weight };
  });
  
  // Sum all weights
  const totalWeight = weightedQuotes.reduce((sum, item) => sum + item.weight, 0);
  
  // Random selection based on weight
  let random = Math.random() * totalWeight;
  
  for (let item of weightedQuotes) {
    random -= item.weight;
    if (random <= 0) {
      return item.quote;
    }
  }
  
  // Fallback to first quote (shouldn't happen)
  return weightedQuotes[0].quote;
}

// GET next quote (weighted random)
export async function GET() {
  const quotes = await store.getAll();
  
  if (quotes.length === 0) {
    return NextResponse.json(
      { error: 'No quotes available' },
      { status: 404 }
    );
  }
  
  const selectedQuote = selectWeightedQuote(quotes);
  
  // Mark as viewed
  await store.markAsViewed(selectedQuote.id);
  
  return NextResponse.json(selectedQuote);
}