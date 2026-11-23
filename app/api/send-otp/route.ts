import { type NextRequest, NextResponse } from "next/server"
import { discardStoredOTP, generateAndStoreOTP } from "@/lib/otp-store"
import { sendOTP } from "@/lib/services/sms"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = typeof body?.phone === "string" ? body.phone.trim() : ""

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json({ success: false, message: "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।" }, { status: 400 })
    }

    // Generate + store OTP in Redis (also enforces rate limits)
    const generated = await generateAndStoreOTP(phone)
    if (!generated.ok) {
      return NextResponse.json({ success: false, message: generated.message }, { status: 429 })
    }

    const sent = await sendOTP(phone, generated.otp)
    if (!sent.success) {
      console.warn("[v0] OTP SMS was not accepted by the provider:", sent.message)
      await discardStoredOTP(phone)
      return NextResponse.json(
        { success: false, message: "SMS পাঠানো যায়নি। নম্বরটি যাচাই করে একটু পরে আবার চেষ্টা করুন।" },
        { status: 502 },
      )
    }

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
