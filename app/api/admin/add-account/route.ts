import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { name, phone, account_type } = await request.json()

    if (!name || !phone || !account_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        phone,
        name,
        account_type,
        pin: "123456",
        balance: account_type === "state" ? 20000 : account_type === "business" ? 50000 : 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error adding account:", error)
    return NextResponse.json(
      { error: "Failed to add account" },
      { status: 500 }
    )
  }
}
