import { NextResponse } from "next/server"
import { sendRealEmailJSOTP } from "@/lib/emailjs-setup"
import { sendRealResendOTP } from "@/lib/resend-setup"
// import { sendRealGmailOTP } from "@/lib/nodemailer-setup" // Server-side only

const otpStorage = new Map()

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request) {
  try {
    const { email, passengerName } = await request.json()

    if (!email || !passengerName) {
      return NextResponse.json({
        success: false,
        message: "Email and name required",
      })
    }

    // Generate OTP
    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000

    // Store OTP
    otpStorage.set(email, { otp, expires, attempts: 0 })

    console.log(`🔐 Sending real OTP to ${email}: ${otp}`)

    // Try EmailJS first
    let result = await sendRealEmailJSOTP(email, otp, passengerName)
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ Real OTP sent to ${email} via ${result.service}`,
        service: result.service,
      })
    }

    // Try Resend as backup
    result = await sendRealResendOTP(email, otp, passengerName)
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ Real OTP sent to ${email} via ${result.service}`,
        service: result.service,
      })
    }

    // All failed
    return NextResponse.json({
      success: false,
      message: "All email services failed. Please check your configuration.",
    })
  } catch (error) {
    console.error("Real OTP API error:", error)
    return NextResponse.json({
      success: false,
      message: "Server error",
    })
  }
}

export { otpStorage }
