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
        ? "AutoMas error 105: নম্বরটিকে বৈধ MSISDN হিসেবে গ্রহণ করেনি। নম্বরটি সক্রিয় এবং +880-এর পরের ১০ অঙ্ক ঠিক আছে কি না যাচাই করুন।"
        : providerCode === "106"
          ? "AutoMas error 106: API key সঠিক বা সক্রিয় নয়। AutoMas account-এর API key যাচাই করুন।"
          : providerCode === "INVALID_MSISDN"
            ? "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।"
            : providerCode === "NOT_CONFIGURED"
              ? "AutoMas API key বা Sender ID configuration পাওয়া যায়নি।"
              : providerCode === "TIMEOUT" || providerCode === "NETWORK_ERROR"
                ? `AutoMas-এর সাথে সংযোগ হয়নি (${providerCode})। কিছুক্ষণ পর আবার চেষ্টা করুন।`
                : `AutoMas (${providerCode}) SMS গ্রহণ করেনি। Sheba masking Sender ID অনুমোদিত ও সক্রিয় কি না যাচাই করুন।`

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
