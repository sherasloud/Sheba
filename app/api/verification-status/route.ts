import { createClient } from "@/lib/supabase/server"
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

    const supabase = await createClient()

    // Fetch user verification status
    const { data, error } = await supabase
      .from("profiles")
      .select("is_nid_verified, nid_verified_at, nid_number, face_verified, face_verified_at")
      .eq("phone", phone)
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Safely convert NULL/undefined to false for verification fields
    const nidVerified = data.is_nid_verified === true
    const faceVerified = data.face_verified === true
    
    // User is only verified if BOTH NID and face verification are complete
    const isFullyVerified = nidVerified && faceVerified

    console.log("[v0] API Verification Status - NID:", nidVerified, "Face:", faceVerified, "Fully Verified:", isFullyVerified)

    return NextResponse.json({
      success: true,
      data: {
        isVerified: isFullyVerified,
        nidVerified,
        faceVerified,
        verifiedAt: data.nid_verified_at || null,
        nidNumber: data.nid_number || null,
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
