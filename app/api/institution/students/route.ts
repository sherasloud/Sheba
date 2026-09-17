import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 })
    }

    const classStudents = await db.query.students.findMany({
      where: eq(students.classId, classId),
    })

    return NextResponse.json({ students: classStudents })
  } catch (error) {
    console.error('[v0] Failed to fetch students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
