import { db } from '@/lib/db'
import { feeStructures } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { institutionId, classId, feeName, feeAmount, frequency } = await request.json()

    if (!institutionId || !feeName || !feeAmount || !frequency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newFee = await db.insert(feeStructures).values({
      id: `fee_${Date.now()}`,
      institutionId,
      classId: classId || null,
      feeName,
      feeAmount,
      frequency,
    }).returning()

    return NextResponse.json({ feeStructure: newFee[0] })
  } catch (error) {
    console.error('[v0] Failed to create fee:', error)
    return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 })
  }
}
