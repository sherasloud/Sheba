import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone, name, pin, accountType = 'personal' } = await request.json()

    if (!phone || !name || !pin) {
      return NextResponse.json(
        { error: 'Phone, name, and PIN required' },
        { status: 400 }
      )
    }

    // Check if user already exists in Neon
    const existingUser = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, phone),
    })

    if (existingUser) {
      console.log('[v0] User already exists:', phone, 'Current type:', existingUser.accountType, 'New type:', accountType)
      
      // যদি account type ভিন্ন হয়, তাহলে update করো (convert করো)
      if (existingUser.accountType !== accountType) {
        console.log('[v0] Converting account type from', existingUser.accountType, 'to', accountType)
        
        // Update account type
        await db.update(appUsers)
          .set({ 
            accountType: accountType,
            fullName: name, // Update name also
            updatedAt: new Date(),
          })
          .where(eq(appUsers.phoneNumber, phone))
        
        const updatedUser = await db.query.appUsers.findFirst({
          where: eq(appUsers.phoneNumber, phone),
        })
        
        console.log('[v0] Account converted successfully:', phone, 'New type:', accountType)
        
        const conversionResponse = {
          success: true,
          message: `Account type converted from ${existingUser.accountType} to ${accountType}`,
          user: {
            phoneNumber: updatedUser?.phoneNumber,
            fullName: updatedUser?.fullName,
            balance: Number(updatedUser?.balance || 0),
            accountType: updatedUser?.accountType,
            account_type: updatedUser?.accountType, // Include snake_case
          }
        }
        
        console.log('[v0] Conversion response:', conversionResponse)
        
        return NextResponse.json(conversionResponse, { status: 200 })
      } else {
        // Same account type - already exists
        console.log('[v0] User already exists with same account type:', phone)
        return NextResponse.json(
          { 
            success: false,
            error: 'Account already exists with this type',
            user: {
              phoneNumber: existingUser.phoneNumber,
              fullName: existingUser.fullName,
              balance: Number(existingUser.balance),
              accountType: existingUser.accountType,
            }
          },
          { status: 400 }
        )
      }
    }

    // Create new account in Neon with 0 balance
    const userId = `user_${phone}_${Date.now()}`
    const newUser = {
      id: userId,
      phoneNumber: phone,
      fullName: name,
      pin,
      balance: 0n, // নতুন users এর balance 0
      accountType: accountType, // ব্যবহার করা accountType
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log('[v0] Inserting user into database:', newUser)
    
    try {
      const insertResult = await db.insert(appUsers).values(newUser)
      console.log('[v0] Insert result:', insertResult)
      console.log('[v0] New account created in Neon:', userId, 'Phone:', phone)
    } catch (dbError) {
      console.error('[v0] Database insert error:', dbError)
      throw dbError
    }

    // Verify user was inserted
    const verifyUser = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, phone),
    })
    
    if (!verifyUser) {
      console.error('[v0] User not found after insert - verification failed')
      throw new Error('User insertion verification failed')
    }
    
    console.log('[v0] User verified in database:', verifyUser.phoneNumber)

    const responseData = {
      success: true,
      message: 'Account created successfully',
      user: {
        phoneNumber: newUser.phoneNumber,
        fullName: newUser.fullName,
        balance: 0,
        accountType: newUser.accountType,
        account_type: newUser.accountType, // Also include snake_case for consistency
      }
    }
    
    console.log('[v0] Sending response:', responseData)
    
    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating account:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create account'
    console.error('[v0] Error message:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
