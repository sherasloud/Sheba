import { NextRequest, NextResponse } from "next/server"

// Store MSISDN responses from telecom (in real scenario, this comes from telecom callback)
const msisdnResponses: Record<string, string> = {}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, msisdn, enteredPhoneNumber } = await request.json()

    if (!sessionId || !enteredPhoneNumber) {
      return NextResponse.json(
        { success: false, message: "Session ID and entered phone required" },
        { status: 400 }
      )
    }

    console.log("[v0] Checking USSD response - Session:", sessionId, "MSISDN:", msisdn, "Entered:", enteredPhoneNumber)

    // In production, msisdn comes from telecom callback after user dials *2#
    // For now, check if there's a stored MSISDN for this session
    const storedMsisdn = msisdnResponses[sessionId]

    if (storedMsisdn) {
      console.log("[v0] Found MSISDN from telecom response:", storedMsisdn)
      
      // Remove leading 0 and +88 for comparison
      const cleanStoredMsisdn = storedMsisdn.replace(/^(\+88|0)/, "88")
      const cleanEnteredNumber = enteredPhoneNumber.replace(/^(\+88|0)/, "88")

      const isMatched = cleanStoredMsisdn === cleanEnteredNumber

      console.log("[v0] MSISDN comparison:", {
        stored: cleanStoredMsisdn,
        entered: cleanEnteredNumber,
        matched: isMatched
      })

      if (isMatched) {
        console.log("[v0] USSD verification successful - MSISDN matched!")
        delete msisdnResponses[sessionId]
        return NextResponse.json({
          success: true,
          message: "Phone number verified",
          data: {
            verified: true,
            msisdn: storedMsisdn,
            phoneNumber: enteredPhoneNumber
          }
        })
      } else {
        console.log("[v0] MSISDN mismatch - verification failed")
        return NextResponse.json({
          success: true,
          message: "Phone number does not match",
          data: {
            verified: false,
            reason: "MSISDN does not match entered number"
          }
        })
      }
    }

    // No MSISDN response yet - still waiting for user to dial *2#
    console.log("[v0] Waiting for MSISDN response from user dial")
    return NextResponse.json({
      success: true,
      message: "Waiting for dial response",
      data: {
        verified: false,
        waiting: true
      }
    })
  } catch (error) {
    console.error("[v0] Error checking USSD response:", error)
    return NextResponse.json(
      { success: false, message: "Failed to check USSD response" },
      { status: 500 }
    )
  }
}

// Endpoint to simulate telecom callback (when user dials *2#, they get MSISDN)
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, msisdn } = await request.json()

    if (!sessionId || !msisdn) {
      return NextResponse.json(
        { success: false, message: "Session ID and MSISDN required" },
        { status: 400 }
      )
    }

    console.log("[v0] Telecom callback received - Session:", sessionId, "MSISDN:", msisdn)
    msisdnResponses[sessionId] = msisdn

    return NextResponse.json({
      success: true,
      message: "MSISDN response stored"
    })
  } catch (error) {
    console.error("[v0] Error storing MSISDN response:", error)
    return NextResponse.json(
      { success: false, message: "Failed to store response" },
      { status: 500 }
    )
  }
}

// Export for testing
export const storedMsisdnResponses = msisdnResponses
