import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers, serviceProviders, servicePayments, transactions, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { userPhone, providerId, amount, description } = await req.json()

    if (!userPhone || !providerId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 })
    }

    const trimmedUserPhone = userPhone.trim()

    // Get user
    const user = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, trimmedUserPhone),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get service provider
    const provider = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.id, providerId),
    })

    if (!provider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 })
    }

    if (!provider.isVerified) {
      return NextResponse.json({ error: 'Service provider not verified' }, { status: 400 })
    }

    // Check sufficient balance
    if ((user.balance || 0) < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const transactionId = `SRV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Deduct from user balance
    const newUserBalance = (user.balance || 0) - amount

    await db
      .update(appUsers)
      .set({ balance: newUserBalance })
      .where(eq(appUsers.phoneNumber, trimmedUserPhone))

    // Add to provider balance
    const newProviderBalance = (provider.balance || 0) + amount

    await db
      .update(serviceProviders)
      .set({ balance: newProviderBalance })
      .where(eq(serviceProviders.id, providerId))

    // Save user transaction
    try {
      await db.insert(transactions).values({
        id: transactionId,
        userid: user.id,
        phonenumber: trimmedUserPhone,
        amount: amount,
        balanceBefore: user.balance || 0,
        balanceAfter: newUserBalance,
        type: 'service',
        status: 'completed',
        description: `Service payment to ${provider.name}`,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to save user transaction:', err)
    }

    // Save service payment record
    try {
      await db.insert(servicePayments).values({
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userPhone: trimmedUserPhone,
        providerId: providerId,
        amount: amount,
        description: description || `Service: ${provider.type}`,
        status: 'completed',
        transactionId: transactionId,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to save payment record:', err)
    }

    // Send notification to user
    try {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: trimmedUserPhone,
        message: `${provider.name} কে ৳${amount} সেবা পেমেন্ট সম্পন্ন হয়েছে`,
        type: 'payment',
        isRead: false,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to send user notification:', err)
    }

    // Send notification to provider
    try {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: provider.phone,
        message: `আপনি ৳${amount} সেবা পেমেন্ট পেয়েছেন (ID: ${transactionId})`,
        type: 'payment',
        isRead: false,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to send provider notification:', err)
    }

    return NextResponse.json(
      {
        message: 'Payment successful',
        transactionId: transactionId,
        newBalance: newUserBalance,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Service payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
