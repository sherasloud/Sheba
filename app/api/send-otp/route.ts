import { type NextRequest, NextResponse } from "next/server"
import { generateAndStoreOTP } from "@/lib/otp-store"
import { sendOTP as sendSMSOTP } from "@/lib/services/sms"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate BD phone number (01XXXXXXXXX)
    if (!phone || !/^01\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, message: "Invalid phone number" }, { status: 400 })
    }

    // Generate + store OTP in Redis (also enforces rate limits)
    const generated = await generateAndStoreOTP(phone)
    if (!generated.ok) {
      return NextResponse.json({ success: false, message: generated.message }, { status: 429 })
    }

    // Deliver the OTP over AutomAS SMS.
    const sent = await sendSMSOTP(phone, generated.otp)

    if (!sent.success) {
      console.error("[v0] AutomAS SMS delivery failed:", sent.message)
      return NextResponse.json(
        { success: false, message: "OTP delivery failed. Please try again." },
        { status: 502 },
      )
    }

    console.log("[v0] OTP sent via AutomAS SMS to:", phone)

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      data: { phone, expiresIn: 300 },
    })
  } catch (error: any) {
    console.error("[v0] Error in send-otp:", error?.message)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
