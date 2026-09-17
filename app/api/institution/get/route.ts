import { db } from '@/lib/db'
import { institutions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const institution = await db.query.institutions.findFirst({
      where: eq(institutions.id, id),
    })

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    return NextResponse.json({ institution })
  } catch (error) {
    console.error('[v0] Failed to fetch institution:', error)
    return NextResponse.json({ error: 'Failed to fetch institution' }, { status: 500 })
  }
}
