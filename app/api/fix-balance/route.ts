import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const phone = '01930314459'
    const amountToAdd = -709 // Deduct 709

    console.log('[v0] FIX-BALANCE: Deducting ৳709 from', phone)

    // Find user
    let user = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, phone),
    })

    if (!user) {
      // Try alternative formats
      const alternatives = [
        phone.replace(/^0/, '88'),
        phone.replace(/^88/, '0'),
      ]
      
      for (const alt of alternatives) {
        user = await db.query.appUsers.findFirst({
          where: eq(appUsers.phoneNumber, alt),
        })
        if (user) break
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const balanceBefore = Number(user.balance || 0)
    const balanceAfter = balanceBefore + amountToAdd

    console.log('[v0] FIX-BALANCE: Updating', user.fullName, 'from ৳', balanceBefore, 'to ৳', balanceAfter)

    // Update balance
    await db
      .update(appUsers)
      .set({
        balance: BigInt(balanceAfter),
        updatedAt: new Date(),
      })
      .where(eq(appUsers.phoneNumber, user.phoneNumber))

    // Verify
    const verify = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, user.phoneNumber),
    })

    const finalBalance = Number(verify?.balance || 0)

    console.log('[v0] FIX-BALANCE: Verified - Final balance:', finalBalance)

    return NextResponse.json({
      success: true,
      message: `✓ Balance updated for ${user.fullName}`,
      details: {
        phone: user.phoneNumber,
        name: user.fullName,
        amountAdded: amountToAdd,
        balanceBefore,
        balanceAfter: finalBalance,
      }
    })
  } catch (error) {
    console.error('[v0] FIX-BALANCE: Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fix balance',
        details: error
      },
      { status: 500 }
    )
  }
}
