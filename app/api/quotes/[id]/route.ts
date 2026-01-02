import { NextResponse } from 'next/server';
import { store } from '@/app/lib/store';

// GET single quote by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quote = await store.getById(params.id);
  
  if (!quote) {
    return NextResponse.json(
      { error: 'Quote not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(quote);
}

// PUT update quote
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const updatedQuote = await store.update(params.id, body);

  if (!updatedQuote) {
    return NextResponse.json(
      { error: 'Quote not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedQuote);
}

// DELETE quote
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const success = await store.delete(params.id);

  if (!success) {
    return NextResponse.json(
      { error: 'Quote not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}