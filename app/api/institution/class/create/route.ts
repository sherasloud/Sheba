import { db } from '@/lib/db'
import { classes } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { institutionId, name, classLevel } = await request.json()

    if (!institutionId || !name || classLevel === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newClass = await db.insert(classes).values({
      id: `class_${Date.now()}`,
      institutionId,
      name,
      classLevel,
    }).returning()

    return NextResponse.json({ class: newClass[0] })
  } catch (error) {
    console.error('[v0] Failed to create class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
