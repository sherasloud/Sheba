import { NextRequest, NextResponse } from "next/server"

const successStatuses = new Set(["approved", "completed", "success", "verified"])

export async function GET(request: NextRequest) {
  const status = (request.nextUrl.searchParams.get("status") || request.nextUrl.searchParams.get("decision") || "").toLowerCase()
  const sessionId = request.nextUrl.searchParams.get("verificationSessionId") || request.nextUrl.searchParams.get("session_id") || request.nextUrl.searchParams.get("sessionId") || ""
  const destination = successStatuses.has(status) ? "/?verified=success" : `/onboarding?kyc=${encodeURIComponent(status || "pending")}`
  const response = NextResponse.redirect(new URL(destination, request.url))

  if (sessionId) response.cookies.set("didit_session_id", sessionId, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" })
  return response
}
