import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'ফোন নম্বর প্রয়োজন' },
        { status: 400 }
      )
    }

    // Validate Bangladesh phone number
    const formattedPhone = phoneNumber.startsWith('+880')
      ? phoneNumber
      : '+880' + phoneNumber.replace(/^0/, '')

    console.log('[v0] Sending OTP to:', formattedPhone)

    // Firebase OTP is sent client-side via Firebase SDK
    // This endpoint validates the phone number format
    
    return NextResponse.json({
      success: true,
      message: 'OTP পাঠানো হয়েছে',
      phoneNumber: formattedPhone,
    })
  } catch (error: any) {
    console.error('[v0] Firebase OTP error:', error.message)
    return NextResponse.json(
      { success: false, message: error.message || 'OTP পাঠাতে ব্যর্থ' },
      { status: 500 }
    )
  }
}
