import { NextResponse } from 'next/server'

// Get institutions from cookie storage
function getInstitutionsFromCookie(request: Request): any[] {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const institutionsCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('sheba_institutions='))
    
    if (institutionsCookie) {
      const value = institutionsCookie.split('=')[1]
      return JSON.parse(decodeURIComponent(value))
    }
  } catch (error) {
    console.error('[v0] Error parsing institutions cookie:', error)
  }
  return []
}

export async function GET(request: Request) {
  try {
    // Return hardcoded default institutions (client will add more via POST)
    const defaultInstitutions = [
      { id: 1, name: 'Dhaka University', type: 'universities', logo: '/placeholder.svg' },
      { id: 2, name: 'BUET', type: 'universities', logo: '/placeholder.svg' },
      { id: 3, name: 'Notre Dame College', type: 'colleges', logo: '/placeholder.svg' },
    ]
    
    return NextResponse.json({ 
      institutions: defaultInstitutions, 
      success: true 
    })
  } catch (error) {
    console.error('[v0] Error fetching education institutions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institutions', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    const newInstitution = {
      ...data,
      id: Date.now(),
    }

    // Return the new institution
    // Note: In production, save to database. For now, client-side storage is used.
    return NextResponse.json({ success: true, institution: newInstitution })
  } catch (error) {
    console.error('[v0] Error adding institution:', error)
    return NextResponse.json(
      { error: 'Failed to add institution', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json()
    const { index } = data

    if (typeof index !== 'number' || index < 0) {
      return NextResponse.json(
        { error: 'Invalid index', success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting institution:', error)
    return NextResponse.json(
      { error: 'Failed to delete institution', success: false },
      { status: 500 }
    )
  }
}
