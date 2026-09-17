import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/lib/models/user'

export async function POST(request: NextRequest) {
  try {
    const { phone, pin, fullName, accountType } = await request.json()

    if (!phone || !pin || !fullName) {
      return NextResponse.json(
        { success: false, message: 'Phone, PIN, and name required' },
        { status: 400 }
      )
    }

    console.log('[v0] Creating user for phone:', phone)

    // Check if user already exists
    const existingUser = await UserModel.findByPhone(phone)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new user with default balance
    const newUser = await UserModel.create({
      phoneNumber: phone,
      pin,
      fullName,
      balance: 0,
      accountType: accountType || 'personal',
    })

    console.log('[v0] User created successfully:', phone)

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          phoneNumber: newUser.phoneNumber,
          fullName: newUser.fullName,
          balance: newUser.balance,
          accountType: newUser.accountType,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[v0] Error creating user:', error.message)
    return NextResponse.json(
      { success: false, message: 'Error creating user: ' + error.message },
      { status: 500 }
    )
  }
}
