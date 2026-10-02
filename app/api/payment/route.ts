import { db } from '@/lib/db'
import { appUsers, transactions, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { senderPhone, recipientPhone, amount } = await request.json()

    if (!senderPhone || !recipientPhone || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    const trimmedSenderPhone = senderPhone.trim()
    const trimmedRecipientPhone = recipientPhone.trim()

    console.log('[v0] Payment request:', {
      senderPhone: trimmedSenderPhone,
      recipientPhone: trimmedRecipientPhone,
      amount,
    })

    // Get sender from Neon database
    const sender = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, trimmedSenderPhone),
    })

    if (!sender) {
      return NextResponse.json(
        { success: false, error: 'প্রেরকের অ্যাকাউন্ট পাওয়া যায়নি' },
        { status: 404 }
      )
    }

    // Check sender balance
    const senderBalance = Number(sender.balance)
    if (senderBalance < amount) {
      return NextResponse.json(
        { success: false, error: 'অপর্যাপ্ত ব্যালেন্স' },
        { status: 400 }
      )
    }

    // Prevent sending to self
    if (trimmedSenderPhone === trimmedRecipientPhone) {
      return NextResponse.json(
        { success: false, error: 'নিজেকে পেমেন্ট পাঠানো যায় না' },
        { status: 400 }
      )
    }

    // Get or create recipient
    let recipient = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, trimmedRecipientPhone),
    })

    if (!recipient) {
      const [newRecipient] = await db
        .insert(appUsers)
        .values({
          phoneNumber: trimmedRecipientPhone,
          fullName: `User ${trimmedRecipientPhone.slice(-4)}`,
          pin: '123456',
          balance: 0,
          emailVerified: false,
          accountType: 'personal',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      recipient = newRecipient
    }

    // Perform payment
    const recipientBalance = Number(recipient.balance)
    const newSenderBalance = senderBalance - amount
    const newRecipientBalance = recipientBalance + amount

    // Update sender balance
    await db
      .update(appUsers)
      .set({
        balance: newSenderBalance,
        updatedAt: new Date(),
      })
      .where(eq(appUsers.phoneNumber, trimmedSenderPhone))

    // Update recipient balance
    await db
      .update(appUsers)
      .set({
        balance: newRecipientBalance,
        updatedAt: new Date(),
      })
      .where(eq(appUsers.phoneNumber, trimmedRecipientPhone))

    const transactionId = `PAY${Date.now()}`

    // Save payment transaction record
    try {
      await db.insert(transactions).values({
        id: transactionId,
        userid: sender.id,
        phonenumber: trimmedSenderPhone,
        amount: amount,
        balanceBefore: senderBalance,
        balanceAfter: newSenderBalance,
        type: 'payment',
        status: 'completed',
        description: `Payment to ${trimmedRecipientPhone}`,
      } as any)
    } catch (txnError) {
      console.error('[v0] Failed to save payment record:', txnError)
    }

    // Save transaction record for RECIPIENT
    try {
      await db.insert(transactions).values({
        id: `${transactionId}_rcv`,
        userid: recipient.id,
        phonenumber: trimmedRecipientPhone,
        amount: amount,
        balanceBefore: recipientBalance,
        balanceAfter: newRecipientBalance,
        type: 'payment',
        status: 'completed',
        description: `Received from ${trimmedSenderPhone}`,
      } as any)
    } catch (txnError) {
      console.error('[v0] Failed to save recipient payment record:', txnError)
    }

    // Save notification to recipient
    try {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: trimmedRecipientPhone.trim(),
        message: `${sender.fullName || 'User'} আপনার কাছ থেকে ৳${amount} পেমেন্ট নিয়েছে`,
        type: 'payment',
        isRead: false,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to save payment notification:', err)
    }

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: transactionId,
          reference: transactionId,
          senderPhone: trimmedSenderPhone,
          recipientPhone: trimmedRecipientPhone,
          amount,
        },
        newSenderBalance,
        newRecipientBalance,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error in payment API:', error)
    return NextResponse.json(
      { success: false, error: 'পেমেন্ট প্রক্রিয়াকরণে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
