import { db } from '@/lib/db'
import { appUsers } from '@/lib/db/schema'
import { isAdminPhone } from '@/lib/account-manager'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { adminPhone, userPhone, newAccountType } = await request.json()

    // Verify admin
    if (!adminPhone || !isAdminPhone(adminPhone)) {
      return Response.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      )
    }

    if (!userPhone || !newAccountType) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update user account type in Neon
    await db
      .update(appUsers)
      .set({ accountType: newAccountType })
      .where(eq(appUsers.phoneNumber, userPhone))
      .execute()

    return Response.json({
      success: true,
      message: 'Account type updated successfully',
    })
  } catch (error) {
    console.error('[v0] Error updating account type:', error)
    return Response.json(
      { success: false, error: 'Failed to update account type' },
      { status: 500 }
    )
  }
}
