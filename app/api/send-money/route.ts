import { db } from '@/lib/db'
import { appUsers, transactions, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { shebaSMS } from '@/lib/api/sheba-sms-service'

export async function POST(request: NextRequest) {
  try {
    const { senderPhone, receiverPhone, amount: rawAmount } = await request.json()
    const amount = Number(rawAmount)

    if (!senderPhone || !receiverPhone || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Normalize Bangladesh phone numbers before querying or writing records.
    const normalizePhone = (value: string) => {
      const digits = String(value).replace(/\D/g, '')
      return digits.startsWith('0') ? `88${digits.slice(1)}` : digits
    }

    const trimmedSenderPhone = normalizePhone(senderPhone)
    const trimmedReceiverPhone = normalizePhone(receiverPhone)



    const phoneCandidates = (value: string) => {
      const digits = String(value).replace(/\D/g, '')
      return Array.from(new Set([
        digits,
        digits.startsWith('0') ? `88${digits.slice(1)}` : digits,
        digits.startsWith('88') ? `0${digits.slice(2)}` : digits,
      ]))
    }

    const findUserByPhone = async (value: string) => {
      for (const candidate of phoneCandidates(value)) {
        const user = await db.query.appUsers.findFirst({
          where: eq(appUsers.phoneNumber, candidate),
        })
        if (user) return user
      }
      return null
    }

    // Get sender from Neon database, accepting local and international formats.
    const sender = await findUserByPhone(senderPhone)

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
    let receiver = await findUserByPhone(receiverPhone)

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
    const receiverBalance = Number(receiver.balance)
    const newSenderBalance = senderBalance - amount
    const newReceiverBalance = receiverBalance + amount

    // Update by primary key. Phone numbers may be stored as 01... or 88...,
    // so updating by the normalized phone can silently match zero rows.
    const [updatedSender] = await db
      .update(appUsers)
      .set({ balance: newSenderBalance, updatedAt: new Date() })
      .where(eq(appUsers.id, sender.id))
      .returning({ id: appUsers.id })

    if (!updatedSender) {
      return NextResponse.json(
        { success: false, error: 'প্রেরকের ব্যালেন্স আপডেট করা যায়নি' },
        { status: 500 },
      )
    }

    const [updatedReceiver] = await db
      .update(appUsers)
      .set({ balance: newReceiverBalance, updatedAt: new Date() })
      .where(eq(appUsers.id, receiver.id))
      .returning({ id: appUsers.id })

    if (!updatedReceiver) {
      // Compensate the sender if the receiver update cannot be committed.
      await db
        .update(appUsers)
        .set({ balance: senderBalance, updatedAt: new Date() })
        .where(eq(appUsers.id, sender.id))
      return NextResponse.json(
        { success: false, error: 'গ্রাহকের ব্যালেন্স আপডেট করা যায়নি' },
        { status: 500 },
      )
    }

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
      if (receiver) {
        await db.insert(transactions).values({
          id: `${transactionId}_rcv`,
          userid: receiver.id,
          phonenumber: trimmedReceiverPhone,
          amount: amount,
          balanceBefore: receiverBalance,
          balanceAfter: newReceiverBalance,
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

    const smsResults = await Promise.all([
      shebaSMS.sendTransactionSMS(trimmedSenderPhone, "transfer", amount, newSenderBalance, {
        fee: 0,
        transactionId,
        label: "Send Money Successful",
        userNumber: trimmedReceiverPhone,
      }),
      shebaSMS.sendTransactionSMS(trimmedReceiverPhone, "transfer", amount, newReceiverBalance, {
        fee: 0,
        transactionId: `${transactionId}_rcv`,
        label: "Money Received Successfully",
        userNumber: trimmedSenderPhone,
      }),
    ])
    console.log("[v0] Send money transaction SMS results:", smsResults.map((result) => ({ success: result.success, message: result.message })))

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
