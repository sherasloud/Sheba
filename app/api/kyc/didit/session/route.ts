import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appUsers } from "@/lib/db/schema"
import { and, eq, lt } from "drizzle-orm"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const nidType = typeof body.nidType === "string" ? body.nidType : "nid"
  const documentNumber = typeof body.documentNumber === "string" ? body.documentNumber.trim() : typeof body.nidNumber === "string" ? body.nidNumber.trim() : ""

  if (!phone || !/^01\d{9}$/.test(phone) || !/^[A-Za-z0-9-]{5,25}$/.test(documentNumber)) {
    return NextResponse.json({ error: "Valid phone and NID number are required." }, { status: 400 })
  }

  const legacyCutoff = new Date("2026-10-09T00:00:00.000Z")
  const legacyUser = await db.query.appUsers.findFirst({
    where: and(eq(appUsers.phoneNumber, phone), eq(appUsers.nidNumber, documentNumber), lt(appUsers.createdAt, legacyCutoff)),
    columns: { id: true },
  })
  if (!legacyUser) {
    return NextResponse.json({ error: "This recovery flow is only available for legacy accounts." }, { status: 403 })
  }

  const callbackUrl = process.env.DIDIT_CALLBACK_URL || "https://shebabd.shebabd.org/api/kyc/didit/callback"
  const response = await fetch("https://verification.didit.me/v3/session/", {
    method: "POST",
    headers: {
      "x-api-key": process.env.DIDIT_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: process.env.DIDIT_WORKFLOW_ID,
      callback: callbackUrl,
      callback_method: "both",
      vendor_data: JSON.stringify({ phone, nidType, nidNumber: documentNumber }),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.url) {
    console.error("[v0] Didit session creation failed", response.status, data)
    return NextResponse.json({ error: "Unable to start identity verification." }, { status: 502 })
  }

  return NextResponse.json({
    url: data.url,
    sessionId: data.session_id || data.id,
    sessionToken: data.session_token,
  })
}
