import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone, name, accountType } = await request.json()
    
    // Normalize account type to lowercase for consistency
    const normalizedAccountType = accountType?.toLowerCase() || 'personal'

    console.log('[v0] /api/add-account - Received:', { phone, name, accountType, normalized: normalizedAccountType })

    if (!phone || !name || !normalizedAccountType) {
      console.error('[v0] Missing required fields:', { phone: !!phone, name: !!name, accountType: !!normalizedAccountType })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if account exists
    const existingUser = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, phone),
    })

    console.log('[v0] Existing user check:', existingUser ? `Found: ${existingUser.phoneNumber} (type: ${existingUser.accountType})` : 'Not found')

    if (existingUser) {
      // Update existing account type with normalized value
      console.log('[v0] Updating account type from', existingUser.accountType, 'to', normalizedAccountType)
      
      await db.update(appUsers)
        .set({ 
          accountType: normalizedAccountType,
          fullName: name,
          updatedAt: new Date(),
        })
        .where(eq(appUsers.phoneNumber, phone))

      // Verify update
      const updatedUser = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, phone),
      })

      console.log('[v0] Account updated - Verification:', updatedUser?.accountType)

      return NextResponse.json({
        success: true,
        message: 'Account updated',
        user: { phone, name, accountType: updatedUser?.accountType }
      })
    } else {
      // Create new account with normalized account type
      console.log('[v0] Creating new account with type:', normalizedAccountType)
      
      const newUser = {
        id: `user_${phone}_${Date.now()}`,
        phoneNumber: phone,
        fullName: name,
        pin: '123456',
        balance: BigInt(0),
        accountType: normalizedAccountType,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.insert(appUsers).values(newUser)
      console.log('[v0] New user account created:', { phone, accountType: normalizedAccountType })

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: { phone, name, accountType: normalizedAccountType, balance: 0 }
      })
    }
  } catch (error) {
    console.error('[v0] Error adding account:', error)
    return NextResponse.json(
      { error: 'Failed to add account', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
