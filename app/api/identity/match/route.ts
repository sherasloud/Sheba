import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { phone, nidNumber } = await request.json()
    const normalizedPhone = String(phone || "").replace(/\D/g, "")
    const normalizedNid = String(nidNumber || "").replace(/\D/g, "")

    if (!/^01\d{9}$/.test(normalizedPhone) || !/^\d{10,17}$/.test(normalizedNid)) {
      return NextResponse.json({ matched: false, error: "Valid phone and NID are required" }, { status: 400 })
    }

    const user = await db.query.appUsers.findFirst({
      where: and(eq(appUsers.phoneNumber, normalizedPhone), eq(appUsers.nidNumber, normalizedNid)),
      columns: { id: true },
    })

    return NextResponse.json({ matched: Boolean(user) })
  } catch (error) {
    console.error("[v0] Identity match failed:", error)
    return NextResponse.json({ matched: false, error: "Identity verification unavailable" }, { status: 500 })
  }
}
