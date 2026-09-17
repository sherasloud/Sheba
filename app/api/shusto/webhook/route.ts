import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceProviders, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Webhook from Shusto - receives payments for Sheba providers
export async function POST(req: NextRequest) {
  try {
    // Verify request is from Shusto
    const sustoSecret = req.headers.get('x-shusto-secret')
    if (sustoSecret !== process.env.SHUSTO_API_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid Shusto secret' },
        { status: 401 }
      )
    }

    const { userPhone, providerId, amount, description, transactionId } = await req.json()

    if (!providerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get provider
    const provider = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.id, providerId),
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Update provider balance (Real-time!)
    const newBalance = (provider.balance || 0) + amount
    await db.update(serviceProviders).set({
      balance: newBalance,
    }).where(eq(serviceProviders.id, providerId))

    // Send notification to Sheba provider
    try {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: provider.phone,
        message: `Shusto থেকে ৳${amount} পেমেন্ট পেয়েছেন। নতুন balance: ৳${newBalance}`,
        type: 'payment',
        isRead: false,
      } as any)
    } catch (err) {
      console.error('[v0] Error sending notification:', err)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment received successfully',
        providerId,
        newBalance,
        transactionId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Sheba webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
