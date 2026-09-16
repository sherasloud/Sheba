import { type NextRequest, NextResponse } from "next/server"
import { shebaSMS } from "@/lib/api/sheba-sms-service"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, type, amount, balance } = await request.json()

    const result = await shebaSMS.sendTransactionSMS(phoneNumber, type, amount, balance)

    return NextResponse.json({
      success: true,
      message: "Sheba SMS sent successfully",
      result,
    })
  } catch (error) {
    console.error("[v0] SMS API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send SMS",
      },
      { status: 500 },
    )
  }
}
