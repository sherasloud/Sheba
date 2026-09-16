import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log("[v0] SSLCommerz Failed Payment:", body)

    const { tran_id, status, error_code, value_c } = body
    const phoneNumber = value_c

    console.error("[v0] Payment failed:", {
      transactionId: tran_id,
      status: status,
      errorCode: error_code,
      phone: phoneNumber,
    })

    return NextResponse.json({
      success: false,
      message: "Payment failed or cancelled",
      transactionId: tran_id,
      status: status,
      errorCode: error_code,
    })
  } catch (error) {
    console.error("[v0] SSLCommerz Fail Callback Error:", error)
    return NextResponse.json(
      { success: false, message: "Payment processing error" },
      { status: 500 }
    )
  }
}
