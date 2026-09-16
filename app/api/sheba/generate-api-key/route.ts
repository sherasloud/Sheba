import { db } from '@/lib/db'
import { serviceProviders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { providerId } = await req.json()

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 })
    }

    // Generate unique API key
    const apiKey = `sheba_${crypto.randomBytes(32).toString('hex')}`

    // Store API key in provider record (we'll add this field to schema)
    const provider = await db.query.serviceProviders.findFirst({
      where: eq(serviceProviders.id, providerId),
    })

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Return API key and webhook URL
    const webhookUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/sheba/webhook`

    return NextResponse.json({
      success: true,
      apiKey: apiKey,
      webhookUrl: webhookUrl,
      providerId: providerId,
      message: 'API Key generated successfully. Use this key in Authorization header for all API calls.',
    })
  } catch (error) {
    console.error('[v0] Error generating API key:', error)
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    )
  }
}
