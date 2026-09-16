import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone: inputPhone } = await request.json()

    if (!inputPhone) {
      return NextResponse.json(
        { success: false, error: 'Phone number required' },
        { status: 400 }
      )
    }

    console.log('[v0] GET-PROFILE: Looking up phone:', inputPhone)

    // Try multiple phone formats
    const phonesToTry = [
      inputPhone, // Original
      inputPhone.replace(/^0/, '88'), // 01930314459 -> 881930314459
      inputPhone.replace(/^88/, '0'), // 881930314459 -> 01930314459
      '+88' + inputPhone.replace(/^0/, ''), // 01930314459 -> +881930314459
      '+88' + inputPhone.replace(/^88/, ''), // 881930314459 -> +881930314459
    ]

    let user = null
    for (const phone of phonesToTry) {
      if (!phone || phone.length < 10) continue
      
      console.log('[v0] GET-PROFILE: Trying format:', phone)
      user = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, phone),
      })
      
      if (user) {
        console.log('[v0] GET-PROFILE: Found with format:', phone)
        break
      }
    }

    if (!user) {
      console.log('[v0] GET-PROFILE: User not found - tried formats:', phonesToTry)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[v0] GET-PROFILE: User found:', {
      phone: user.phoneNumber,
      name: user.fullName,
      accountType: user.accountType,
    })

    console.log('[v0] GET-PROFILE: Returning response with accountType:', user.accountType)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        pin: user.pin,
        balance: Number(user.balance),
        accountType: user.accountType,
        account_type: user.accountType, // Include both formats
        isNIDVerified: user.isNIDVerified,
        faceVerified: user.faceVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    })
  } catch (error) {
    console.error('[v0] GET-PROFILE: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
