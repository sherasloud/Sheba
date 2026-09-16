import { NextRequest, NextResponse } from "next/server"

// In-memory store for dial sessions (in production, use database)
const dialSessions: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, phoneNumber, dialedNumber } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID required" },
        { status: 400 }
      )
    }

    console.log("[v0] Checking dial match - Session:", sessionId, "Phone:", phoneNumber)

    // Get the session data
    const session = dialSessions[sessionId]

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 404 }
      )
    }

    // Check if dialed number or entered phone matches the initiated number
    const checkNumber = dialedNumber || phoneNumber
    const isMatched = session.phoneNumber === checkNumber

    if (isMatched) {
      console.log("[v0] Dial verification successful!")
      // Clear session after successful match
      delete dialSessions[sessionId]
      
      return NextResponse.json({
        success: true,
        message: "Phone verified successfully",
        data: {
          dialMatched: true,
          verified: true,
          phoneNumber: session.phoneNumber
        }
      })
    } else {
      console.log("[v0] Dial number mismatch - Expected:", session.phoneNumber, "Got:", checkNumber)
      return NextResponse.json({
        success: true,
        message: "Waiting for correct dial...",
        data: {
          verified: false,
          expected: session.phoneNumber,
          received: dialedNumber
        }
      })
    }
  } catch (error) {
    console.error("[v0] Error checking dial match:", error)
    return NextResponse.json(
      { success: false, message: "Failed to check dial" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId")
    const dialedNumber = request.nextUrl.searchParams.get("dialedNumber")

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID required" },
        { status: 400 }
      )
    }

    const session = dialSessions[sessionId]

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 404 }
      )
    }

    // Simulate dial detection if dialedNumber is provided
    if (dialedNumber) {
      const isMatched = session.phoneNumber === dialedNumber
      
      if (isMatched) {
        delete dialSessions[sessionId]
      }

      return NextResponse.json({
        success: true,
        data: {
          verified: isMatched,
          phoneNumber: session.phoneNumber,
          dialedNumber
        }
      })
    }

    // Return session status
    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        status: session.status,
        phoneNumber: session.phoneNumber,
        initiatedAt: session.initiatedAt
      }
    })
  } catch (error) {
    console.error("[v0] Error getting dial status:", error)
    return NextResponse.json(
      { success: false, message: "Failed to get dial status" },
      { status: 500 }
    )
  }
}

// Helper function to store dial session (called from initiate-phone-dial)
export function storeDialSession(sessionId: string, phoneNumber: string) {
  dialSessions[sessionId] = {
    phoneNumber,
    status: "waiting",
    initiatedAt: new Date().toISOString()
  }
}
