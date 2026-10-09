import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

const successStatuses = new Set(["approved", "completed", "success", "verified"])

function getRedirectResponse(request: NextRequest, status: string, sessionId: string) {
  const normalizedStatus = status.toLowerCase()
  const destination = successStatuses.has(normalizedStatus) ? "/?verified=success" : `/onboarding?kyc=${encodeURIComponent(normalizedStatus || "pending")}`
  const response = NextResponse.redirect(new URL(destination, request.url), 303)
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")

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
  const payload = body.data || body.event || body
  const status = String(body.status || body.decision || payload.status || payload.decision || "")
  const sessionId = String(body.verificationSessionId || body.session_id || body.sessionId || payload.verificationSessionId || payload.session_id || payload.sessionId || "")
  return getRedirectResponse(request, status, sessionId)
}
