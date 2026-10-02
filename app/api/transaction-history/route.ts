import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transactions, appUsers } from '@/lib/db/schema'
import { eq, desc, or, inArray } from 'drizzle-orm'

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

    const phoneCandidates = Array.from(new Set([
      phoneNumber,
      phoneNumber.startsWith('0') ? `88${phoneNumber.slice(1)}` : phoneNumber,
      phoneNumber.startsWith('88') ? `0${phoneNumber.slice(2)}` : phoneNumber,
    ]))
    const account = await db.query.appUsers.findFirst({
      where: (users, { or }) => or(...phoneCandidates.map((phone) => eq(users.phoneNumber, phone))),
    })

    if (!account) {
      return NextResponse.json({ success: true, transactions: [], total: 0 })
    }

    // Include both the current user-id records and legacy records saved by phone.
    const userTransactions = await db.query.transactions.findMany({
      where: or(
        eq(transactions.userid, account.id),
        inArray(transactions.phonenumber, phoneCandidates),
      ),
      orderBy: [desc(transactions.createdAt)],
    })

    const formattedTransactions = userTransactions.map((txn) => {
      const description = txn.description || ''
      const received = /^received|^money received/i.test(description)
      const partnerMatch = description.match(/(?:to|from)\s+([+\d\s-]+)/i)
      const partnerPhone = partnerMatch?.[1]?.replace(/\D/g, '') || ''
      const displayPartner = partnerPhone.startsWith('88') ? `0${partnerPhone.slice(2)}` : partnerPhone
      const isAccountRecord = txn.userid === account.id
      const isReceived = /^received|^money received/i.test(description)
      const isSent = !isReceived && (isAccountRecord || phoneCandidates.includes(txn.phonenumber))
      return {
        id: txn.id,
        type: isReceived ? 'received' : isSent ? 'sent' : 'received',
        amount: Number(txn.amount),
        otherPhone: displayPartner,
        sender_phone: received ? displayPartner : phoneNumber,
        receiver_phone: received ? phoneNumber : displayPartner,
        transaction_type: received ? 'Money Received' : txn.type,
        reference: txn.id,
        status: txn.status || 'completed',
        description,
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
