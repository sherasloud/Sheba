import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceProviders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { phone, verificationCode } = await req.json()

    if (!phone || !verificationCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const trimmedPhone = phone.trim()

    // Find service provider
    const provider = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.phone, trimmedPhone),
    })

    if (!provider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 })
    }

    // Check if already verified
    if (provider.isVerified) {
      return NextResponse.json({ error: 'Already verified' }, { status: 400 })
    }

    // Check code expiry
    if (provider.verificationCodeExpiry && new Date() > provider.verificationCodeExpiry) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    // Verify code
    if (provider.verificationCode !== verificationCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Generate API key if not already generated
    const apiKey = provider.apiKey || `sheba_${crypto.randomBytes(32).toString('hex')}`

    // Mark as verified
    await db
      .update(serviceProviders)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
        apiKey: apiKey,
        verificationCode: null,
        verificationCodeExpiry: null,
      })
      .where(eq(serviceProviders.phone, trimmedPhone))

    const webhookUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/sheba/webhook`

    return NextResponse.json(
      {
        message: 'Verification successful',
        apiKey: apiKey,
        webhookUrl: webhookUrl,
        provider: {
          id: provider.id,
          name: provider.name,
          phone: provider.phone,
          type: provider.type,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
