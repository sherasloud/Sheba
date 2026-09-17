import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/lib/models/user'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number required' },
        { status: 400 }
      )
    }

    console.log('[v0] Checking user for phone:', phone)

    const user = await UserModel.findByPhone(phone)

    if (user) {
      return NextResponse.json(
        {
          success: true,
          exists: true,
          message: 'User found',
          user: {
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            balance: user.balance,
            accountType: user.accountType,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        exists: false,
        message: 'User not found - new account can be created',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[v0] Error checking user:', error.message)
    return NextResponse.json(
      { success: false, message: 'Error checking user: ' + error.message },
      { status: 500 }
    )
  }
}
