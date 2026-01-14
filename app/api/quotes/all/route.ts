import { kv } from '@vercel/kv';

interface Quote {
  quote: string;
  author: string;
  title: string;
  tag?: string;
}

export async function GET() {
  try {
    console.log('Fetching all quote keys...');
    const keys = await kv.keys('quote:*');
    console.log(`Found ${keys.length} quote keys`);
    
    if (keys.length === 0) {
      console.log('No quotes found in database');
      return Response.json([]);
    }

    const quotes = [];

    for (const key of keys) {
      try {
        const quote = await kv.get<Quote>(key);
        if (quote) {
          quotes.push({ ...quote, id: key });
        }
      } catch (err) {
        console.error(`Error fetching quote ${key}:`, err);
        // Skip this quote and continue
      }
    }

    console.log(`Successfully fetched ${quotes.length} quotes`);
    return Response.json(quotes);
  } catch (error) {
    console.error('Error in /api/quotes/all:', error);
    return Response.json(
      { error: 'Failed to fetch quotes', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}