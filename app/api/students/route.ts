import { NextResponse } from 'next/server'

// Store students in memory - in production, use database
let studentsStore: any[] = []

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const institutionName = searchParams.get('institutionName')

    if (institutionName) {
      const filtered = studentsStore.filter(s => s.institutionName === institutionName)
      return NextResponse.json({ students: filtered, success: true })
    }

    if (institutionId) {
      const filtered = studentsStore.filter(s => s.institutionId === institutionId)
      return NextResponse.json({ students: filtered, success: true })
    }

    return NextResponse.json({ students: studentsStore, success: true })
  } catch (error) {
    console.error('[v0] Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.name || !data.roll || !data.studentId || !data.institutionName) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    const newStudent = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }

    studentsStore.push(newStudent)

    return NextResponse.json({ success: true, student: newStudent })
  } catch (error) {
    console.error('[v0] Error adding student:', error)
    return NextResponse.json(
      { error: 'Failed to add student', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json()
    const { index } = data

    if (typeof index !== 'number' || index < 0 || index >= studentsStore.length) {
      return NextResponse.json(
        { error: 'Invalid index', success: false },
        { status: 400 }
      )
    }

    studentsStore.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student', success: false },
      { status: 500 }
    )
  }
}
