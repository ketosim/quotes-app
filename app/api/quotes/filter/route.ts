import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  const { author, title, tag, search } = await request.json();
  
  const keys = await kv.keys('quote:*');
  let quotes = [];

  for (const key of keys) {
    const quote = await kv.get(key);
    quotes.push({ ...quote, id: key });
  }

  // Apply filters
  if (author) {
    quotes = quotes.filter((q: any) => q.author === author);
  }

  if (title) {
    quotes = quotes.filter((q: any) => q.title === title);
  }

  if (tag) {
    quotes = quotes.filter((q: any) => q.tag === tag);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    quotes = quotes.filter((q: any) =>
      q.quote.toLowerCase().includes(searchLower) ||
      q.author.toLowerCase().includes(searchLower) ||
      q.title.toLowerCase().includes(searchLower)
    );
  }

  return Response.json(quotes);
}