import { kv } from '@vercel/kv';

export async function GET() {
  try {
    // Check all keys
    const allKeys = await kv.keys('*');
    const quoteKeys = await kv.keys('quote:*');
    
    // Get a sample quote
    let sampleQuote = null;
    if (quoteKeys.length > 0) {
      sampleQuote = await kv.get(quoteKeys[0]);
    }
    
    return Response.json({
      totalKeys: allKeys.length,
      quoteKeys: quoteKeys.length,
      allKeysSample: allKeys.slice(0, 10),
      quoteKeysSample: quoteKeys.slice(0, 10),
      sampleQuote,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}