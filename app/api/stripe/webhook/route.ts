import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event
    try {
      const stripe = getStripe()
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('[v0] Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('[v0] Webhook event received:', event.type)

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any

      if (session.payment_status === 'paid') {
        const phoneNumber = session.metadata?.phoneNumber
        const takaAmount = parseInt(session.metadata?.takaAmount || '0')

        console.log('[v0] Payment successful for:', phoneNumber, 'Amount:', takaAmount)

        if (phoneNumber && takaAmount > 0) {
          try {
            // Get current user and balance
            const user = await db
              .select()
              .from(appUsers)
              .where(eq(appUsers.phoneNumber, phoneNumber))
              .limit(1)

            if (user.length === 0) {
              console.error('[v0] User not found:', phoneNumber)
              return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
              )
            }

            const currentBalance = user[0].balance || 0
            const newBalance = currentBalance + takaAmount

            // Update user balance in database
            await db
              .update(appUsers)
              .set({ balance: newBalance, updatedAt: new Date() })
              .where(eq(appUsers.phoneNumber, phoneNumber))

            console.log(
              '[v0] Balance updated successfully. New balance:',
              newBalance
            )

            // TODO: Send SMS/email notification to user
          } catch (dbError) {
            console.error('[v0] Database error:', dbError)
            return NextResponse.json(
              { error: 'Database error occurred' },
              { status: 500 }
            )
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
