import { db } from '@/lib/db'
import { appUsers, transactions, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { senderPhone, receiverPhone, amount } = await request.json()

    if (!senderPhone || !receiverPhone || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Trim phone numbers
    const trimmedSenderPhone = senderPhone.trim()
    const trimmedReceiverPhone = receiverPhone.trim()



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
    if (trimmedSenderPhone === trimmedReceiverPhone) {
      return NextResponse.json(
        { success: false, error: 'নিজেকে টাকা পাঠানো যায় না' },
        { status: 400 }
      )
    }

    // Get or create receiver
    let receiver = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, trimmedReceiverPhone),
    })

    if (!receiver) {

      // Auto-create receiver profile
      const [newReceiver] = await db
        .insert(appUsers)
        .values({
          phoneNumber: trimmedReceiverPhone,
          fullName: `User ${trimmedReceiverPhone.slice(-4)}`,
          pin: '123456', // Default PIN
          balance: 0,
          emailVerified: false,
          accountType: 'personal',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      receiver = newReceiver
    }

    // Perform transaction
    const newSenderBalance = senderBalance - amount
    const newReceiverBalance = Number(receiver.balance) + amount



    // Update sender balance
    await db
      .update(appUsers)
      .set({
        balance: newSenderBalance,
        updatedAt: new Date(),
      })
      .where(eq(appUsers.phoneNumber, trimmedSenderPhone))

    // Update receiver balance
    await db
      .update(appUsers)
      .set({
        balance: newReceiverBalance,
        updatedAt: new Date(),
      })
      .where(eq(appUsers.phoneNumber, trimmedReceiverPhone))

    const transactionId = `TXN${Date.now()}`

    // Save transaction record for SENDER
    try {
      await db.insert(transactions).values({
        id: transactionId,
        userid: sender.id,
        phonenumber: trimmedSenderPhone,
        amount: amount,
        balanceBefore: senderBalance,
        balanceAfter: newSenderBalance,
        type: 'transfer',
        status: 'completed',
        description: `Transfer to ${trimmedReceiverPhone}`,
      } as any)
    } catch (txnError) {
      console.error('[v0] Failed to save sender transaction:', txnError)
    }

    // Save transaction record for RECEIVER
    try {
      // Make sure receiver exists and get fresh data
      const freshReceiver = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, trimmedReceiverPhone),
      })
      
      if (freshReceiver) {
        await db.insert(transactions).values({
          id: `${transactionId}_rcv`,
          userid: freshReceiver.id,
          phonenumber: trimmedReceiverPhone,
          amount: amount,
          balanceBefore: Number(freshReceiver.balance),
          balanceAfter: Number(freshReceiver.balance) + amount,
          type: 'transfer',
          status: 'completed',
          description: `Received from ${trimmedSenderPhone}`,
        } as any)
      }
    } catch (txnError) {
      console.error('[v0] Failed to save receiver transaction:', txnError)
    }

    // Save notification to receiver directly
    try {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: trimmedReceiverPhone.trim(),
        message: `${sender.fullName || 'User'} আপনাকে ৳${amount} পাঠিয়েছে`,
        type: 'transfer',
        isRead: false,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to save notification:', err)
    }

    return NextResponse.json(
      {
        success: true,
        transaction: {
          id: transactionId,
          reference: transactionId,
          senderPhone: trimmedSenderPhone,
          receiverPhone: trimmedReceiverPhone,
          amount,
        },
        newSenderBalance,
        newReceiverBalance,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error in send-money API:', error)
    return NextResponse.json(
      { success: false, error: 'লেনদেন প্রক্রিয়াকরণে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
