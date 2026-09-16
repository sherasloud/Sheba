import { NextRequest, NextResponse } from 'next/server'
import { verifyTruecallerOTP } from '@/lib/services/truecaller'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone, token, requestId } = await request.json()

    if (!phone || !token || !requestId) {
      return NextResponse.json(
        { success: false, message: 'Phone, token, and requestId are required' },
        { status: 400 }
      )
    }

    console.log('[v0] Verifying Truecaller OTP for phone:', phone)

    // Verify OTP with Truecaller
    const verifyResult = await verifyTruecallerOTP(phone, token, requestId)

    if (!verifyResult.success || !verifyResult.verified) {
      return NextResponse.json(
        {
          success: false,
          message: verifyResult.message || 'OTP verification failed',
        },
        { status: 401 }
      )
    }

    console.log('[v0] Truecaller OTP verified successfully')

    // Check if user exists in database
    let existingUser = null
    try {
      existingUser = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, phone),
      })
      console.log('[v0] User exists in database:', !!existingUser)
    } catch (dbError: any) {
      console.error('[v0] Database error during Truecaller verification:', dbError.message)
      existingUser = null
    }

    // Create auth token
    const authToken = Buffer.from(`${phone}:${Date.now()}:truecaller`).toString('base64')

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'OTP verification successful',
      authToken,
      phone,
      verified: true,
      exists: !!existingUser,
      verificationMethod: 'truecaller',
      user: existingUser
        ? {
            phoneNumber: existingUser.phoneNumber,
            fullName: existingUser.fullName,
            balance: existingUser.balance,
            accountType: existingUser.accountType,
          }
        : null,
    })

    // Set secure httpOnly cookie
    response.cookies.set('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Clear Truecaller request cookie
    response.cookies.set(`truecaller_request_${phone}`, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete cookie
    })

    return response
  } catch (error: any) {
    console.error('[v0] Truecaller verification error:', error.message)
    return NextResponse.json(
      {
        success: false,
        message: 'Server error: ' + error.message,
      },
      { status: 500 }
    )
  }
}
