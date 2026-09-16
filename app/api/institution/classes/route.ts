import { db } from '@/lib/db'
import { classes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const institutionId = request.nextUrl.searchParams.get('institutionId')

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID required' }, { status: 400 })
    }

    const institutionClasses = await db.query.classes.findMany({
      where: eq(classes.institutionId, institutionId),
    })

    return NextResponse.json({ classes: institutionClasses })
  } catch (error) {
    console.error('[v0] Failed to fetch classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}
