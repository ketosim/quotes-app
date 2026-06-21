import { NextResponse } from 'next/server';
import { store, Quote } from '@/app/lib/store';

function selectWeightedQuote(quotes: Quote[]) {
  const today = new Date();

  const weightedQuotes = quotes.map(quote => {
    const lastShown = new Date(quote.lastShown);
    const daysSince = Math.floor((today.getTime() - lastShown.getTime()) / (1000 * 60 * 60 * 24));
    const weight = Math.pow(Math.max(daysSince, 1), 2);
    return { quote, weight };
  });

  const totalWeight = weightedQuotes.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weightedQuotes) {
    random -= item.weight;
    if (random <= 0) return item.quote;
  }

  return weightedQuotes[0].quote;
}

export async function GET() {
  try {
    const quotes = await store.getAll();

    if (quotes.length === 0) {
      return NextResponse.json({ error: 'No quotes available' }, { status: 404 });
    }

    const selectedQuote = selectWeightedQuote(quotes);
    await store.markAsViewed(selectedQuote.id);

    return NextResponse.json(selectedQuote);
  } catch (err) {
    console.error('GET /api/quotes/next error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}