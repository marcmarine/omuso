import { NextResponse } from 'next/server'

import { books } from '@/data/database'

export async function GET() {
  return NextResponse.json(books)
}
