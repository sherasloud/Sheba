import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"

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
  }
  const status = String(payload.status || payload.decision || "").toLowerCase()
  const approved = ["approved", "completed", "success"].includes(status)

  // Persist the verified decision in the account/KYC store here. The webhook is
  // the server-side source of truth; the browser callback is not trusted.
  console.log("[v0] Didit KYC decision", {
    sessionId: payload.session_id,
    approved,
    vendorData: payload.vendor_data,
  })

  return NextResponse.json({ received: true })
}
