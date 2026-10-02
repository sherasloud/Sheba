import { db } from '@/lib/db'
import { serviceProviders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    const provider = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.phone, phone.trim()),
    })

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      provider: provider,
    })
  } catch (error: any) {
    const message = String(error?.message || error)
    console.error('[v0] Error getting provider:', message)

    // Older databases may not have the optional serviceProviders table yet.
    // Treat that as “not a provider” instead of crashing the authenticated app.
    if (message.includes('relation') && message.includes('serviceProviders')) {
      return NextResponse.json({ success: false, provider: null, error: 'Provider profile is not configured' }, { status: 404 })
    }

    return NextResponse.json({ success: false, provider: null, error: 'Failed to get provider' }, { status: 500 })
  }
}
