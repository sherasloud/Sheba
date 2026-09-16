import { NextResponse } from 'next/server'

// Store in memory for now - in production, use database
let billProvidersStore: any[] = []

export async function GET() {
  try {
    return NextResponse.json({ providers: billProvidersStore, success: true })
  } catch (error) {
    console.error('[v0] Error fetching bill providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bill providers', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.name || !data.category || !data.number) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    billProvidersStore.push({
      ...data,
      id: Date.now(),
    })

    return NextResponse.json({ success: true, provider: data })
  } catch (error) {
    console.error('[v0] Error adding bill provider:', error)
    return NextResponse.json(
      { error: 'Failed to add bill provider', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json()
    const { index } = data

    if (typeof index !== 'number' || index < 0 || index >= billProvidersStore.length) {
      return NextResponse.json(
        { error: 'Invalid index', success: false },
        { status: 400 }
      )
    }

    billProvidersStore.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting bill provider:', error)
    return NextResponse.json(
      { error: 'Failed to delete bill provider', success: false },
      { status: 500 }
    )
  }
}
