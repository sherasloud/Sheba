import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"

// Validate NID format (Bangladesh NID is typically 10-17 digits)
function isValidNID(nid: string): boolean {
  const nidRegex = /^\d{10,17}$/
  return nidRegex.test(nid.trim())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nidNumber, phone, faceVerified } = body

    // Validate inputs
    if (!nidNumber || !phone) {
      return NextResponse.json(
        { success: false, message: "NID number and phone are required" },
        { status: 400 }
      )
    }

    // Validate NID format
    if (!isValidNID(nidNumber)) {
      return NextResponse.json(
        { success: false, message: "Invalid NID format. NID should be 10-17 digits." },
        { status: 400 }
      )
    }

    // Validate face verification
    if (!faceVerified) {
      return NextResponse.json(
        { success: false, message: "Face verification is required. Please complete video KYC." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update user profile with NID info and face verification
    const { data, error } = await supabase
      .from("profiles")
      .update({
        nid_number: nidNumber.trim(),
        is_nid_verified: true,
        nid_verified_at: new Date().toISOString(),
        face_verified: true,
        face_verified_at: new Date().toISOString(),
      })
      .eq("phone", phone)
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json(
        { success: false, message: "Failed to verify NID. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "NID and face verified successfully!",
      data: {
        nidNumber: data.nid_number,
        isVerified: data.is_nid_verified,
        faceVerified: data.face_verified,
        verifiedAt: data.nid_verified_at,
      },
    })
  } catch (error) {
    console.error("[v0] Error in verify-nid:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
