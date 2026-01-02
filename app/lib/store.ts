import { createClient } from 'redis';

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

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
let isConnected = false;
async function ensureConnected() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
}

export const store = {
  getAll: async (): Promise<Quote[]> => {
    await ensureConnected();
    const quoteIds = await redis.sMembers(QUOTES_KEY);
    if (quoteIds.length === 0) return [];
    
    const quotes = await Promise.all(
      quoteIds.map(async (id) => {
        const data = await redis.get(quoteKey(id));
        return data ? JSON.parse(data) : null;
      })
    );
    
    return quotes.filter((q): q is Quote => q !== null);
  },

  getById: async (id: string): Promise<Quote | undefined> => {
    await ensureConnected();
    const data = await redis.get(quoteKey(id));
    return data ? JSON.parse(data) : undefined;
  },

  create: async (quote: Omit<Quote, 'id' | 'createdAt' | 'lastShown' | 'timesShown'>): Promise<Quote> => {
    await ensureConnected();
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      lastShown: new Date('2024-01-01').toISOString(),
      timesShown: 0,
      createdAt: new Date().toISOString()
    };
    
    await redis.set(quoteKey(newQuote.id), JSON.stringify(newQuote));
    await redis.sAdd(QUOTES_KEY, newQuote.id);
    
    return newQuote;
  },

  update: async (id: string, data: Partial<Quote>): Promise<Quote | null> => {
    await ensureConnected();
    const existingData = await redis.get(quoteKey(id));
    if (!existingData) return null;
    
    const existing = JSON.parse(existingData);
    const updated = { ...existing, ...data };
    await redis.set(quoteKey(id), JSON.stringify(updated));
    
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    await ensureConnected();
    const exists = await redis.exists(quoteKey(id));
    if (!exists) return false;
    
    await redis.del(quoteKey(id));
    await redis.sRem(QUOTES_KEY, id);
    
    return true;
  },

  markAsViewed: async (id: string): Promise<Quote | null> => {
    await ensureConnected();
    const data = await redis.get(quoteKey(id));
    if (!data) return null;
    
    const quote = JSON.parse(data);
    quote.lastShown = new Date().toISOString();
    quote.timesShown += 1;
    
    await redis.set(quoteKey(id), JSON.stringify(quote));
    
    return quote;
  }
};