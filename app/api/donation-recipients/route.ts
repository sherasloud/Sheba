import { NextResponse } from 'next/server'

// Store in memory for now - in production, use database
let donationRecipientsStore: any[] = []

export async function GET() {
  try {
    return NextResponse.json({ recipients: donationRecipientsStore, success: true })
  } catch (error) {
    console.error('[v0] Error fetching donation recipients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donation recipients', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.name || !data.number) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    donationRecipientsStore.push({
      ...data,
      id: Date.now(),
    })

    return NextResponse.json({ success: true, recipient: data })
  } catch (error) {
    console.error('[v0] Error adding donation recipient:', error)
    return NextResponse.json(
      { error: 'Failed to add donation recipient', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json()
    const { index } = data

    if (typeof index !== 'number' || index < 0 || index >= donationRecipientsStore.length) {
      return NextResponse.json(
        { error: 'Invalid index', success: false },
        { status: 400 }
      )
    }

    donationRecipientsStore.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting donation recipient:', error)
    return NextResponse.json(
      { error: 'Failed to delete donation recipient', success: false },
      { status: 500 }
    )
  }
}
