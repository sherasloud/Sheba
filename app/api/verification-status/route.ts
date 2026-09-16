import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone")

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      )
    }

    // For now, return unverified status
    // Full verification will be implemented when database is properly configured
    console.log("[v0] Verification Status API - Returning unverified for phone:", phone)

    return NextResponse.json({
      success: true,
      data: {
        isVerified: false,
        nidVerified: false,
        faceVerified: false,
        verifiedAt: null,
        nidNumber: null,
      },
    })
  } catch (error) {
    console.error("[v0] Error in verification-status:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
