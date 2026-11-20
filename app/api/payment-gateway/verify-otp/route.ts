import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/user"
import { verifyStoredOTP } from "@/lib/otp-store"

const phonePattern = /^01[3-9]\d{8}$/
const invalidCodeMessage = "The code is invalid or expired. Request a new one and try again."

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = typeof body?.phone === "string" ? body.phone.trim() : ""
    const otp = typeof body?.otp === "string" ? body.otp.trim() : ""

    if (!phonePattern.test(phone) || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ success: false, message: invalidCodeMessage }, { status: 400 })
    }

    const user = await UserModel.findByPhone(phone)
    if (!user) {
      return NextResponse.json({ success: false, message: invalidCodeMessage }, { status: 401 })
    }

    const result = await verifyStoredOTP(phone, otp, "payment-gateway")
    if (!result.success) {
      return NextResponse.json({ success: false, message: invalidCodeMessage }, { status: 401 })
    }

    return NextResponse.json({ success: true, message: "Phone number verified." })
  } catch (error: unknown) {
    console.error("[v0] Gateway OTP verification failed:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json(
      { success: false, message: "OTP service is temporarily unavailable. Please try again later." },
      { status: 503 },
    )
  }
}
