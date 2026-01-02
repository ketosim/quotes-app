// Simple in-memory store for development
// We'll replace this with Vercel KV later

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

let quotes: Quote[] = [
  {
    id: '1',
    title: 'On Passion',
    author: 'Steve Jobs',
    tag: 'motivation',
    quote: 'The only way to do great work is to love what you do.',
    lastShown: '2024-01-01',
    timesShown: 0,
    createdAt: '2025-01-01'
  },
  {
    id: '2',
    title: 'On Challenges',
    author: 'Albert Einstein',
    tag: 'wisdom',
    quote: 'In the middle of difficulty lies opportunity.',
    lastShown: '2024-01-01',
    timesShown: 0,
    createdAt: '2025-01-01'
  },
  {
    id: '3',
    title: 'On Life',
    author: 'John Lennon',
    tag: 'philosophy',
    quote: "Life is what happens when you're busy making other plans.",
    lastShown: '2024-01-01',
    timesShown: 0,
    createdAt: '2025-01-01'
  }
];

export const store = {
  getAll: async (): Promise<Quote[]> => {
    return quotes;
  },

  getById: async (id: string): Promise<Quote | undefined> => {
    return quotes.find(q => q.id === id);
  },

  create: async (quote: Omit<Quote, 'id' | 'createdAt' | 'lastShown' | 'timesShown'>): Promise<Quote> => {
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      lastShown: new Date('2024-01-01').toISOString(),
      timesShown: 0,
      createdAt: new Date().toISOString()
    };
    quotes.push(newQuote);
    return newQuote;
  },

  update: async (id: string, data: Partial<Quote>): Promise<Quote | null> => {
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) return null;
    quotes[index] = { ...quotes[index], ...data };
    return quotes[index];
  },

  delete: async (id: string): Promise<boolean> => {
    const initialLength = quotes.length;
    quotes = quotes.filter(q => q.id !== id);
    return quotes.length < initialLength;
  },

  markAsViewed: async (id: string): Promise<Quote | null> => {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return null;
    quote.lastShown = new Date().toISOString();
    quote.timesShown += 1;
    return quote;
  }
};