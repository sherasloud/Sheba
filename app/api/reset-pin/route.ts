import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { accountId, phone, nidNumber, pin } = await request.json()
    const normalizedPhone = String(phone || "").replace(/\D/g, "")
    const normalizedNid = String(nidNumber || "").replace(/\D/g, "")
    if (!accountId || !/^01\d{9}$/.test(normalizedPhone) || !/^\d{10,17}$/.test(normalizedNid) || !/^\d{6}$/.test(String(pin || ""))) {
      return NextResponse.json({ success: false }, { status: 400 })
    }
    const result = await db.update(appUsers).set({ pin: String(pin) }).where(and(
      eq(appUsers.id, accountId),
      eq(appUsers.phoneNumber, normalizedPhone),
      eq(appUsers.nidNumber, normalizedNid),
      eq(appUsers.nidVerified, true),
    )).returning({ id: appUsers.id })
    if (!result.length) return NextResponse.json({ success: false }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] PIN reset failed:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
