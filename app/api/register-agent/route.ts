import { type NextRequest, NextResponse } from "next/server"
import { addUser, findUserByPhone } from "@/lib/data/static-data"

export async function POST(request: NextRequest) {
  // Simulate an admin API key for internal use
  const adminApiKey = request.headers.get("X-Admin-API-Key")
  if (adminApiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 })
  }

  try {
    const { phoneNumber, fullName, pin } = await request.json()

    // Validate input
    if (!phoneNumber || !fullName || !pin) {
      return NextResponse.json(
        { success: false, message: "Phone number, full name, and PIN are required." },
        { status: 400 },
      )
    }

    if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
      return NextResponse.json({ success: false, message: "Invalid 11-digit phone number." }, { status: 400 })
    }

    // Check if user already exists
    if (findUserByPhone(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "User with this phone number already exists." },
        { status: 409 },
      )
    }

    // Validate PIN format (6 digits)
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ success: false, message: "PIN must be a 6-digit number." }, { status: 400 })
    }

    // Add new agent user
    const newAgent = addUser({
      phoneNumber,
      fullName,
      pin,
      isAgent: true, // Mark as agent
      balance: 0, // Agents start with 0 balance
      isVerified: false, // Agents must complete NID verification
      accountNumber: `AGENT${Date.now()}`, // Unique account number for agents
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Agent account created successfully.",
      agent: {
        phoneNumber: newAgent.phoneNumber,
        fullName: newAgent.fullName,
        accountNumber: newAgent.accountNumber,
        isAgent: newAgent.isAgent,
      },
    })
  } catch (error) {
    console.error("Agent registration error:", error)
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 })
  }
}
