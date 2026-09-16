import { type NextRequest, NextResponse } from "next/server"
import { updateUserName } from "@/lib/data/static-data"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, newName } = await request.json()

    if (!phoneNumber || !newName) {
      return NextResponse.json({ error: "Phone number and new name are required" }, { status: 400 })
    }

    if (newName.trim().length < 2 || newName.trim().length > 50) {
      return NextResponse.json({ error: "Name must be between 2 and 50 characters" }, { status: 400 })
    }

    // Update user name in the database
    const success = updateUserName(phoneNumber, newName.trim())

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Name updated successfully",
        newName: newName.trim(),
      })
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Update name error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
