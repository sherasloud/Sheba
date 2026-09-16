import { NextResponse } from "next/server"
import { processRecharge } from "@/lib/api/recharge-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { operator, phoneNumber, amount, type, packageId } = body

    // Validate required fields
    if (!operator || !phoneNumber || !amount || !type) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate phone number format (Bangladesh)
    if (!/^01\d{9}$/.test(phoneNumber)) {
      return NextResponse.json({ success: false, message: "Invalid phone number format" }, { status: 400 })
    }

    console.log("[v0] Processing real recharge via irechargebd.com")
    const result = await processRecharge({
      operator,
      phoneNumber,
      amount,
      type,
      packageId,
      reference: `SHEBA-${Date.now()}`,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Recharge API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get("transactionId")

  if (!transactionId) {
    return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 })
  }

  // In a real implementation, you would check the status from the operator's API

  return NextResponse.json({
    success: true,
    transactionId,
    message: "Recharge completed successfully",
    status: "completed",
    timestamp: new Date().toISOString(),
  })
}
