import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json()

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Create institution account
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        phone: phone,
        name: `${name} (Institution)`,
        account_type: "institution",
        pin: "000000",
        balance: 0,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add institution" }, { status: 500 })
  }
}
