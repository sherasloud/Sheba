import { db } from '@/lib/db'
import { institutions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 })
    }

    const userInstitutions = await db.query.institutions.findMany({
      where: eq(institutions.managerPhone, phone),
    })

    return NextResponse.json({ institutions: userInstitutions })
  } catch (error) {
    console.error('[v0] Failed to fetch institutions:', error)
    return NextResponse.json({ error: 'Failed to fetch institutions' }, { status: 500 })
  }
}
