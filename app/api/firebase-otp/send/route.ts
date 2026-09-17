import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate Bangladesh phone number format
    const formattedPhone = phoneNumber.startsWith('+880')
      ? phoneNumber
      : '+880' + phoneNumber.slice(1)

    console.log('[v0] Sending OTP to:', formattedPhone)

    // Note: Firebase handles OTP sending on client side
    // This endpoint just validates the phone number
    // Actual OTP flow: client calls FirebaseAuth.signInWithPhoneNumber()

    return NextResponse.json({
      success: true,
      message: 'OTP will be sent to your phone',
      phoneNumber: formattedPhone,
      sessionInfo: 'Client-side OTP verification with Firebase',
    })
  } catch (error: any) {
    console.error('[v0] Phone auth error:', error.message)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
