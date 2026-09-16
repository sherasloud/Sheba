import { type NextRequest, NextResponse } from "next/server"
import { getUserBalance as getSupabaseBalance, updateUserBalance } from "@/lib/api/supabase-balance-service"

export async function GET(request: NextRequest) {
  try {
    const phoneNumber = request.nextUrl.searchParams.get("phone")

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    console.log(`[v0] BALANCE API GET: Fetching balance for ${phoneNumber}`)

    const balance = await getSupabaseBalance(phoneNumber)
    console.log(`[v0] BALANCE API GET: Found balance ${balance} for ${phoneNumber}`)

    return NextResponse.json({
      balance,
      phone: phoneNumber,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] BALANCE API GET Error:", error)
    return NextResponse.json({ error: "Failed to get balance" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, balance } = await request.json()

    if (!phoneNumber || balance === undefined) {
      return NextResponse.json({ error: "Phone number and balance are required" }, { status: 400 })
    }

    console.log(`[v0] BALANCE API POST: Updating balance for ${phoneNumber} to ${balance}`)

    const success = await updateUserBalance(phoneNumber, balance)

    if (!success) {
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
    }

    console.log(`[v0] BALANCE API POST: Successfully updated balance for ${phoneNumber}`)

    return NextResponse.json({
      success: true,
      balance,
      phone: phoneNumber,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] BALANCE API POST Error:", error)
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 })
  }
}
