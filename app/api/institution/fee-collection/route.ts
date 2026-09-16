import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { feePayments, feeStructures, students, classes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { institutionId } = await request.json()

    if (!institutionId) {
      return NextResponse.json({ message: 'প্রতিষ্ঠান আইডি প্রয়োজন' }, { status: 400 })
    }

    // Get all fee records for this institution
    const feeRecords = await db
      .select({
        id: feePayments.id,
        studentName: students.name,
        rollNo: students.rollNo,
        className: classes.name,
        feeName: feeStructures.feeName,
        amount: feePayments.amount,
        status: feePayments.status,
        dueDate: feePayments.dueDate,
        paidDate: feePayments.paidDate,
      })
      .from(feePayments)
      .innerJoin(feeStructures, eq(feePayments.feeStructureId, feeStructures.id))
      .innerJoin(students, eq(feePayments.studentId, students.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.institutionId, institutionId))

    return NextResponse.json({
      success: true,
      fees: feeRecords || [],
    })
  } catch (error) {
    console.error('Error fetching fee collection:', error)
    return NextResponse.json({ message: 'ফি সংগ্রহ ডেটা লোড করতে ব্যর্থ' }, { status: 500 })
  }
}
