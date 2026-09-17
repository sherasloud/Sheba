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
  } catch (error) {
    console.error('[v0] Error getting provider:', error)
    return NextResponse.json(
      { error: 'Failed to get provider' },
      { status: 500 }
    )
  }
}
