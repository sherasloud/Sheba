import { db } from '@/lib/db'
import { appUsers, serviceProviders, servicePayments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userPhone, providerId, amount, description } = body

    // Verify provider exists and is verified
    const provider = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.id, providerId),
    })

    if (!provider || !provider.isVerified) {
      return NextResponse.json(
        { error: 'Provider not verified' },
        { status: 403 }
      )
    }

    // Get user
    const user = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, userPhone),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check user has sufficient balance
    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance', required: amount, available: user.balance },
        { status: 400 }
      )
    }

    // Create transaction ID
    const transactionId = `SHEBA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Deduct from user
    const newUserBalance = user.balance - amount
    await db
      .update(appUsers)
      .set({ balance: newUserBalance })
      .where(eq(appUsers.id, user.id))

    // Add to provider balance
    const newProviderBalance = (provider.balance || 0) + amount
    await db
      .update(serviceProviders)
      .set({ balance: newProviderBalance })
      .where(eq(serviceProviders.id, providerId))

    // Save payment record
    await db.insert(servicePayments).values({
      id: transactionId,
      userPhone: userPhone,
      providerId: providerId,
      amount: amount,
      description: description || 'Service Payment',
      status: 'completed',
      transactionId: transactionId,
    } as any)

    // Create notification for user
    const { notifications } = await import('@/lib/db/schema')
    await db.insert(notifications).values({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phonenumber: userPhone.trim(),
      message: `৳${amount} ${provider.name} এ পাঠানো হয়েছে`,
      type: 'payment',
      isRead: false,
    } as any)

    return NextResponse.json({
      success: true,
      transactionId: transactionId,
      message: 'Payment processed successfully',
      userNewBalance: newUserBalance,
      providerNewBalance: newProviderBalance,
    })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET endpoint for API status check
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'active',
    message: 'Sheba Webhook API is running',
    docs: 'POST to this endpoint with { userPhone, providerId, amount, description }',
  })
}
