import { kv } from '@vercel/kv';

interface Quote {
  quote: string;
  author: string;
  title: string;
  tag?: string;
}

interface QuoteWithId extends Quote {
  id: string;
}

export async function POST(request: Request) {
  const { author, title, tag, search } = await request.json();
  
  const keys = await kv.keys('quote:*');
  let quotes: QuoteWithId[] = [];

  for (const key of keys) {
    const quote = await kv.get<Quote>(key);
    if (quote) {
      quotes.push({ ...quote, id: key });
    }
  }

  // Apply filters
  if (author) {
    quotes = quotes.filter((q: QuoteWithId) => q.author === author);
  }

  if (title) {
    quotes = quotes.filter((q: QuoteWithId) => q.title === title);
  }

  if (tag) {
    quotes = quotes.filter((q: QuoteWithId) => q.tag === tag);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    quotes = quotes.filter((q: QuoteWithId) =>
      q.quote.toLowerCase().includes(searchLower) ||
      q.author.toLowerCase().includes(searchLower) ||
      q.title.toLowerCase().includes(searchLower)
    );
  }

  return Response.json(quotes);
}