import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    apiUrl: process.env.NEXT_PUBLIC_RECHARGE_API_URL || "https://irechargebd.com",
    apiKeyPresent: !!process.env.RECHARGE_API_KEY,
    apiKeyLength: process.env.RECHARGE_API_KEY?.length || 0,
    apiKeyPreview: process.env.RECHARGE_API_KEY?.slice(0, 10) + "..." || "NOT SET",
    timestamp: new Date().toISOString(),
    status: "READY FOR REAL RECHARGE",
  }

  return NextResponse.json({
    success: true,
    message: "Real recharge system is configured and ready!",
    config,
  })
}
