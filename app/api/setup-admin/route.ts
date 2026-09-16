import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/lib/models/user'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Setting up admin account...')

    // Admin credentials
    const adminPhone = '01709783145'
    const adminPin = '872026'
    const adminName = 'Admin'

    // Check if admin already exists
    const existingAdmin = await UserModel.findByPhone(adminPhone)
    if (existingAdmin) {
      console.log('[v0] Admin already exists')
      return NextResponse.json(
        {
          success: false,
          message: 'Admin already exists',
          admin: existingAdmin,
        },
        { status: 200 }
      )
    }

    // Create admin user with high balance
    const newAdmin = await UserModel.create({
      phoneNumber: adminPhone,
      pin: adminPin,
      fullName: adminName,
      balance: 99979997979999, // Admin balance
      accountType: 'admin',
      isAdmin: true,
    })

    console.log('[v0] Admin created successfully')

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created',
        admin: {
          phoneNumber: newAdmin.phoneNumber,
          fullName: newAdmin.fullName,
          balance: newAdmin.balance,
          accountType: newAdmin.accountType,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[v0] Error setting up admin:', error.message)
    return NextResponse.json(
      { success: false, message: 'Error: ' + error.message },
      { status: 500 }
    )
  }
}
