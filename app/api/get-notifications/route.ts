import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone required' }, { status: 400 })
    }

    const trimmedPhone = phone.trim()

    // Get all notifications for this phone
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.phonenumber, trimmedPhone),
    })

    // Sort by date descending (newest first)
    const sorted = userNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      notifications: sorted.map((notif) => ({
        id: notif.id,
        message: notif.message,
        type: notif.type,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
      })),
      count: sorted.length,
    })
  } catch (error) {
    console.error('[v0] Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
