import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

function shortenFloats(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shortenFloats)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, shortenFloats(item)]))
  if (typeof value === "number" && !Number.isInteger(value) && value % 1 === 0) return Math.trunc(value)
  return value
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === "object") return Object.keys(value as object).sort().reduce<Record<string, unknown>>((result, key) => {
    result[key] = sortKeys((value as Record<string, unknown>)[key])
    return result
  }, {})
  return value
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-signature-v2") || ""
  const payload = JSON.parse(rawBody) as {
    timestamp?: number | string
    status?: string
    decision?: string
    vendor_data?: string | Record<string, unknown>
    session_id?: string
    data?: { status?: string; vendor_data?: string | Record<string, unknown>; session_id?: string; decision?: string }
  }
  const canonical = JSON.stringify(sortKeys(shortenFloats(payload)))
  const expected = crypto
    .createHmac("sha256", process.env.DIDIT_WEBHOOK_SECRET || "")
    .update(canonical, "utf8")
    .digest("hex")

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (!signature || signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const timestamp = Number(payload.timestamp)
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return NextResponse.json({ error: "Stale webhook" }, { status: 401 })
  }

  const event = payload.data || {}
  const status = String(payload.status || payload.decision || event.status || event.decision || "")
  const approved = status === "Approved"

  // The webhook is the server-side source of truth; browser callbacks are not trusted.
  const vendorDataValue = payload.vendor_data || event.vendor_data
  if (approved && vendorDataValue) {
    const vendorData = typeof vendorDataValue === "string" ? (() => {
      try {
        return JSON.parse(vendorDataValue) as { phoneNumber?: string; phone?: string; nidNumber?: string; nid?: string }
      } catch {
        return { phoneNumber: vendorDataValue }
      }
    })() : vendorDataValue as { phoneNumber?: string; phone?: string; nidNumber?: string; nid?: string }
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
