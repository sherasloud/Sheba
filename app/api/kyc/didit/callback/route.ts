import { NextRequest, NextResponse } from "next/server"

const successStatuses = new Set(["approved", "completed", "success", "verified"])

function getRedirectResponse(request: NextRequest, status: string, sessionId: string) {
  const normalizedStatus = status.toLowerCase()
  const destination = successStatuses.has(normalizedStatus) ? "/?verified=success" : `/onboarding?kyc=${encodeURIComponent(normalizedStatus || "pending")}`
  const response = NextResponse.redirect(new URL(destination, request.url), 303)

  if (sessionId) response.cookies.set("didit_session_id", sessionId, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" })
  return response
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") || request.nextUrl.searchParams.get("decision") || ""
  const sessionId = request.nextUrl.searchParams.get("verificationSessionId") || request.nextUrl.searchParams.get("session_id") || request.nextUrl.searchParams.get("sessionId") || ""
  return getRedirectResponse(request, status, sessionId)
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const status = String(body.status || body.decision || body.event?.status || body.data?.status || "")
  const sessionId = String(body.verificationSessionId || body.session_id || body.sessionId || body.event?.session_id || body.data?.session_id || "")
  return getRedirectResponse(request, status, sessionId)
}
