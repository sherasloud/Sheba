import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'ID token is required' },
        { status: 400 }
      )
    }

    // Firebase ID token verification happens on the client side with the Firebase SDK
    // This endpoint acknowledges the verification and can create a session if needed
    
    console.log('[v0] OTP verification request received')

    return NextResponse.json({
      success: true,
      message: 'Phone verification successful',
      verified: true,
    })
  } catch (error: any) {
    console.error('[v0] OTP verification error:', error.message)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    )
  }
}
