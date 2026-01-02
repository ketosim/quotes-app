import { NextResponse } from 'next/server';
import { store } from '@/app/lib/store';

export async function POST(request: Request) {
  try {
    const { quotes } = await request.json();
    
    if (!Array.isArray(quotes)) {
      return NextResponse.json(
        { error: 'Invalid format - expected array of quotes' },
        { status: 400 }
      );
    }

    const created = [];
    const errors = [];

    for (const quote of quotes) {
      try {
        if (!quote.author || !quote.quote) {
          errors.push({ quote, error: 'Missing required fields (author, quote)' });
          continue;
        }

        const newQuote = await store.create({
          title: quote.title || '',
          author: quote.author,
          tag: quote.tag || '',
          quote: quote.quote
        });
        
        created.push(newQuote);
      } catch (error) {
        errors.push({ quote, error: 'Failed to create' });
      }
    }

    return NextResponse.json({ 
      success: true,
      created: created.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    );
  }
}