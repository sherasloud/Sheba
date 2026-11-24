import { NextRequest, NextResponse } from "next/server"
import { verifyStoredOTP } from "@/lib/otp-store"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = typeof body?.phone === "string" ? body.phone.trim() : ""
    const otp = typeof body?.otp === "string" ? body.otp.trim() : ""

    if (!/^01[3-9]\d{8}$/.test(phone) || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "সঠিক মোবাইল নম্বর ও ৬ সংখ্যার OTP দিন।" },
        { status: 400 },
      )
    }

    console.log('[v0] Verifying OTP for phone:', phone)

    // Verify OTP against the Redis-backed store
    const result = await verifyStoredOTP(phone, otp)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      )
    }

    // OTP verified successfully - check Neon database for existing user
    let existingUser = null
    
    try {
      existingUser = await db.query.appUsers.findFirst({
        where: eq(appUsers.phoneNumber, phone),
      })
      console.log('[v0] Neon database check complete. User exists:', !!existingUser, 'Phone:', phone)
    } catch (dbError: any) {
      console.error('[v0] Neon database error during OTP verification:', dbError.message)
      existingUser = null
    }

    // Create session/auth token
    const authToken = Buffer.from(`${phone}:${Date.now()}`).toString("base64")

    // Set secure httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "OTP verification successful",
      authToken,
      phone,
      verified: true,
      exists: !!existingUser, // Include user existence status
      user: existingUser ? {
        phoneNumber: existingUser.phoneNumber,
        fullName: existingUser.fullName,
        balance: existingUser.balance,
        accountType: existingUser.accountType,
      } : null,
    })

    response.cookies.set("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("[v0] OTP verification error:", error.message)
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    )
  }
}
