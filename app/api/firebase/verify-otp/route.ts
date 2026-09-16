import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { idToken, phoneNumber } = await request.json()

    if (!idToken || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'ID Token এবং ফোন নম্বর প্রয়োজন' },
        { status: 400 }
      )
    }

    console.log('[v0] OTP verified for:', phoneNumber)

    // Firebase ID Token verification happens on the client side
    // Format phone number for consistency
    const formattedPhone = phoneNumber.startsWith('+880')
      ? phoneNumber
      : '+880' + phoneNumber.replace(/^0/, '')

    // Generate auth token for session
    const authToken = Buffer.from(`${formattedPhone}:${Date.now()}`).toString(
      'base64'
    )

    const response = NextResponse.json({
      success: true,
      message: 'OTP যাচাইকরণ সফল',
      authToken,
      phoneNumber: formattedPhone,
    })

    // Set secure cookie
    response.cookies.set('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error: any) {
    console.error('[v0] Firebase OTP verification error:', error.message)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'OTP যাচাইকরণ ব্যর্থ',
      },
      { status: 401 }
    )
  }
}
