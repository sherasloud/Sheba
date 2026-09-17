import { NextRequest, NextResponse } from 'next/server'
import { requestTruecallerOTP } from '@/lib/services/truecaller'

export async function POST(request: NextRequest) {
  try {
    const { phone, countryCode } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }

    console.log('[v0] Requesting Truecaller OTP for phone:', phone)

    // Request OTP from Truecaller
    const result = await requestTruecallerOTP(phone, countryCode || 'BD')

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          fallbackToSMS: true, // Suggest fallback to SMS
        },
        { status: 400 }
      )
    }

    // Store requestId in session for later verification
    const response = NextResponse.json({
      success: true,
      message: 'OTP sent via Truecaller',
      phone,
      requestId: result.requestId,
      method: 'truecaller',
    })

    // Set cookie with requestId (valid for 10 minutes)
    response.cookies.set(`truecaller_request_${phone}`, result.requestId || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
    })

    return response
  } catch (error: any) {
    console.error('[v0] Truecaller request error:', error.message)
    return NextResponse.json(
      {
        success: false,
        message: 'Server error: ' + error.message,
        fallbackToSMS: true,
      },
      { status: 500 }
    )
  }
}
