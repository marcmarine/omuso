import { NextRequest, NextResponse } from 'next/server'

import { books } from '@/app/(data)/database'
import { slugify } from '@/utils/slugify'

export async function GET(
  _reques: NextRequest,
  { params }: { params: { title: string; chapter: string } }
) {
  const paramsTitle = params.title
  const paramsChapter = params.chapter
  const book = books.find(book => slugify(book.title) === paramsTitle)
  const chapter = book?.items.find(
    chapter => slugify(chapter.title) === paramsChapter
  )
  return NextResponse.json(chapter)
}
