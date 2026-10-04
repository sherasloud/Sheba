import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { accountId, phone, pin } = await request.json()
    if (!accountId || !/^01\d{9}$/.test(String(phone || "")) || !/^\d{6}$/.test(String(pin || ""))) {
      return NextResponse.json({ success: false }, { status: 400 })
    }
    const result = await db.update(appUsers).set({ pin: String(pin) }).where(and(eq(appUsers.id, accountId), eq(appUsers.phoneNumber, phone))).returning({ id: appUsers.id })
    if (!result.length) return NextResponse.json({ success: false }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] PIN reset failed:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
