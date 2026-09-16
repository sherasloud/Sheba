import { db } from '@/lib/db'
import { institutions } from '@/lib/db/schema'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Database থেকে সব institutions fetch করছি
    const allInstitutions = await db.query.institutions.findMany()

    // Type wise group করছি
    const grouped = {
      schools: allInstitutions.filter(inst => inst.type === 'school'),
      colleges: allInstitutions.filter(inst => inst.type === 'college'),
      universities: allInstitutions.filter(inst => inst.type === 'university'),
    }

    console.log('[v0] Fetched institutions:', grouped)

    return NextResponse.json({
      success: true,
      institutions: grouped,
    })
  } catch (error) {
    console.error('[v0] Error fetching all institutions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institutions', success: false },
      { status: 500 }
    )
  }
}
