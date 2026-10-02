import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { eq, or, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawPhoneNumber = searchParams.get('phone')
    const phoneNumber = rawPhoneNumber?.replace(/\D/g, '')

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number required' },
        { status: 400 }
      )
    }

    // এই user এর সব transaction - sent এবং received দুটোই
    const phoneCandidates = Array.from(new Set([
      phoneNumber,
      phoneNumber.startsWith('0') ? `88${phoneNumber.slice(1)}` : phoneNumber,
      phoneNumber.startsWith('88') ? `0${phoneNumber.slice(2)}` : phoneNumber,
    ]))
    const userTransactions = await db.query.transactions.findMany({
      where: or(
        ...phoneCandidates.flatMap((phone) => [
          eq(transactions.fromPhone, phone),
          eq(transactions.toPhone, phone),
        ])
      ),
      orderBy: [desc(transactions.createdAt)],
    })

    const formattedTransactions = userTransactions.map((txn) => {
      const isSent = phoneCandidates.includes(txn.fromPhone)
      return {
        id: txn.id,
        type: isSent ? 'sent' : 'received',
        amount: Number(txn.amount),
        otherPhone: isSent ? txn.toPhone : txn.fromPhone,
        sender_phone: txn.fromPhone,
        receiver_phone: txn.toPhone,
        transaction_type: isSent ? 'Send Money' : 'Money Received',
        reference: txn.id,
        status: txn.status || 'completed',
        description: txn.description || '',
        date: txn.createdAt?.toISOString().split('T')[0],
        time: txn.createdAt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        createdAt: txn.createdAt?.toISOString(),
        created_at: txn.createdAt?.toISOString(),
      }
    })

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
