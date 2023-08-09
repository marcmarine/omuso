import { NextRequest, NextResponse } from 'next/server'

import { authors } from '@/data/database'
import { slugify } from '@/utils/slugify'

export async function GET(
  _request: NextRequest,
  { params }: { params: { name: string } }
) {
  const authorSlug = params.name
  const author = authors.find(author => slugify(author.name) === authorSlug)
  return NextResponse.json(author)
}
