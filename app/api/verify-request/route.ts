import { createClient } from "@/lib/supabase/server"
import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    let query = supabase
      .from("verification_requests")
      .select("*")
      .order("submitted_at", { ascending: false })

    // If phone is provided, filter by phone
    if (phone) {
      query = query.eq("phone", phone)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching verification requests:", error.message)
      return NextResponse.json(
        { success: false, message: "Failed to fetch verification requests" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error("[v0] Error in GET /api/verify-request:", error.message)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, action, adminPhone } = body

    // Validate admin
    if (adminPhone !== "01709783145" && adminPhone !== "01930314459") {
      return NextResponse.json(
        { success: false, message: "Only admin can approve/reject verification requests" },
        { status: 403 }
      )
    }

    if (!requestId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid request parameters" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the verification request
    const { data: verificationRequest, error: fetchError } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (fetchError || !verificationRequest) {
      return NextResponse.json(
        { success: false, message: "Verification request not found" },
        { status: 404 }
      )
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    // Update verification request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from("verification_requests")
      .update({
        status: newStatus,
        reviewed_by: adminPhone,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error updating verification request:", updateError.message)
      return NextResponse.json(
        { success: false, message: "Failed to update verification request" },
        { status: 500 }
      )
    }

    // If approved, update the user profile
    if (action === "approve") {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nid_number: verificationRequest.nid_number,
          is_nid_verified: true,
          nid_verified_at: new Date().toISOString(),
          face_verified: true,
          face_verified_at: new Date().toISOString(),
        })
        .eq("phone", verificationRequest.phone)

      if (profileError) {
        console.error("[v0] Error updating profile:", profileError.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification request ${newStatus} successfully!`,
      data: updatedRequest,
    })
  } catch (error: any) {
    console.error("[v0] Error in PUT /api/verify-request:", error.message)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}
