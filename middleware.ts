import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]
  if (hostname === "shebabd.org" || hostname === "www.shebabd.org") {
    const pathname = request.nextUrl.pathname
    if (pathname === "/" || pathname === "/blog") {
      const response = NextResponse.rewrite(new URL(pathname === "/" ? "/website" : "/website/blog", request.url))
      return response
    }
  }

  const response = NextResponse.next()
  if (request.nextUrl.pathname === "/recharge") response.headers.set("X-Sanitize-Storage", "true")
  return response
}

export const config = {
  matcher: ["/recharge/:path*", "/", "/blog"],
}
