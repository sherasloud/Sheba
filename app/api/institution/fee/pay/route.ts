import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { feePayments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { feePaymentId, studentPhone, amount } = await request.json()

    if (!feePaymentId || !amount) {
      return NextResponse.json({ message: 'অনুপস্থিত তথ্য' }, { status: 400 })
    }

    // Update fee payment status
    const result = await db
      .update(feePayments)
      .set({
        status: 'paid',
        paidDate: new Date(),
      })
      .where(eq(feePayments.id, feePaymentId))
      .returning()

    if (!result.length) {
      return NextResponse.json({ message: 'ফি পাওয়া যায়নি' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'ফি পেমেন্ট সফল',
      payment: result[0],
    })
  } catch (error) {
    console.error('Fee payment error:', error)
    return NextResponse.json({ message: 'পেমেন্ট প্রক্রিয়া ব্যর্থ' }, { status: 500 })
  }
}
