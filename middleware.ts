import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add header to load sanitizer before app
  if (request.nextUrl.pathname === "/recharge") {
    response.headers.set("X-Sanitize-Storage", "true")
  }

  return response
}

export const config = {
  matcher: "/recharge/:path*",
}
