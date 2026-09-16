import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { eq, or, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phone')

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number required' },
        { status: 400 }
      )
    }

    // এই user এর সব transaction - sent এবং received দুটোই
    const userTransactions = await db.query.transactions.findMany({
      where: or(
        eq(transactions.fromPhone, phoneNumber),
        eq(transactions.toPhone, phoneNumber)
      ),
      orderBy: [desc(transactions.createdAt)],
    })

    const formattedTransactions = userTransactions.map((txn) => ({
      id: txn.id,
      type: txn.fromPhone === phoneNumber ? 'sent' : 'received',
      amount: txn.amount,
      otherPhone: txn.fromPhone === phoneNumber ? txn.toPhone : txn.fromPhone,
      status: txn.status,
      description: txn.description,
      date: txn.createdAt?.toISOString().split('T')[0],
      time: txn.createdAt?.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: txn.createdAt?.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      total: formattedTransactions.length,
    })
  } catch (error: any) {
    console.error('[v0] Transaction history error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch history: ' + error.message },
      { status: 500 }
    )
  }
}
