import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-signature-v2") || ""
  const expected = crypto
    .createHmac("sha256", process.env.DIDIT_WEBHOOK_SECRET || "")
    .update(rawBody)
    .digest("hex")

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (!signature || signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const payload = JSON.parse(rawBody) as {
    status?: string
    decision?: string
    vendor_data?: string
    session_id?: string
    data?: { status?: string; vendor_data?: string; session_id?: string; decision?: string }
  }
  const event = payload.data || {}
  const status = String(payload.status || payload.decision || event.status || event.decision || "").toLowerCase()
  const approved = ["approved", "completed", "success"].includes(status)

  // The webhook is the server-side source of truth; browser callbacks are not trusted.
  const vendorDataValue = payload.vendor_data || event.vendor_data
  if (approved && vendorDataValue) {
    const vendorData = (() => {
      try {
        return JSON.parse(vendorDataValue) as { phoneNumber?: string; phone?: string; nidNumber?: string; nid?: string }
      } catch {
        return { phoneNumber: vendorDataValue }
      }
    })()
    const phoneNumber = String(vendorData.phoneNumber || vendorData.phone || "").replace(/\D/g, "")
    const nidNumber = String(vendorData.nidNumber || vendorData.nid || "").replace(/\D/g, "")
    const sessionId = String(payload.session_id || event.session_id || "")

    if (phoneNumber) {
      await db.update(appUsers).set({
        diditVerified: true,
        nidVerified: true,
        ...(nidNumber ? { nidNumber } : {}),
        updatedAt: new Date(),
      }).where(eq(appUsers.phoneNumber, phoneNumber))
      console.log("[v0] Didit verification saved", { phoneNumber, hasNid: Boolean(nidNumber), hasSession: Boolean(sessionId) })
    }
  }

  return NextResponse.json({ received: true })
}
