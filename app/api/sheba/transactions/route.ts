import { db } from '@/lib/db'
import { servicePayments } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { providerId } = await req.json()

    const transactions = await db.query.servicePayments.findMany({
      where: eq(servicePayments.providerId, providerId),
      orderBy: desc(servicePayments.createdAt),
      limit: 50,
    })

    return NextResponse.json({
      success: true,
      transactions: transactions,
    })
  } catch (error) {
    console.error('[v0] Error getting transactions:', error)
    return NextResponse.json(
      { error: 'Failed to get transactions' },
      { status: 500 }
    )
  }
}
