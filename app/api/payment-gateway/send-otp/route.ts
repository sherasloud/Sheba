import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/user"
import { consumeOTPRequestIpLimit, generateAndStoreOTP, invalidateStoredOTP } from "@/lib/otp-store"
import { sendOTP } from "@/lib/services/sms"

const genericSuccessMessage = "If this number is linked to a Sheba account, an OTP will arrive shortly."
const phonePattern = /^01[3-9]\d{8}$/

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = typeof body?.phone === "string" ? body.phone.trim() : ""

    if (!phonePattern.test(phone)) {
      return NextResponse.json({ success: false, message: "Enter a valid Bangladesh mobile number." }, { status: 400 })
    }

    const clientIp = getClientIp(request)
    if (clientIp && !(await consumeOTPRequestIpLimit(clientIp))) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please try again later." },
        { status: 429 },
      )
    }

    const user = await UserModel.findByPhone(phone)
    if (!user) {
      return NextResponse.json({ success: true, message: genericSuccessMessage, expiresIn: 300 })
    }

    const generated = await generateAndStoreOTP(phone, "payment-gateway")
    if (!generated.ok) {
      return NextResponse.json({ success: false, message: generated.message }, { status: 429 })
    }

    const sent = await sendOTP(phone, generated.otp, request.nextUrl.hostname)
    if (!sent.success) {
      console.warn("[v0] Gateway OTP SMS was not accepted by the provider:", sent.message)
      await invalidateStoredOTP(phone, "payment-gateway")
      return NextResponse.json(
        { success: false, message: "We couldn't send your code right now. Please try again later." },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true, message: genericSuccessMessage, expiresIn: 300 })
  } catch (error: unknown) {
    console.error("[v0] Gateway OTP request failed:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json(
      { success: false, message: "OTP service is temporarily unavailable. Please try again later." },
      { status: 503 },
    )
  }
}
