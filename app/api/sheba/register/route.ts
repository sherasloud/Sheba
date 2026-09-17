import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceProviders, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { phone, name, type, specialization, address } = await req.json()

    if (!phone || !name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const trimmedPhone = phone.trim()

    // Check if already registered
    const existing = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.phone, trimmedPhone),
    })

    if (existing) {
      return NextResponse.json({ error: 'Service provider already registered' }, { status: 400 })
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create service provider with pending verification
    const provider = await db.insert(serviceProviders).values({
      id: `sheba_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phone: trimmedPhone,
      name,
      type,
      specialization: specialization || null,
      address: address || null,
      verificationCode,
      verificationCodeExpiry: expiryTime,
      isVerified: false,
    } as any)

    // Send notification with code
    try {
      await db.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonenumber: trimmedPhone,
        message: `সুস্থো নিবন্ধন: আপনার যাচাইকরণ কোড: ${verificationCode}`,
        type: 'verification',
        isRead: false,
      } as any)
    } catch (err) {
      console.error('[v0] Failed to save notification:', err)
    }

    return NextResponse.json(
      {
        message: 'Verification code sent',
        phone: trimmedPhone,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Service provider registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
