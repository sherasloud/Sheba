import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { sendOTP } from '@/lib/services/sms'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate phone number
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('[v0] Generated OTP:', otp, 'for phone:', phone)

    // Store OTP in database with 5-minute expiry
    const supabase = createClient()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    // If Supabase is not available, just store in session storage on client
    if (!supabase) {
      console.warn('[v0] Supabase not configured, skipping OTP database storage')
      // Client will handle OTP via temporary storage
    } else {
      const { data: otpData, error: otpError } = await supabase
        .from('otp_sessions')
        .upsert(
          {
            phone: phone,
            otp: otp,
            expires_at: expiresAt,
            attempts: 0,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'phone' }
        )
        .select()
        .single()

      if (otpError) {
        console.error('[v0] Database error:', otpError.message)
        return NextResponse.json(
          { success: false, message: 'Failed to generate OTP' },
          { status: 500 }
        )
      }
    }

    // Send OTP via SMS
    try {
      const result = await sendOTP(phone, otp)
      console.log('[v0] SMS sent result:', result)

      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.message || 'Failed to send OTP' },
          { status: 500 }
        )
      }
    } catch (smsError) {
      console.error('[v0] SMS sending error:', smsError)
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP to phone' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: phone,
        expiresIn: 300, // 5 minutes in seconds
      },
    })
  } catch (error: any) {
    console.error('[v0] Error in send-otp:', error.message)
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    )
  }
}
