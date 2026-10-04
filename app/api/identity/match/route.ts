import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { nidNumber } = await request.json()
    const normalizedNid = String(nidNumber || "").replace(/\D/g, "")

    if (!/^\d{10,17}$/.test(normalizedNid)) {
      return NextResponse.json({ matched: false, error: "Valid NID is required" }, { status: 400 })
    }

    const user = await db.query.appUsers.findFirst({
      where: eq(appUsers.nidNumber, normalizedNid),
      columns: { id: true, phoneNumber: true },
    })

    if (!user) return NextResponse.json({ matched: false })
    const phone = user.phoneNumber
    const maskedPhone = `${phone.slice(0, 3)}*****${phone.slice(-2)}`
    return NextResponse.json({ matched: true, userId: user.id, phoneNumber: phone, maskedPhone })
  } catch (error) {
    console.error("[v0] Identity match failed:", error)
    return NextResponse.json({ matched: false, error: "Identity verification unavailable" }, { status: 500 })
  }
}
