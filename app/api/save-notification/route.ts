import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    const { recipientPhone, senderName, amount, type, senderPhone } = await request.json()

    if (!recipientPhone) {
      return NextResponse.json({ success: false, message: 'Recipient phone required' }, { status: 400 })
    }

    const notificationMessage = (() => {
      switch (type) {
        case 'transfer':
          return `${senderName} আপনাকে ৳${amount} পাঠিয়েছে`
        case 'cashout':
          return `৳${amount} ক্যাশআউট সফল হয়েছে`
        case 'payment':
          return `${senderName} আপনার কাছ থেকে ৳${amount} পেমেন্ট নিয়েছে`
        default:
          return 'নতুন লেনদেন'
      }
    })()

    // Save notification for recipient
    await db.insert(notifications).values({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phonenumber: recipientPhone.trim(),
      message: notificationMessage,
      type: type,
      isRead: false,
    } as any)

    return NextResponse.json({ success: true, message: 'Notification saved' })
  } catch (error) {
    console.error('[v0] Error saving notification:', error)
    return NextResponse.json({ success: false, message: 'Failed to save notification' }, { status: 500 })
  }
}
