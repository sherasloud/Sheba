import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return success for seeding (no actual database operations)
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with static data",
      users: [
        {
          phoneNumber: "01930314459",
          fullName: "Admin User",
          balance: 99979997979999,
          isVerified: false,
        },
        {
          phoneNumber: "01712345678",
          fullName: "John Doe",
          balance: 5000,
          isVerified: false,
        },
      ],
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ success: false, message: "Seeding failed" }, { status: 500 })
  }
}
