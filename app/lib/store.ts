import { kv } from '@vercel/kv';

export interface Quote {
  id: string;
  title: string;
  author: string;
  tag: string;
  quote: string;
  lastShown: string;
  timesShown: number;
  createdAt: string;
}

const QUOTES_KEY = 'quotes:all';

// Helper to get quote key
const quoteKey = (id: string) => `quote:${id}`;

export const store = {
  getAll: async (): Promise<Quote[]> => {
    const quoteIds = await kv.smembers(QUOTES_KEY) as string[];
    if (quoteIds.length === 0) return [];
    
    const quotes = await Promise.all(
      quoteIds.map(id => kv.get<Quote>(quoteKey(id)))
    );
    
    return quotes.filter((q): q is Quote => q !== null);
  },

  getById: async (id: string): Promise<Quote | undefined> => {
    const quote = await kv.get<Quote>(quoteKey(id));
    return quote || undefined;
  },

  create: async (quote: Omit<Quote, 'id' | 'createdAt' | 'lastShown' | 'timesShown'>): Promise<Quote> => {
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      lastShown: new Date('2024-01-01').toISOString(),
      timesShown: 0,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(quoteKey(newQuote.id), newQuote);
    await kv.sadd(QUOTES_KEY, newQuote.id);
    
    return newQuote;
  },

  update: async (id: string, data: Partial<Quote>): Promise<Quote | null> => {
    const existing = await kv.get<Quote>(quoteKey(id));
    if (!existing) return null;
    
    const updated = { ...existing, ...data };
    await kv.set(quoteKey(id), updated);
    
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const exists = await kv.exists(quoteKey(id));
    if (!exists) return false;
    
    await kv.del(quoteKey(id));
    await kv.srem(QUOTES_KEY, id);
    
    return true;
  },

  markAsViewed: async (id: string): Promise<Quote | null> => {
    const quote = await kv.get<Quote>(quoteKey(id));
    if (!quote) return null;
    
    quote.lastShown = new Date().toISOString();
    quote.timesShown += 1;
    
    await kv.set(quoteKey(id), quote);
    
    return quote;
  }
};