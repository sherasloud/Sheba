import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone required' },
        { status: 400 }
      )
    }

    const trimmedPhone = phone.trim()

    // Get all transactions for this phone number
    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.phonenumber, trimmedPhone),
    })

    // Sort by date descending (newest first)
    const sorted = userTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      transactions: sorted.map((tx) => ({
        id: tx.id,
        userid: tx.userid,
        phonenumber: tx.phonenumber,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        createdAt: tx.createdAt,
      })),
      count: sorted.length,
    })
  } catch (error) {
    console.error('[v0] Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
