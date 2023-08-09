import { NextRequest, NextResponse } from 'next/server'

import { books } from '@/data/database'
import { slugify } from '@/utils/slugify'

export async function GET(
  _request: NextRequest,
  { params }: { params: { title: string } }
) {
  const bookSlug = params.title
  const book = books.find(book => slugify(book.title) === bookSlug)
  const bookItems = book?.items

  return NextResponse.json(bookItems)
}
