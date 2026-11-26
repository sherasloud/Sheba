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
      const providerCode = sent.errorCode?.replace(/[^A-Z0-9_,-]/gi, "").slice(0, 32) || "UNKNOWN"
      console.warn("[v0] OTP SMS was not accepted by the provider:", {
        code: providerCode,
        message: sent.message,
      })
      await discardStoredOTP(phone)

      const message = providerCode === "105"
        ? "AutoMas নম্বরটি গ্রহণ করেনি। 01XXXXXXXXX format-এ সক্রিয় বাংলাদেশি নম্বর দিন।"
        : providerCode === "103"
          ? "AutoMas API key প্রত্যাখ্যান করেছে। AutoMas dashboard-এর API key যাচাই করুন।"
          : providerCode === "1000"
            ? "AutoMas account-এ পর্যাপ্ত SMS balance নেই।"
            : providerCode === "INVALID_MSISDN"
              ? "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।"
              : providerCode === "NOT_CONFIGURED"
                ? "AutoMas API key বা অনুমোদিত Sender ID নেই। Project Vars-এ AUTOMAS_API_KEY ও AUTOMAS_SENDER_ID যোগ করুন।"
                : providerCode === "TIMEOUT" || providerCode === "NETWORK_ERROR"
                  ? `AutoMas-এর সাথে সংযোগ হয়নি (${providerCode})। কিছুক্ষণ পর আবার চেষ্টা করুন।`
                  : providerCode.startsWith("HTTP_")
                    ? `AutoMas server ${providerCode} error দিয়েছে। API key, request, এবং AutoMas account status যাচাই করুন।`
                    : `AutoMas SMS গ্রহণ করেনি (${providerCode})। AutoMas dashboard-এ Sender ID ও error status যাচাই করুন।`

      return NextResponse.json({ success: false, providerCode, message }, { status: 502 })
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
