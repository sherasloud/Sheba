import { NextRequest, NextResponse } from "next/server"

// Verify reCAPTCHA token with Google
async function verifyRecaptchaToken(token: string): Promise<boolean> {
  try {
    const apiKey = process.env.GOOGLE_RECAPTCHA_API_KEY
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "sheba-1fc71"
    
    if (!apiKey) {
      console.warn("[v0] GOOGLE_RECAPTCHA_API_KEY not set")
      return process.env.NODE_ENV !== "production"
    }

    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`
    
    console.log("[v0] Verifying reCAPTCHA token with:", url.split("?")[0])
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          token: token,
          expectedAction: "OTP_VERIFICATION",
          siteKey: "6Ld2UCQtAAAAAGy2OVJ2zVi_U2jY7ULDRcxqVjVZ",
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] reCAPTCHA API error:", errorData)
      return false
    }

    const result = await response.json()
    console.log("[v0] reCAPTCHA score:", result.riskAnalysis?.score)
    
    // Check if score is above threshold (0.5 is good, 0.9 is excellent)
    const score = result.riskAnalysis?.score || 0
    const isValid = score > 0.5
    
    console.log("[v0] reCAPTCHA result: score=" + score + " valid=" + isValid)
    return isValid
  } catch (error) {
    console.error("[v0] reCAPTCHA verification error:", error)
    // In development, allow if reCAPTCHA fails
    return process.env.NODE_ENV !== "production"
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, recaptchaToken } = await request.json()

    // Validate inputs
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: "ফোন নম্বর এবং OTP প্রয়োজন" },
        { status: 400 }
      )
    }

    console.log('[v0] Verifying OTP for phone:', phoneNumber, 'OTP:', otp)

    // Verify reCAPTCHA token in production
    if (process.env.NODE_ENV === "production" && recaptchaToken) {
      const isValidCaptcha = await verifyRecaptchaToken(recaptchaToken)
      if (!isValidCaptcha) {
        console.warn("[v0] reCAPTCHA verification failed")
        return NextResponse.json(
          { success: false, message: "নিরাপত্তা যাচাইকরণ ব্যর্থ হয়েছে" },
          { status: 403 }
        )
      }
    }

    // For development/testing: Accept any 6-digit OTP
    // In production: This should verify with Firebase or your SMS service
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "ভুল OTP। সঠিক 6 সংখ্যার কোড লিখুন।" },
        { status: 401 }
      )
    }

    // Firebase test phone numbers and their test OTPs
    const firebaseTestNumbers: { [key: string]: string } = {
      "+8801709783145": "123456",
      "+8801314089308": "654321",
      "01709783145": "123456",
      "01314089308": "654321",
    }

    // Normalize phone number for comparison
    const normalizePhone = (phone: string) => {
      if (phone.startsWith("+")) return phone
      if (phone.startsWith("0")) return "+880" + phone.substring(1)
      if (phone.startsWith("880")) return "+" + phone
      return "+880" + phone
    }

    const normalizedPhone = normalizePhone(phoneNumber)
    const expectedTestOTP = firebaseTestNumbers[normalizedPhone] || firebaseTestNumbers[phoneNumber]

    // Check if this is a Firebase test number
    if (expectedTestOTP && otp === expectedTestOTP) {
      console.log("[v0] Firebase test OTP verified for:", phoneNumber)
      const authToken = Buffer.from(`${phoneNumber}:${Date.now()}`).toString("base64")
      
      const response = NextResponse.json({
        success: true,
        message: "OTP যাচাইকরণ সফল",
        authToken,
        phoneNumber,
        verified: true,
      })

      response.cookies.set("authToken", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      })

      return response
    }

    // In development mode, accept any 6-digit OTP
    if (process.env.NODE_ENV !== "production") {
      console.log('[v0] Development mode: Accepting OTP:', otp)
      const authToken = Buffer.from(`${phoneNumber}:${Date.now()}`).toString("base64")
      
      const response = NextResponse.json({
        success: true,
        message: "OTP যাচাইকরণ সফল",
        authToken,
        phoneNumber,
        verified: true,
      })

      response.cookies.set("authToken", authToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      })

      return response
    }

    // If we get here, OTP is wrong
    return NextResponse.json(
      { success: false, message: "ভুল OTP। দয়া করে সঠিক কোড লিখুন।" },
      { status: 401 }
    )
  } catch (error: any) {
    console.error("[v0] OTP verification error:", error.message)
    return NextResponse.json(
      { success: false, message: "সার্ভার ত্রুটি: " + error.message },
      { status: 500 }
    )
  }
}
