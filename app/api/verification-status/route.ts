import { NextResponse, NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone")
    const requestedNid = request.nextUrl.searchParams.get("nid")?.replace(/\D/g, "")

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      )
    }

    const user = await db.query.appUsers.findFirst({
      where: eq(appUsers.phoneNumber, phone),
      columns: {
        nidVerified: true,
        nidNumber: true,
      },
    })

    const normalizedPhone = phone.replace(/[^0-9]/g, "")
    const isDemoAccount = normalizedPhone === "01914255406" || normalizedPhone === "8801914255406"
    const isVerified = !isDemoAccount && user?.nidVerified === true && (!requestedNid || user?.nidNumber === requestedNid)

    return NextResponse.json({
      success: true,
      data: {
        isVerified,
        nidVerified: isVerified,
        faceVerified: false,
        verifiedAt: null,
        nidNumber: user?.nidNumber ?? null,
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
