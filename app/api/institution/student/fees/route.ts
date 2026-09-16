import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { feePayments, feeStructures, students, classes, institutions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { studentPhone } = await request.json()

    if (!studentPhone) {
      return NextResponse.json({ message: 'ফোন নম্বর প্রয়োজন' }, { status: 400 })
    }

    // Get all students for this phone with their fees
    const studentFees = await db
      .select({
        id: feePayments.id,
        studentId: feePayments.studentId,
        feeName: feeStructures.feeName,
        amount: feePayments.amount,
        status: feePayments.status,
        dueDate: feePayments.dueDate,
        paidDate: feePayments.paidDate,
        className: classes.name,
        rollNo: students.rollNo,
      })
      .from(feePayments)
      .innerJoin(feeStructures, eq(feePayments.feeStructureId, feeStructures.id))
      .innerJoin(students, eq(feePayments.studentId, students.id))
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.parentPhone, studentPhone))

    return NextResponse.json({
      success: true,
      fees: studentFees || [],
    })
  } catch (error) {
    console.error('Error fetching student fees:', error)
    return NextResponse.json({ message: 'ফি লোড করতে ব্যর্থ' }, { status: 500 })
  }
}
