import { type NextRequest, NextResponse } from "next/server"
import { processRecharge } from "@/lib/api/recharge-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, operator, amount, accountType, pin } = body

    console.log("[v0] Direct recharge API called:", { phoneNumber, operator, amount, accountType })

    // Validate inputs
    if (!phoneNumber || !operator || !amount || !pin) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Calling processRecharge function...")

    const result = await processRecharge({
      operator,
      phoneNumber,
      amount,
      type: accountType || "prepaid",
    })

    console.log("[v0] processRecharge result:", {
      success: result.success,
      status: result.status,
      hasTransactionId: !!result.transactionId,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Direct recharge error:", error.message)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}
