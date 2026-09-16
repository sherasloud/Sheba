import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { isAdminPhone } from '@/lib/account-manager'

export async function POST(request: Request) {
  try {
    const { adminPhone } = await request.json()

    // Verify admin
    if (!adminPhone || !isAdminPhone(adminPhone)) {
      return Response.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    // Get all users from Neon database - sorted by creation date (newest first)
    const users = await db.select().from(appUsers)

    console.log('[v0] Admin fetched all users from Neon:', users.length, 'users')

    // Sort by newest first
    const sortedUsers = users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return Response.json({
      success: true,
      users: sortedUsers.map(user => {
        const balance = typeof user.balance === 'bigint' 
          ? Number(user.balance) 
          : Number(user.balance || 0)
        
        return {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName || 'Unknown User',
          balance: balance,
          accountType: user.accountType || 'personal',
          isVerified: user.emailVerified || false,
          createdAt: user.createdAt,
        }
      }),
      count: sortedUsers.length,
    })
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
