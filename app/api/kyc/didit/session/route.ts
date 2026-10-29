import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const nidType = typeof body.nidType === "string" ? body.nidType : "nid"
  const documentNumber = typeof body.documentNumber === "string" ? body.documentNumber.trim() : typeof body.nidNumber === "string" ? body.nidNumber.trim() : ""

  if (!phone || !/^01\d{9}$/.test(phone) || !/^[A-Za-z0-9-]{5,25}$/.test(documentNumber)) {
    return NextResponse.json({ error: "Valid phone and NID number are required." }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const apiKey = process.env.DIDIT_API_KEY || process.env.DIDIT_API_KEY_2 || process.env.DIDIT_API_KEY_3
  const workflowId = process.env.DIDIT_WORKFLOW_ID

  if (!apiKey || !workflowId) {
    return NextResponse.json({ error: "Identity verification is not configured." }, { status: 503 })
  }

  const response = await fetch("https://verification.didit.me/v3/session/", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      callback: `${origin}/kyc/didit/callback`,
      vendor_data: JSON.stringify({ phone, nidType, nidNumber: documentNumber }),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.url) {
    console.error("[v0] Didit session creation failed", response.status, data)
    const upstreamError = typeof data.detail === "string" ? data.detail : typeof data.message === "string" ? data.message : "Unable to start identity verification."
    return NextResponse.json({ error: upstreamError }, { status: 502 })
  }

  return NextResponse.json({ url: data.url, sessionId: data.session_id || data.id })
}
