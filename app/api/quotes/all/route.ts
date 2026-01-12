import { kv } from '@vercel/kv';

export async function GET() {
  const keys = await kv.keys('quote:*');
  const quotes = [];

  for (const key of keys) {
    const quote = await kv.get(key);
    quotes.push({ ...quote, id: key });
  }

  return Response.json(quotes);
}