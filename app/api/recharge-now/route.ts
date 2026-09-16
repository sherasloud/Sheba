import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, amount, operator, pin } = body

    console.log("[v0] API: Recharge request received:", { phone, amount, operator })

    // Validate inputs
    if (!phone || !amount || !operator || !pin) {
      console.log("[v0] API: Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // API configuration
    const apiUrl = process.env.NEXT_PUBLIC_RECHARGE_API_URL || "https://irechargebd.com/api"
    const apiKey = process.env.RECHARGE_API_KEY || "15CYXKXZCIJC6QAL5UOOB39J2FM380EV53BUQNSEJ18US6OKFZ10"

    console.log("[v0] API: Calling irechargebd.com...")

    // Call irechargebd.com API
    const response = await fetch(`${apiUrl}/recharge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone,
        amount: Number.parseInt(amount),
        operator,
        type: "Prepaid",
      }),
    })

    const data = await response.json()
    console.log("[v0] API: irechargebd.com response:", data)

    if (response.ok && data.success) {
      console.log("[v0] API: Recharge successful!")
      return NextResponse.json({
        success: true,
        transactionId: data.transactionId || "TXN" + Date.now(),
        message: "Recharge successful",
      })
    } else {
      console.log("[v0] API: Recharge failed:", data.error)
      return NextResponse.json({ success: false, error: data.error || "Recharge failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] API: Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
