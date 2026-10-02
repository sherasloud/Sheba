import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number required' },
        { status: 400 }
      )
    }

    // Try multiple phone formats to find user
    const phonesToTry = [
      phone,
      phone.replace(/^0/, '88'),
      phone.replace(/^88/, '0'),
    ]

    let user = null
    for (const phoneToTry of phonesToTry) {
      if (!phoneToTry || phoneToTry.length < 10) continue
      
      user = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, phoneToTry),
      })
      
      if (user) {
        console.log('[v0] User found with format:', phoneToTry)
        break
      }
    }

    if (!user) {
      console.log('[v0] User not found - tried formats:', phonesToTry)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[v0] User profile fetched from Neon:', phone, 'Balance:', user.balance)

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          balance: Number(user.balance) || 0, // Convert BigInt to number
          accountType: user.accountType,
          pin: user.pin,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[v0] Error fetching user profile:', error?.message || error)
    // Return graceful fallback instead of crashing
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection error',
        user: null // Fallback for client to handle
      },
      { status: 200 } // Return 200 so client doesn't think it's a server error
    )
  }
}
