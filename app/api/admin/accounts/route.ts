import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all profiles from database
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("phone", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to account format
    const accounts = profiles.map((profile: any) => ({
      id: `${profile.phone}-${profile.account_type}`,
      phone: profile.phone,
      name: profile.name || "Unknown",
      account_type: profile.account_type,
      balance: profile.balance || 0,
    }))

    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
