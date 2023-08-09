import { NextRequest, NextResponse } from 'next/server'

import { books } from '@/data/database'
import { slugify } from '@/utils/slugify'

export async function GET(
  _reques: NextRequest,
  { params }: { params: { title: string } }
) {
  const paramsTitle = params.title
  const book = books.find(book => {
    const bookTitle = new RegExp(slugify(book.title), 'i')
    return bookTitle.test(paramsTitle)
  })
  return NextResponse.json(book)
}
