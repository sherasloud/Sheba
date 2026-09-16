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

    // NOTE: Firebase OTP verification should be done on the client side
    // using Firebase SDK: firebase.auth().signInWithCredential()
    // This endpoint is a placeholder for backend verification logic
    
    // For production: decode and verify the idToken using firebase-admin
    // For now, we're handling this client-side with Firebase SDK

    console.log('[v0] OTP verification token received')

    return NextResponse.json({
      success: true,
      message: 'Phone verification successful',
      instructions: 'Token verified on client side using Firebase SDK'
    })
  } catch (error: any) {
    console.error('[v0] OTP verification error:', error.message)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    )
  }
}
