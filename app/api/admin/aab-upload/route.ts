import { handleUpload } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { isAdminPhone } from "@/lib/account-manager"

export const runtime = "nodejs"

const MAX_AAB_SIZE = 200 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clientPayload = body?.payload ? JSON.parse(body.payload) : null
    const adminPhone = typeof clientPayload?.adminPhone === "string" ? clientPayload.adminPhone : ""

    if (!isAdminPhone(adminPhone)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ["application/vnd.android.package-archive", "application/octet-stream"],
        maximumSizeInBytes: MAX_AAB_SIZE,
        tokenPayload: JSON.stringify({ adminPhone, pathname }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("[v0] AAB uploaded:", blob.pathname)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[v0] AAB upload token error:", error)
    return NextResponse.json({ error: "Could not prepare AAB upload" }, { status: 500 })
  }
}
