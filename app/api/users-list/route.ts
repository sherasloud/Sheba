import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'

export async function GET() {
  try {
    console.log('[v0] API: /users-list - Fetching all users from database')
    
    // Fetch all users from Neon database
    const users = await db.query.appUsers.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    })

    console.log('[v0] API: Total users fetched:', users.length)
    if (users.length > 0) {
      console.log('[v0] API: Users:', users.map(u => ({ 
        phone: u.phoneNumber, 
        name: u.fullName,
        balance: u.balance,
        created: u.createdAt 
      })))
    } else {
      console.warn('[v0] API: WARNING - No users found in database!')
    }

    // Transform to match Account interface
    const accounts = users.map(user => {
      const balanceNum = Number(user.balance || 0)
      if (user.phoneNumber === '01930314459' || user.accountType === 'state') {
        console.log('[v0] API: State account balance:', {
          phone: user.phoneNumber,
          balance: user.balance,
          balanceNum: balanceNum,
          accountType: user.accountType,
        })
      }
      return {
        id: user.id,
        phone: user.phoneNumber,
        name: user.fullName || 'Unknown',
        balance: balanceNum,
        account_type: user.accountType || 'personal',
        created_at: user.createdAt?.toISOString() || new Date().toISOString(),
      }
    })

    console.log('[v0] API: Returning transformed accounts:', accounts.length)

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('[v0] API: Error fetching users:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[v0] API: Error details:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: errorMsg },
      { status: 500 }
    )
  }
}
