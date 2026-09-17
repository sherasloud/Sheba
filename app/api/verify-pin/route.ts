import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json()

    if (!phone || !pin) {
      return NextResponse.json(
        { success: false, message: 'Phone and PIN required' },
        { status: 400 }
      )
    }

    // Trim and normalize phone number
    const trimmedPhone = phone.trim()
    console.log('[v0] Verifying PIN for phone:', trimmedPhone)

    // Verify PIN from Neon database
    let user = null
    try {
      user = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, trimmedPhone),
      })
    } catch (dbError: any) {
      console.error('[v0] Database error:', dbError.message)
      return NextResponse.json(
        { success: false, message: 'Database error. Please try again.' },
        { status: 500 }
      )
    }

    if (!user) {
      console.log('[v0] PIN verification failed: user not found for phone:', trimmedPhone)
      return NextResponse.json(
        { 
          success: false, 
          message: 'প্রেরকের অ্যাকাউন্ট পাওয়া যাই নি',
          verified: false 
        },
        { status: 404 }
      )
    }

    // Verify PIN
    if (user.pin !== pin) {
      console.log('[v0] PIN verification failed: incorrect PIN for phone:', trimmedPhone, 'provided:', pin, 'stored:', user.pin)
      return NextResponse.json(
        { 
          success: false, 
          message: 'ভুল পিন। আবার চেষ্টা করুন।',
          verified: false 
        },
        { status: 401 }
      )
    }

    console.log('[v0] PIN verified successfully for phone:', trimmedPhone)
    return NextResponse.json(
      {
        success: true,
        verified: true,
        message: 'PIN verified successfully',
        user: {
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          balance: Number(user.balance),
          accountType: user.accountType,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[v0] Error verifying PIN:', error.message)
    return NextResponse.json(
      { success: false, message: 'Error verifying PIN: ' + error.message },
      { status: 500 }
    )
  }
}
