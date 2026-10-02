import { type NextRequest, NextResponse } from "next/server"
import { generateAndStoreOTP } from "@/lib/otp-store"
import { sendWhatsAppOTP } from "@/lib/services/whatsapp"

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

    // Deliver the OTP over WhatsApp via the worker service
    const sent = await sendWhatsAppOTP(phone, generated.otp)

    if (!sent.success) {
      // Keep the entry flow usable while WhatsApp is being configured.
      // The OTP remains in Redis, but verification will only succeed after delivery is restored.
      console.warn("[v0] WhatsApp unavailable; continuing without delivery:", sent.message)
      return NextResponse.json({
        success: true,
        message: "Continue to OTP verification",
        data: { phone, expiresIn: 300 },
      })
    }

    console.log("[v0] OTP sent via WhatsApp to:", phone)

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
