import { db } from '@/lib/db'
import { institutions } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, type, managerPhone } = await request.json()

    if (!name || !type || !managerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newInstitution = await db.insert(institutions).values({
      id: `inst_${Date.now()}`,
      name,
      type,
      managerPhone,
    }).returning()

    return NextResponse.json({ institution: newInstitution[0] })
  } catch (error) {
    console.error('[v0] Failed to create institution:', error)
    return NextResponse.json({ error: 'Failed to create institution' }, { status: 500 })
  }
}
