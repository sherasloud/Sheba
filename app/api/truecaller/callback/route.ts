import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Webhook handler for Truecaller callbacks
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-Signature')
    const body = await request.text()

    if (!signature || !body) {
      console.error('[v0] Invalid Truecaller webhook: missing signature or body')
      return NextResponse.json(
        { success: false, message: 'Invalid webhook' },
        { status: 400 }
      )
    }

    // Verify signature
    const secretKey = process.env.TRUECALLER_SECRET_KEY || ''
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('[v0] Invalid Truecaller webhook signature')
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)
    console.log('[v0] Truecaller webhook received:', {
      requestId: data.requestId,
      status: data.status,
      phone: data.phoneNumber ? data.phoneNumber.slice(0, 5) + '***' : 'unknown',
    })

    // Log webhook event for debugging
    if (data.status === 'SUCCESS') {
      console.log('[v0] Truecaller webhook: OTP verified successfully for request:', data.requestId)
    } else if (data.status === 'FAILED') {
      console.log('[v0] Truecaller webhook: OTP verification failed for request:', data.requestId)
    } else if (data.status === 'EXPIRED') {
      console.log('[v0] Truecaller webhook: OTP expired for request:', data.requestId)
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
    })
  } catch (error: any) {
    console.error('[v0] Truecaller webhook error:', error.message)
    return NextResponse.json(
      { success: false, message: 'Webhook processing error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Truecaller webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  })
}
