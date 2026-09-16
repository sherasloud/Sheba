import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "ফোন নম্বর প্রয়োজন" },
        { status: 400 }
      )
    }

    // Request OTP from SSLCommerz
    const otpResponse = await fetch("https://pay.sslcommerz.com/api/otp/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SSLCOMMERZ_API_KEY || ""}`,
      },
      body: JSON.stringify({
        phoneNumber,
        purpose: "login",
        timestamp: new Date().toISOString(),
      }),
    })

    const otpResult = await otpResponse.json()

    if (!otpResponse.ok) {
      return NextResponse.json(
        { success: false, message: otpResult.message || "OTP পাঠানোর ত্রুটি" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP সফলভাবে পাঠানো হয়েছে",
      phoneNumber,
      expiresIn: 120, // 2 minutes
    })
  } catch (error) {
    console.error("[v0] OTP request error:", error)
    return NextResponse.json(
      { success: false, message: "সার্ভার ত্রুটি: " + (error instanceof Error ? error.message : "অজানা") },
      { status: 500 }
    )
  }
}
