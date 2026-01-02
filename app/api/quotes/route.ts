import { NextResponse } from 'next/server';
import { store } from '@/app/lib/store';

// GET all quotes
export async function GET() {
  const quotes = await store.getAll();
  return NextResponse.json(quotes);
}

// POST create new quote
export async function POST(request: Request) {
  const body = await request.json();
  const { title, author, tag, quote } = body;

  if (!author || !quote) {
    return NextResponse.json(
      { error: 'Author and quote are required' },
      { status: 400 }
    );
  }

  const newQuote = await store.create({ title, author, tag, quote });
  return NextResponse.json(newQuote, { status: 201 });
}