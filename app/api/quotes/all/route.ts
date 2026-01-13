import { kv } from '@vercel/kv';

interface Quote {
  quote: string;
  author: string;
  title: string;
  tag?: string;
}

export async function GET() {
  const keys = await kv.keys('quote:*');
  const quotes = [];

  for (const key of keys) {
    const quote = await kv.get<Quote>(key);
    if (quote) {
      quotes.push({ ...quote, id: key });
    }
  }

  return Response.json(quotes);
}