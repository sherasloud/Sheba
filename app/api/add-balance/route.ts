import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone, amount } = await request.json()

    if (!phone || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Phone and positive amount required' },
        { status: 400 }
      )
    }

    console.log('[v0] ADD-BALANCE: Adding', amount, 'টাকা to', phone)

    // Try multiple phone formats
    const phonesToTry = [
      phone,
      phone.replace(/^0/, '88'),
      phone.replace(/^88/, '0'),
    ]

    let user = null
    for (const phoneToTry of phonesToTry) {
      if (!phoneToTry || phoneToTry.length < 10) continue
      
      console.log('[v0] ADD-BALANCE: Trying format:', phoneToTry)
      user = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, phoneToTry),
      })
      
      if (user) {
        console.log('[v0] ADD-BALANCE: Found user with format:', phoneToTry)
        break
      }
    }

    if (!user) {
      console.log('[v0] ADD-BALANCE: User not found')
      return NextResponse.json(
        { success: false, error: 'User not found', phone },
        { status: 404 }
      )
    }

    const balanceBefore = Number(user.balance || 0)
    const balanceAfter = balanceBefore + amount

    console.log('[v0] ADD-BALANCE: Current balance:', balanceBefore, '-> New balance:', balanceAfter)

    // Update balance
    await db
      .update(appUsers)
      .set({
        balance: BigInt(balanceAfter),
        updatedAt: new Date(),
      })
      .where(eq(appUsers.phoneNumber, user.phoneNumber))

    // Verify update
    const verifyUser = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, user.phoneNumber),
    })

    const newBalance = Number(verifyUser?.balance || 0)
    console.log('[v0] ADD-BALANCE: Verified - New balance in DB:', newBalance)

    return NextResponse.json({
      success: true,
      message: `Added ৳${amount} to ${user.fullName}`,
      user: {
        phone: user.phoneNumber,
        name: user.fullName,
        balanceBefore,
        balanceAfter: newBalance,
      }
    })
  } catch (error) {
    console.error('[v0] ADD-BALANCE: Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add balance' },
      { status: 500 }
    )
  }
}
