import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { classId, institutionId, name, rollNo, parentPhone } = await request.json()

    if (!classId || !institutionId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newStudent = await db.insert(students).values({
      id: `student_${Date.now()}`,
      classId,
      institutionId,
      name,
      rollNo: rollNo || null,
      parentPhone: parentPhone || null,
    }).returning()

    return NextResponse.json({ student: newStudent[0] })
  } catch (error) {
    console.error('[v0] Failed to create student:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
