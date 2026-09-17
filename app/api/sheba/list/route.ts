import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serviceProviders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    // Get all verified service providers
    const providers = await db.query.serviceProviders.findMany({
      where: eq(serviceProviders.isVerified, true),
    })

    return NextResponse.json(
      {
        providers: providers.map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
          type: p.type,
          specialization: p.specialization,
          address: p.address,
          isVerified: p.isVerified,
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Failed to fetch providers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
