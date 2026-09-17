import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceProviders, transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Only shusto.com can use this API
const SHUSTO_API_KEY = process.env.SHUSTO_API_KEY || 'shusto_secure_key_2026'

export async function POST(req: NextRequest) {
  try {
    // Verify API Key - Only authorized sources can access
    const apiKey = req.headers.get('x-api-key')
    const origin = req.headers.get('origin')
    
    if (!apiKey || apiKey !== SHUSTO_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API Key' },
        { status: 401 }
      )
    }

    const { phone, amount, bankName } = await req.json()

    if (!phone || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    const trimmedPhone = phone.trim()

    // Get provider
    const provider = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.phone, trimmedPhone),
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    if (!provider.isVerified) {
      return NextResponse.json(
        { error: 'Provider not verified' },
        { status: 403 }
      )
    }

    const balance = Number(provider.balance || 0)
    if (balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Update provider balance
    const newBalance = balance - amount
    await db.update(serviceProviders).set({
      balance: newBalance,
    }).where(eq(serviceProviders.phone, trimmedPhone))

    // Record transaction
    const withdrawId = `SHEBA_WD_${Date.now()}`
    await db.insert(transactions).values({
      id: withdrawId,
      userid: provider.id,
      phonenumber: trimmedPhone,
      amount: amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
      type: 'withdraw',
      status: 'completed',
      description: `Withdraw to ${bankName || 'Bank Account'}`,
    } as any)

    // Notify Shusto about the balance change (real-time update)
    try {
      const sustoWebhookUrl = process.env.SHUSTO_WEBHOOK_URL || 'https://shusto.com/api/sheba/confirm-to-shusto'
      await fetch(sustoWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sheba-secret': process.env.SHEBA_API_SECRET || 'sheba_secret_key_2026',
        },
        body: JSON.stringify({
          phone: trimmedPhone,
          amount: amount,
          transactionId: withdrawId,
          action: 'withdraw-confirmation',
        }),
      })
    } catch (notifyError) {
      console.error('[v0] Failed to notify Shusto:', notifyError)
      // Don't fail the withdrawal if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Withdrawal successful - Balance updated in real-time',
        withdrawId: withdrawId,
        newBalance: newBalance,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Withdraw error:', error)
    return NextResponse.json(
      { error: 'Withdrawal failed' },
      { status: 500 }
    )
  }
}
