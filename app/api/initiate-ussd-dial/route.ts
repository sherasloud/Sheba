import { NextRequest, NextResponse } from "next/server"

// Store USSD sessions with entered phone number
const ussdSessions: Record<string, { phoneNumber: string; ussdCode: string; createdAt: number }> = {}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number required" },
        { status: 400 }
      )
    }

    console.log("[v0] Initiating USSD dial for:", phoneNumber)

    // Create session for this phone number
    const sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    const ussdCode = "*2#" // USSD code to retrieve MSISDN

    ussdSessions[sessionId] = {
      phoneNumber: phoneNumber,
      ussdCode: ussdCode,
      createdAt: Date.now()
    }

    console.log("[v0] USSD session created:", sessionId, "Code:", ussdCode)

    return NextResponse.json({
      success: true,
      message: "USSD dial initiated",
      data: {
        sessionId: sessionId,
        ussdCode: ussdCode, // The code to dial: *2#
        phoneNumber: phoneNumber,
        instruction: `Dial ${ussdCode} to verify your number`
      }
    })
  } catch (error) {
    console.error("[v0] Error initiating USSD:", error)
    return NextResponse.json(
      { success: false, message: "Failed to initiate USSD dial" },
      { status: 500 }
    )
  }
}

// Export for polling from enter-phone page
export const ussdDialSessions = ussdSessions
