import { NextResponse } from 'next/server'

import { authors } from '@/app/(data)/database'

export async function GET() {
  return NextResponse.json(authors)
}
