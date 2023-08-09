import { NextRequest, NextResponse } from 'next/server'

import { books } from '@/data/database'
import { slugify } from '@/utils/slugify'

export async function GET(
  _request: NextRequest,
  { params }: { params: { name: string } }
) {
  const authorSlug = params.name
  const authorItems = books.filter(book => slugify(book.author) === authorSlug)
  return NextResponse.json(authorItems)
}
