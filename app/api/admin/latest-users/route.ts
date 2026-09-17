import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get latest 10 users ordered by creation date descending
    const users = await db.query.appUsers.findMany({
      orderBy: [desc(appUsers.createdAt)],
      limit: 10,
      columns: {
        id: true,
        phoneNumber: true,
        fullName: true,
        accountType: true,
        createdAt: true,
        balance: true,
      },
    })

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        phoneNumber: u.phoneNumber,
        fullName: u.fullName,
        accountType: u.accountType,
        createdAt: u.createdAt,
        balance: u.balance,
      })),
    })
  } catch (error) {
    console.error('[v0] Error fetching latest users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
