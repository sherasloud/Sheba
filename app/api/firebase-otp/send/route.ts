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

    // Validate and format Bangladesh phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    let formattedPhone = ''

    if (cleanPhone.startsWith('88')) {
      formattedPhone = '+' + cleanPhone
    } else if (cleanPhone.startsWith('01')) {
      formattedPhone = '+880' + cleanPhone.substring(1)
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid Bangladesh phone number' },
        { status: 400 }
      )
    }

    console.log('[v0] OTP request for phone:', formattedPhone)

    // NOTE: Firebase OTP is handled on the client-side using Firebase SDK
    // The backend only validates the phone number and prepares the response
    // Client will use: firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)

    return NextResponse.json({
      success: true,
      message: 'Phone number validated. Proceed with Firebase OTP on client.',
      phoneNumber: formattedPhone,
      status: 'ready_for_otp'
    })
  } catch (error: any) {
    console.error('[v0] OTP send error:', error.message)
    return NextResponse.json(
      { success: false, message: 'Error: ' + error.message },
      { status: 500 }
    )
  }
}
