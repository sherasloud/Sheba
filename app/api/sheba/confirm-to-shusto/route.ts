import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers, serviceProviders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Sheba sends confirmation back to Shusto
export async function POST(req: NextRequest) {
  try {
    // Verify it's from Sheba server
    const shebaSecret = req.headers.get('x-sheba-secret')
    if (shebaSecret !== process.env.SHEBA_API_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid Sheba secret' },
        { status: 401 }
      )
    }

    const { userId, amount, shebaProviderId, transactionId } = await req.json()

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add amount to Shusto user's balance
    const user = await db.query.appUsers.findFirst({
      where: eq(appUsers.id, userId),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const newBalance = (user.balance || 0) + amount

    await db
      .update(appUsers)
      .set({
        balance: newBalance,
      })
      .where(eq(appUsers.id, userId))

    return NextResponse.json(
      {
        success: true,
        message: 'Balance updated successfully in Shusto',
        userId,
        newBalance,
        transactionId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error confirming to Shusto:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
